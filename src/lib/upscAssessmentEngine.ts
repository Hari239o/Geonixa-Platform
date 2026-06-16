export type AssessmentQuestion = {
  q: string;
  opts: string[];
  correctAnswer: string;
  patternKey?: string;
  difficulty?: string;
  questionCode?: string;
  antiCopySalt?: string;
  optionSetHash?: string;
  sequenceFingerprint?: string;
  formVersion?: string;
};

type AssessmentKind = "aptitude" | "grammar";

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
};

export const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  let m = array.length;
  let t: T;
  let i: number;
  const copy = [...array];

  while (m) {
    seed = hashString(`${seed}:${m}:upsc`);
    i = seed % m--;
    t = copy[m];
    copy[m] = copy[i];
    copy[i] = t;
  }

  return copy;
};

export const inferAptitudePattern = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes("probability") || q.includes("balls") || q.includes("dice")) return "probability";
  if (q.includes("ratio") || q.includes("percent") || q.includes("%") || q.includes("average")) return "ratio-percent";
  if (q.includes("train") || q.includes("boat") || q.includes("speed") || q.includes("walk")) return "time-distance";
  if (q.includes("pipe") || q.includes("work") || q.includes("worker") || q.includes("contractor")) return "work-rate";
  if (q.includes("interest") || q.includes("investment") || q.includes("budget") || q.includes("profit")) return "economy-arithmetic";
  if (q.includes("coded") || q.includes("series") || q.includes("odd") || q.includes("sequence")) return "reasoning-pattern";
  if (q.includes("statement") || q.includes("conclusion") || q.includes("assumption")) return "logical-inference";
  if (q.includes("cube") || q.includes("area") || q.includes("perimeter") || q.includes("map")) return "geometry";
  return "advanced-csat";
};

export const inferGrammarPattern = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes("error") || q.includes("incorrect") || q.includes("spot")) return "error-detection";
  if (q.includes("clause") || q.includes("modifier") || q.includes("parallel")) return "syntax-analysis";
  if (q.includes("reported") || q.includes("direct") || q.includes("indirect")) return "narration";
  if (q.includes("passive") || q.includes("active")) return "voice";
  if (q.includes("preposition") || q.includes("article") || q.includes("phrasal")) return "usage";
  if (q.includes("idiom") || q.includes("one word") || q.includes("substitute")) return "idiom-lexis";
  if (q.includes("synonym") || q.includes("antonym") || q.includes("meaning")) return "vocabulary";
  if (q.includes("punctuat") || q.includes("spelled") || q.includes("spelling")) return "mechanics";
  if (q.includes("sentence") || q.includes("alternative") || q.includes("tense")) return "advanced-grammar";
  return "critical-english";
};

const getPattern = (kind: AssessmentKind, question: AssessmentQuestion) => {
  if (question.patternKey) return question.patternKey;
  return kind === "aptitude" ? inferAptitudePattern(question.q) : inferGrammarPattern(question.q);
};

const withAntiCopyMarkers = (
  question: AssessmentQuestion,
  seed: number,
  index: number,
  kind: AssessmentKind,
  sequenceFingerprint: string,
): AssessmentQuestion => {
  const optionSeed = seed + ((index + 1) * 193) + (kind === "grammar" ? 1709 : 3101);
  const rawOpts = question.opts?.length ? question.opts 
    : (question as any).options?.length ? (question as any).options 
    : (question as any).choices?.length ? (question as any).choices 
    : (question as any).mcqOptions?.length ? (question as any).mcqOptions 
    : [];
  const opts = seededShuffle(rawOpts, optionSeed);
  const patternKey = getPattern(kind, question);
  const prefix = kind === "aptitude" ? "APT" : "GRM";
  const optionSetHash = hashString(`${question.q}|${opts.join("|")}|${optionSeed}`).toString(36).toUpperCase();
  const antiCopySalt = hashString(`${sequenceFingerprint}:${index}:${question.q}`).toString(36).toUpperCase();

  return {
    ...question,
    opts,
    patternKey,
    difficulty: question.difficulty || "UPSC-Hard",
    questionCode: `${prefix}-${optionSetHash.padStart(6, "0").slice(0, 6)}`,
    antiCopySalt,
    optionSetHash,
    sequenceFingerprint,
    formVersion: `${prefix}-DYNAMIC-V3`,
  };
};

export const buildUpscQuestionSet = (
  pool: AssessmentQuestion[],
  seed: number,
  kind: AssessmentKind,
  count = 30,
) => {
  const shuffled = seededShuffle(pool, seed + (kind === "aptitude" ? 3101 : 7103));
  const selected: AssessmentQuestion[] = [];
  const patternCounts: Record<string, number> = {};
  const usedQuestions = new Set<string>();
  const maxPerPattern = Math.max(2, Math.ceil(count / 8));

  shuffled.forEach((question) => {
    if (selected.length >= count) return;
    const pattern = getPattern(kind, question);
    const questionKey = hashString(question.q).toString();
    if (usedQuestions.has(questionKey)) return;
    if ((patternCounts[pattern] || 0) >= maxPerPattern) return;

    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    usedQuestions.add(questionKey);
    selected.push(question);
  });

  shuffled.forEach((question) => {
    if (selected.length >= count) return;
    const questionKey = hashString(question.q).toString();
    if (usedQuestions.has(questionKey)) return;
    usedQuestions.add(questionKey);
    selected.push(question);
  });

  const sequenceFingerprint = hashString(`${kind}:${seed}:${selected.map(q => q.q).join("||")}`).toString(36).toUpperCase();
  return selected.slice(0, count).map((question, index) =>
    withAntiCopyMarkers(question, seed, index, kind, sequenceFingerprint)
  );
};

export const calculateUpscNegativeScore = (correct: number, wrong: number) => {
  const penalty = Math.floor(wrong / 3);
  return {
    penalty,
    score: Math.max(0, correct - penalty),
  };
};
