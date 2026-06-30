const fs = require('fs');
const path = require('path');

// Helper to shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate Aptitude Questions
function generateAptitudeQuestions(count) {
  const questions = [];
  
  const templates = [
    // Syllogism
    () => {
      const subjects = ["managers", "engineers", "directors", "analysts", "consultants"];
      const predicates = ["certified", "experienced", "overpaid", "visionary", "strategic"];
      const s = shuffle([...subjects]);
      const p = shuffle([...predicates]);
      
      const q = `Statement 1: All ${s[0]} are ${s[1]}.\nStatement 2: Some ${s[1]} are ${p[0]}.\nStatement 3: No ${p[0]} is a ${s[2]}.\n\nConclusion I: Some ${s[0]} are ${p[0]}.\nConclusion II: No ${s[2]} is a ${s[1]}.\nConclusion III: Some ${s[1]} are not ${s[2]}.`;
      const correct = "Only Conclusion III follows";
      const wrong = ["Only I and II follow", "All conclusions follow", "None of the conclusions follow"];
      return { q, correct, wrong };
    },
    // Time Speed Distance (Complex)
    () => {
      const d1 = Math.floor(Math.random() * 50 + 100); // 100-150
      const d2 = Math.floor(Math.random() * 50 + 150); // 150-200
      const s1 = Math.floor(Math.random() * 20 + 40); // 40-60
      const s2 = Math.floor(Math.random() * 20 + 60); // 60-80
      
      const time = (d1/s1) + (d2/s2);
      const avgSpeed = ((d1+d2)/time).toFixed(2);
      
      const q = `A logistics convoy travels the first ${d1} km of a highly classified route at a heavily regulated speed of ${s1} km/hr. Upon reaching a security checkpoint, it accelerates, covering the remaining ${d2} km at ${s2} km/hr. If the convoy is subjected to a 15-minute delay at the checkpoint, what is the effective average speed of the entire journey in km/hr, excluding the delay, rounded to two decimal places?`;
      
      const correct = avgSpeed.toString();
      const wrong = [(Number(avgSpeed)+1.52).toFixed(2), (Number(avgSpeed)-2.14).toFixed(2), (Number(avgSpeed)+3.45).toFixed(2)];
      return { q, correct, wrong };
    },
    // Advanced Probability
    () => {
      const total = Math.floor(Math.random() * 5 + 15);
      const defect = Math.floor(Math.random() * 3 + 4);
      const draw = 3;
      
      const q = `In a highly secure cryptographic key repository, there are ${total} physical access drives, of which exactly ${defect} have been compromised. A security auditor randomly selects ${draw} drives simultaneously for inspection. What is the probability that AT LEAST one of the drawn drives is compromised?`;
      
      // Calculate probability
      // P(at least 1) = 1 - P(none)
      // P(none) = (total-defect)C3 / totalC3
      const choose = (n, k) => {
        if(k === 0) return 1;
        let res = 1;
        for(let i=1; i<=k; i++) res = res * (n - i + 1) / i;
        return res;
      };
      const pNone = choose(total - defect, draw) / choose(total, draw);
      const pAtLeastOne = 1 - pNone;
      
      const correct = pAtLeastOne.toFixed(4);
      const wrong = [(pAtLeastOne - 0.1234).toFixed(4), (pAtLeastOne + 0.0512).toFixed(4), (pAtLeastOne - 0.2312).toFixed(4)];
      return { q, correct, wrong };
    },
    // Data Sufficiency
    () => {
      const vars = ["X", "Y", "Z", "W"];
      const v = shuffle([...vars]);
      const q = `Question: Is the integer ${v[0]} a prime number?\n\nStatement I: ${v[0]} > 10 and is a factor of 143.\nStatement II: ${v[0]} leaves a remainder of 2 when divided by 3, and a remainder of 4 when divided by 5.\n\nWhich of the statements is/are sufficient to answer the question?`;
      
      const correct = "Statement I alone is sufficient";
      const wrong = ["Statement II alone is sufficient", "Both statements together are required", "Neither statement is sufficient"];
      return { q, correct, wrong };
    },
    // Critical Reasoning / Assumption
    () => {
      const scenarios = [
        {
          s: "The government has recently imposed a severe carbon tax on heavy industries to curb greenhouse emissions by 40% over the next decade. Surprisingly, economists project this will lead to a net increase in domestic manufacturing output.",
          a: "The revenue generated from the carbon tax will be heavily subsidized back into green manufacturing technologies, making domestic industries highly globally competitive."
        },
        {
          s: "A major tech conglomerate has abolished all management layers, transitioning to a completely flat holacracy. Within six months, employee turnover decreased by 30% while project delivery times remained exactly the same.",
          a: "The primary driver of employee turnover in the previous hierarchy was dissatisfaction with middle-management oversight, rather than project workload."
        }
      ];
      const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
      const q = `Read the following excerpt:\n"${selected.s}"\n\nWhich of the following is the most vital ASSUMPTION required for the economists/outcomes projected in the statement to hold true?`;
      
      const correct = selected.a;
      const wrong = [
        "The industries will simply pass the cost of the tax/restructuring directly to the consumer without changing output.",
        "The global market will simultaneously impose similar constraints, nullifying any competitive disadvantage.",
        "Employees and companies naturally prefer traditional hierarchies, but adapt out of pure economic necessity."
      ];
      return { q, correct, wrong };
    }
  ];

  for (let i = 1; i <= count; i++) {
    const template = templates[i % templates.length];
    const { q, correct, wrong } = template();
    
    let opts = [correct, ...wrong.slice(0, 3)];
    opts = shuffle(opts);
    
    questions.push({
      q: `[ID: A-${i}] ` + q,
      opts,
      correctAnswer: correct
    });
  }
  return questions;
}

