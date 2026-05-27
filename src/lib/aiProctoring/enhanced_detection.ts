/**
 * Enhanced Detection Module
 * Improved detection algorithms for:
 * - Face positioning and centering
 * - Multi-person/object detection
 * - Phone and device detection
 * - Audio anomaly detection
 */

export interface FacePositionData {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  confidence: number;
  isCentered: boolean;
  offsetX: number; // Distance from ideal center
  offsetY: number;
  scalingFactor: number; // Face size relative to frame
}

export interface AudioAnalysis {
  level: number; // 0-100
  frequency: number; // dominant frequency
  isSpeech: boolean;
  isLoudNoise: boolean;
  confidence: number;
}

export class EnhancedDetectionEngine {
  private static readonly OPTIMAL_FACE_SCALE = 0.35; // Face should be ~35% of frame
  private static readonly OPTIMAL_FACE_SCALE_MIN = 0.15;
  private static readonly OPTIMAL_FACE_SCALE_MAX = 0.6;
  private static readonly CENTER_TOLERANCE = 0.15; // 15% tolerance from center
  
  private audioFrequencyHistory: number[] = [];
  private audioLevelHistory: number[] = [];
  private readonly HISTORY_SIZE = 20;

  constructor() {
    this.audioFrequencyHistory = [];
    this.audioLevelHistory = [];
  }

  /**
   * Analyze face position and centering
   */
  analyzeFacePosition(
    faces: any[],
    videoWidth: number,
    videoHeight: number
  ): FacePositionData | null {
    if (!faces || faces.length === 0) return null;

    const face = faces[0];
    if (!face.topLeft || !face.bottomRight) return null;

    const [x1, y1] = face.topLeft as [number, number];
    const [x2, y2] = face.bottomRight as [number, number];

    const faceWidth = x2 - x1;
    const faceHeight = y2 - y1;
    const faceCenterX = x1 + faceWidth / 2;
    const faceCenterY = y1 + faceHeight / 2;

    const frameCenter = videoWidth / 2;
    const frameCenterY = videoHeight / 2;

    const scalingFactor = (faceWidth / videoWidth + faceHeight / videoHeight) / 2;
    const offsetX = Math.abs(faceCenterX - frameCenter) / frameCenter;
    const offsetY = Math.abs(faceCenterY - frameCenterY) / frameCenterY;

    const isCentered =
      scalingFactor >= EnhancedDetectionEngine.OPTIMAL_FACE_SCALE_MIN &&
      scalingFactor <= EnhancedDetectionEngine.OPTIMAL_FACE_SCALE_MAX &&
      offsetX <= EnhancedDetectionEngine.CENTER_TOLERANCE &&
      offsetY <= EnhancedDetectionEngine.CENTER_TOLERANCE;

    return {
      centerX: faceCenterX,
      centerY: faceCenterY,
      width: faceWidth,
      height: faceHeight,
      confidence: 0.95,
      isCentered,
      offsetX,
      offsetY,
      scalingFactor,
    };
  }

  /**
   * Enhanced multi-person detection with high sensitivity
   */
  analyzeMultiPersonPresence(
    predictions: any[],
    confidenceThreshold: number = 0.20
  ): { count: number; confidence: number; details: any[] } {
    const persons = predictions.filter(
      (p: any) => p.class === "person" && p.score >= confidenceThreshold
    );

    const details = persons.map((p: any) => ({
      class: p.class,
      score: p.score,
      bbox: p.bbox,
    }));

    return {
      count: persons.length,
      confidence: persons.length > 1 ? 0.95 : persons.length === 1 ? 0.75 : 0,
      details,
    };
  }

