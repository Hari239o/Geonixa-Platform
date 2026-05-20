export type DomainTrack = "technical" | "non-technical";
export type Round4Mode = "coding" | "domain-mcq";

export interface DomainConfig {
  id: string;
  label: string;
  track: DomainTrack;
  category: "Technical" | "Non-Technical";
  round4Mode: Round4Mode;
  questionPoolKey: string;
  preferredLanguage?: "java" | "python" | "javascript" | "cpp" | "c" | "csharp";
  reportGroup: string;
}

export const DOMAIN_CATALOG: DomainConfig[] = [
  { id: "java", label: "Java", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "java", reportGroup: "Software Engineering" },
  { id: "python", label: "Python", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "python", reportGroup: "Software Engineering" },
  { id: "web-development", label: "Web Development", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "javascript", reportGroup: "Software Engineering" },
  { id: "data-science", label: "Data Science", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "python", reportGroup: "Data" },
  { id: "data-analytics", label: "Data Analytics", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "python", reportGroup: "Data" },
  { id: "full-stack-development", label: "Full Stack Development", track: "technical", category: "Technical", round4Mode: "coding", questionPoolKey: "TECHNICAL_ROUND_4_POOL", preferredLanguage: "javascript", reportGroup: "Software Engineering" },
  { id: "vlsi", label: "VLSI", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "VLSI Design", reportGroup: "Electronics Core" },
  { id: "embedded-systems", label: "Embedded Systems", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Embedded Systems", reportGroup: "Electronics Core" },
  { id: "autocad", label: "AutoCAD", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "AutoCAD", reportGroup: "Design" },
  { id: "electrical-vehicles", label: "Electrical Vehicles", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Electric Vehicles", reportGroup: "Electrical Core" },
  { id: "civil-engineering", label: "Civil Engineering", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Civil Engineering", reportGroup: "Civil Core" },
  { id: "eee", label: "EEE", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Electric Vehicles", reportGroup: "Electrical Core" },
  { id: "ece", label: "ECE", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Embedded Systems", reportGroup: "Electronics Core" },
  { id: "mechanical-engineering", label: "Mechanical Engineering", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Mechanical Engineering", reportGroup: "Mechanical Core" },
  { id: "cloud-computing", label: "Cloud Computing", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Cloud Computing", reportGroup: "IT Core" },
  { id: "cybersecurity", label: "Cybersecurity", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Cybersecurity", reportGroup: "IT Core" },
  { id: "ai-machine-learning", label: "AI & Machine Learning", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "AI & Machine Learning", reportGroup: "IT Core" },
  { id: "business-analyst", label: "Business Analyst", track: "non-technical", category: "Non-Technical", round4Mode: "domain-mcq", questionPoolKey: "Business Analyst", reportGroup: "Business Core" },
];

const DOMAIN_ALIASES: Record<string, string> = {
  "full stack": "Full Stack Development",
  "full-stack": "Full Stack Development",
  "full stack development": "Full Stack Development",
  "vlsi design": "VLSI",
  "embedded": "Embedded Systems",
  "ev": "Electrical Vehicles",
  "electric vehicles": "Electrical Vehicles",
  "electrical vehicles": "Electrical Vehicles",
  "civil": "Civil Engineering",
  "electrical & electronics": "EEE",
  "electrical and electronics": "EEE",
  "electronics & comm": "ECE",
  "electronics and communication": "ECE",
  "mechanical": "Mechanical Engineering",
  "cloud": "Cloud Computing",
  "cyber security": "Cybersecurity",
  "ai & ml": "AI & Machine Learning",
  "ai and ml": "AI & Machine Learning",
  "ai": "AI & Machine Learning",
  "machine learning": "AI & Machine Learning",
  "ba": "Business Analyst",
  "business analytics": "Business Analyst",
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export const normalizeDomainLabel = (domain?: string | null): string => {
  if (!domain) return "Java";
  const exact = DOMAIN_CATALOG.find((item) => item.label === domain);
  if (exact) return exact.label;

  const normalized = normalize(domain);
  const alias = DOMAIN_ALIASES[normalized];
  if (alias) return alias;

  const fuzzy = DOMAIN_CATALOG.find((item) => normalize(item.label) === normalized);
  return fuzzy?.label || domain;
};

export const getDomainConfig = (domain?: string | null): DomainConfig => {
  const label = normalizeDomainLabel(domain);
  return DOMAIN_CATALOG.find((item) => item.label === label) || DOMAIN_CATALOG[0];
};

export const isTechnicalDomain = (domain?: string | null): boolean => {
  return getDomainConfig(domain).track === "technical";
};

export const isDomainMcqRound = (domain?: string | null): boolean => {
  return getDomainConfig(domain).round4Mode === "domain-mcq";
};

export const TECHNICAL_DOMAINS = DOMAIN_CATALOG.filter((item) => item.track === "technical");
export const NON_TECHNICAL_DOMAINS = DOMAIN_CATALOG.filter((item) => item.track === "non-technical");
export const DOMAIN_LABELS = DOMAIN_CATALOG.map((item) => item.label);

export const getExamPatternForDomain = (domain?: string | null) => {
  const config = getDomainConfig(domain);
  return {
    domain: config.label,
    track: config.track,
    reportGroup: config.reportGroup,
    round4Mode: config.round4Mode,
    rounds: [
      { roundNumber: 1, name: "Only Aptitude round", type: "mcq", questionCount: 30, durationMinutes: 10, poolKey: "APTITUDE_POOL" },
      { roundNumber: 2, name: "Grammar round", type: "mcq", questionCount: 30, durationMinutes: 10, poolKey: "GRAMMAR_POOL" },
      { roundNumber: 3, name: "Typing", type: "typing", topicCount: 2, durationMinutes: 10, poolKey: "TYPING_TOPICS_POOL" },
      {
        roundNumber: 4,
        name: config.round4Mode === "coding" ? "Coding" : "Domain MCQ",
        type: config.round4Mode,
        questionCount: config.round4Mode === "coding" ? 3 : 40,
        durationMinutes: config.round4Mode === "coding" ? 50 : 20,
        poolKey: config.questionPoolKey,
      },
    ],
  };
};

export const enrichProfileWithDomainPlan = <T extends Record<string, any>>(profile: T): T => {
  const domainConfig = getDomainConfig(profile.domain);
  const examPattern = getExamPatternForDomain(domainConfig.label);

  return {
    ...profile,
    domain: domainConfig.label,
    domainId: domainConfig.id,
    domainTrack: domainConfig.track,
    round4Mode: domainConfig.round4Mode,
    reportGroup: domainConfig.reportGroup,
    examPattern,
    questionAllocation: examPattern.rounds,
  };
};
