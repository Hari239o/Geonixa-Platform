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
   * Enhanced multi-person detection with confidence scoring
   */
  analyzeMultiPersonPresence(
    predictions: any[],
    confidenceThreshold: number = 0.35 // More lenient threshold
  ): { count: number; confidence: number; details: any[] } {
    const persons = predictions.filter(
      (p: any) => p.class === "person" && p.score >= confidenceThreshold
    );

    // Even partial detections count
    const partialPersons = predictions.filter(
      (p: any) => p.class === "person" && p.score >= 0.25
    );

    const details = partialPersons.map((p: any) => ({
      class: p.class,
      score: p.score,
      bbox: p.bbox,
    }));

    return {
      count: Math.max(persons.length, partialPersons.length > 0 ? 2 : 1),
      confidence: persons.length > 1 ? 0.95 : 0.7,
      details,
    };
  }

  /**
   * Enhanced phone/mobile device detection
   * Includes secondary detection methods
   */
  analyzePhonePresence(
    predictions: any[],
    confidenceThreshold: number = 0.35
  ): {
    detected: boolean;
    confidence: number;
    type: string;
    details: any;
  } {
    // Extended keyword list with variations and related objects
    const mobileKeywords = [
      "cell phone",
      "mobile phone",
      "phone",
      "smartphone",
      "iphone",
      "android",
      "remote",
      "laptop",
      "keyboard",
      "monitor",
      "tv",
      "screen",
      "tablet",
      "ipad",
      "book",
      "paper",
      "document",
      "notepad"
    ];

    // Primary detection: direct object detection
    const phone = predictions.find(
      (p: any) => {
        const className = p.class.toLowerCase();
        const isMatch = mobileKeywords.some((keyword) =>
          className.includes(keyword)
        );
        return isMatch && p.score >= confidenceThreshold;
      }
    );

    if (phone) {
      return {
        detected: true,
        confidence: Math.min(1, phone.score + 0.15), // Significant confidence boost
        type: phone.class,
        details: { bbox: phone.bbox, score: phone.score },
      };
    }

    // Secondary detection: look for multiple objects or hands with objects
    const handsWithObjects = predictions.filter(
      (p: any) =>
        (p.class.toLowerCase().includes("hand") ||
          p.class.toLowerCase().includes("laptop") ||
          p.class.toLowerCase().includes("keyboard") ||
          p.class.toLowerCase().includes("mouse")) &&
        p.score >= 0.45
    );

    if (handsWithObjects.length > 0) {
      return {
        detected: true,
        confidence: 0.70,
        type: "object_with_hand",
        details: { itemCount: handsWithObjects.length, items: handsWithObjects.map(p => p.class) },
      };
    }

    // Tertiary detection: suspicious objects that might be phones
    const suspiciousObjects = predictions.filter(
      (p: any) => {
        const className = p.class.toLowerCase();
        return (
          (className.includes("person") && className.includes("object")) ||
          className.includes("thing") ||
          className.includes("object")
        ) && p.score >= 0.50
      }
    );

    if (suspiciousObjects.length > 0) {
      return {
        detected: true,
        confidence: 0.60,
        type: "suspicious_object",
        details: { itemCount: suspiciousObjects.length },
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

    // Detect speech: moderate frequency (300-3500Hz), variable amplitude
    const isSpeech =
      dominantFrequency > 300 &&
      dominantFrequency < 3500 &&
      variance > 0.02 &&
      normalizedLevel > 15;

    // Detect loud noise: sudden spike or sustained high level
    // SYNCED WITH AIProctor thresholds: 45% = loud, 30% = moderate
    const recentAvg =
      this.audioLevelHistory.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const isLoudNoise = normalizedLevel > 45 || recentAvg > 40;

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