// Generate Grammar/Verbal Questions
function generateGrammarQuestions(count) {
  const questions = [];
  
  const templates = [
    // Advanced Vocabulary / Lexicology
    () => {
      const vocab = [
        { w: "Obfuscate", d: "To deliberately make something unclear or difficult to understand" },
        { w: "Recalcitrant", d: "Having an obstinately uncooperative attitude towards authority or discipline" },
        { w: "Pusillanimous", d: "Showing a lack of courage or determination; timid" },
        { w: "Fastidious", d: "Very attentive to and concerned about accuracy and detail" },
        { w: "Equivocate", d: "Use ambiguous language so as to conceal the truth or avoid committing oneself" }
      ];
      const v = shuffle([...vocab]);
      const target = v[0];
      
      const q = `Advanced Lexicology: Identify the most precise one-word substitute for the following complex behavioral definition: "${target.d}."`;
      const correct = target.w;
      const wrong = [v[1].w, v[2].w, v[3].w];
      return { q, correct, wrong };
    },
    // Paragraph Jumble (Parajumble)
    () => {
      const q = `Arrange the following highly technical statements in a logically coherent sequence to form a sound philosophical argument:\n\nP. Consequently, the epistemological burden shifts from the observer to the underlying metric of observation.\nQ. This inherent uncertainty is not merely a limitation of our instruments, but a fundamental property of the quantum realm.\nR. Heisenberg's postulate dictates that the precise position and momentum of a particle cannot be simultaneously ascertained.\nS. Therefore, any attempt to deterministically model subatomic trajectories is philosophically flawed from its inception.`;
      
      const correct = "R, Q, S, P";
      const wrong = ["R, S, Q, P", "Q, R, P, S", "P, R, Q, S"];
      return { q, correct, wrong };
    },
    // Nuanced Sentence Correction
    () => {
      const sentences = [
        {
          q: "Hardly had the central bank governor announced the unprecedented quantitative easing measures, than the stock market indices plummeted drastically due to unforeseen inflationary fears.",
          c: "Replace 'than' with 'when'."
        },
        {
          q: "The diplomatic envoy, alongside the contingent of heavily armed peacekeepers, are expected to cross the heavily fortified border before dawn.",
          c: "Replace 'are' with 'is' (subject is singular)."
        }
      ];
      const selected = sentences[Math.floor(Math.random() * sentences.length)];
      const q = `Identify the precise grammatical or syntactic error in the following complex sentence:\n\n"${selected.q}"`;
      
      const correct = selected.c;
      const wrong = ["No error.", "The sentence lacks parallel structure in its dependent clauses.", "There is a dangling modifier at the beginning of the sentence."];
      return { q, correct, wrong };
    },
    // Inference from short passage
    () => {
      const q = `Read the highly abstract excerpt carefully:\n"The relentless proliferation of artificial intelligence in jurisprudence does not merely automate legal analysis; it fundamentally alters the ontological nature of justice itself. When an algorithm, devoid of human empathy and contextual leniency, dispenses verdicts based strictly on historical precedent, it institutionalizes past biases while simultaneously erasing the capacity for moral evolution."\n\nWhich of the following represents the most logical INFERENCE that can be drawn from the passage?`;
      
      const correct = "The author believes that true justice requires a capacity for moral evolution which strictly precedent-based algorithms lack.";
      const wrong = [
        "Artificial intelligence will eventually replace human judges entirely due to its superior analytical efficiency.",
        "Historical precedents in law are entirely based on bias and should be completely discarded by modern courts.",
        "Algorithms are fundamentally incapable of reading complex legal documents correctly."
      ];
      return { q, correct, wrong };
    },
    // Voice / Speech Transformation
    () => {
      const q = `Analyze the grammatical voice shift and select the strictly correct passive transformation of the following intricate command:\n\n'The sovereign overarching committee unanimously mandated that all subsidiary branches immediately cease unauthorized data transmissions.'`;
      
      const correct = "It was unanimously mandated by the sovereign overarching committee that unauthorized data transmissions be immediately ceased by all subsidiary branches.";
      const wrong = [
        "Unauthorized data transmissions were mandated to cease immediately by the sovereign committee.",
        "All subsidiary branches were unanimously mandated by the committee to cease data transmissions.",
        "The committee has mandated unauthorized data transmissions to be ceased."
      ];
      return { q, correct, wrong };
    }
  ];

  for (let i = 1; i <= count; i++) {
    const template = templates[i % templates.length];
    const { q, correct, wrong } = template();
    
    let opts = [correct, ...wrong.slice(0, 3)];
    opts = shuffle(opts);
    
    questions.push({
      q: `[ID: G-${i}] ` + q,
      opts,
      correctAnswer: correct
    });
  }
  return questions;
}

const aptitude = generateAptitudeQuestions(400);
const grammar = generateGrammarQuestions(400);

const questionsDataPath = path.join(__dirname, '..', 'data', 'questions_data.ts');
let content = fs.readFileSync(questionsDataPath, 'utf8');

// The file format has `export const APTITUDE_POOL = [...];` and `export const GRAMMAR_POOL = [...];`
// Followed by `export const DOMAIN_MCQ_POOL = {`

// Let's replace everything between APTITUDE_POOL and DOMAIN_MCQ_POOL
const startMarker = "export const APTITUDE_POOL = [";
const endMarker = "export const DOMAIN_MCQ_POOL = {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find markers in questions_data.ts!");
  process.exit(1);
}

const newAptitudeString = "export const APTITUDE_POOL = " + JSON.stringify(aptitude, null, 2) + ";\n\n";
const newGrammarString = "export const GRAMMAR_POOL = " + JSON.stringify(grammar, null, 2) + ";\n\n";

const newContent = content.substring(0, startIndex) + newAptitudeString + newGrammarString + content.substring(endIndex);

fs.writeFileSync(questionsDataPath, newContent, 'utf8');
console.log("Successfully updated 400 Aptitude and 400 Grammar questions in questions_data.ts");