  /**
   * Enhanced phone/mobile device detection
   * Includes secondary detection methods
   */
  analyzePhonePresence(
    predictions: any[],
    confidenceThreshold: number = 0.20
  ): {
    detected: boolean;
    confidence: number;
    type: string;
    details: any;
  } {
    const phoneClasses = [
      "cell phone",
      "mobile phone",
      "phone",
      "smartphone",
      "iphone",
      "tablet",
      "ipad",
      "laptop",
      "monitor",
      "tv",
      "screen"
    ];

    const phone = predictions.find((p: any) => {
      const className = p.class.toLowerCase();
      return phoneClasses.some((keyword) => className === keyword || className.includes(keyword)) && p.score >= confidenceThreshold;
    });

    if (phone) {
      return {
        detected: true,
        confidence: Math.min(1, phone.score + 0.22),
        type: phone.class,
        details: { bbox: phone.bbox, score: phone.score },
      };
    }

    const nearDevice = predictions.filter((p: any) => {
      const className = p.class.toLowerCase();
      return (
        className === "laptop" ||
        className === "monitor" ||
        className === "tv" ||
        className === "screen" ||
        className === "tablet"
      ) && p.score >= 0.45;
    });

    if (nearDevice.length > 0) {
      const primary = nearDevice[0];
      return {
        detected: true,
        confidence: Math.min(1, primary.score + 0.15),
        type: primary.class,
        details: { bbox: primary.bbox, score: primary.score, items: nearDevice.map((p) => p.class) },
      };
    }

    return {
      detected: false,
      confidence: 0,
      type: "none",
      details: {},
    };
  }

  /**
   * Enhanced audio analysis with speech vs noise differentiation
   */
  analyzeAudioLevel(
    frequencyData: Uint8Array,
    levelRms: number
  ): AudioAnalysis {
    // Normalize frequency data
    const normalized = Array.from(frequencyData).map((v) => v / 255);
    const avg = normalized.reduce((a, b) => a + b, 0) / normalized.length;

    // Detect dominant frequency
    const maxIdx = frequencyData.reduce(
      (maxIdx, val, idx) => (val > frequencyData[maxIdx] ? idx : maxIdx),
      0
    );
    const dominantFrequency = (maxIdx / frequencyData.length) * 8000; // Assuming 16kHz sampling

    // Calculate variance for speech detection
    const variance =
      normalized.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) /
      normalized.length;

    // Normalize RMS level (0-100 scale)
    const normalizedLevel = Math.min(100, levelRms * 100);

    // Track history
    this.audioFrequencyHistory.push(dominantFrequency);
    this.audioLevelHistory.push(normalizedLevel);
    if (this.audioFrequencyHistory.length > this.HISTORY_SIZE) {
      this.audioFrequencyHistory.shift();
      this.audioLevelHistory.shift();
    }

    // Detect speech: moderate frequency range and some variance
    const isSpeech =
      dominantFrequency > 250 &&
      dominantFrequency < 3500 &&
      variance > 0.015 &&
      normalizedLevel > 18;

    // Detect loud noise: favor speech-driven loud segments (sustained talking)
    const recentWindow = this.audioLevelHistory.slice(-6);
    const recentAvg = recentWindow.length ? recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length : normalizedLevel;
    // Immediate loud spike + speech OR sustained recent average above threshold
    const isLoudNoise = (normalizedLevel > 60 && isSpeech) || recentAvg > 50;

    return {
      level: normalizedLevel,
      frequency: dominantFrequency,
      isSpeech,
      isLoudNoise,
      confidence: 0.85,
    };
  }

  /**
   * Get face centering guidance message
   */
  getFaceCenteringGuidance(faceData: FacePositionData | null): string {
    if (!faceData) return "🟡 Position face in camera";

    // Check size first
    if (faceData.scalingFactor < EnhancedDetectionEngine.OPTIMAL_FACE_SCALE_MIN) {
      return "📍 Face too small - Move CLOSER to camera";
    }
    if (faceData.scalingFactor > EnhancedDetectionEngine.OPTIMAL_FACE_SCALE_MAX) {
      return "📍 Face too large - Move AWAY from camera";
    }

    // Check horizontal centering
    if (faceData.offsetX > EnhancedDetectionEngine.CENTER_TOLERANCE) {
      if (faceData.centerX < (faceData.width / 2)) {
        return "📍 CENTER: Move FACE RIGHT ↗️";
      } else {
        return "📍 CENTER: Move FACE LEFT ↖️";
      }
    }

    // Check vertical centering
    if (faceData.offsetY > EnhancedDetectionEngine.CENTER_TOLERANCE) {
      if (faceData.centerY < (faceData.height / 2)) {
        return "📍 CENTER: Move FACE DOWN ↓";
      } else {
        return "📍 CENTER: Move FACE UP ↑";
      }
    }

    // All good
    return "✅ FACE PERFECTLY CENTERED";
  }

  /**
   * Reset detection history
   */
  reset(): void {
    this.audioFrequencyHistory = [];
    this.audioLevelHistory = [];
  }
}
