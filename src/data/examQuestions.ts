// High-level UPSC-style Aptitude and Grammar questions
// In a real production app, these would come from a secure API.
// For this enterprise-grade demo, we provide a robust pool.

export const APTITUDE_POOL = [
  {
    q: "A man completes a journey in 10 hours. He travels first half of the journey at the rate of 21 km/hr and second half at the rate of 24 km/hr. Find the total journey in km.",
    opts: ["220 km", "224 km", "230 km", "234 km"],
    correctAnswer: "224 km"
  },
  {
    q: "The average age of 15 students of a class is 15 years. Out of these, the average age of 5 students is 14 years and that of the other 9 students is 16 years. The age of the 15th student is:",
    opts: ["11 years", "15 years", "15.27 years", "14 years"],
    correctAnswer: "11 years"
  },
  {
    q: "A and B can together finish a work in 30 days. They worked together for 20 days and then B left. After another 20 days, A finished the remaining work. In how many days A alone can finish the job?",
    opts: ["40", "50", "54", "60"],
    correctAnswer: "60"
  },
  {
    q: "A sum of money at compound interest amounts to Rs. 672 in 2 years and to Rs. 714 in 3 years. The rate of interest per annum is:",
    opts: ["5.5%", "6%", "6.25%", "6.75%"],
    correctAnswer: "6.25%"
  },
  {
    q: "Two trains of equal length are running on parallel lines in the same direction at 46 km/hr and 36 km/hr. The faster train passes the slower train in 36 seconds. The length of each train is:",
    opts: ["50 m", "72 m", "80 m", "82 m"],
    correctAnswer: "50 m"
  },
  {
    q: "If the cost price of 12 items is equal to the selling price of 16 items, what is the loss percentage?",
    opts: ["20%", "25%", "30%", "33.33%"],
    correctAnswer: "25%"
  },
  {
    q: "A bag contains 2 red, 3 green and 2 blue balls. Two balls are drawn at random. What is the probability that none of the balls drawn is blue?",
    opts: ["10/21", "11/21", "2/7", "5/7"],
    correctAnswer: "10/21"
  },
  {
    q: "The ratio of ages of A and B is 3:1. After 15 years, the ratio will be 2:1. Their present ages are:",
    opts: ["30, 10", "45, 15", "21, 7", "60, 20"],
    correctAnswer: "45, 15"
  },
  {
    q: "A clock is started at noon. By 10 minutes past 5, the hour hand has turned through:",
    opts: ["145°", "150°", "155°", "160°"],
    correctAnswer: "155°"
  },
  {
    q: "How many times in a day, are the hands of a clock in straight line but opposite in direction?",
    opts: ["11", "22", "24", "48"],
    correctAnswer: "22"
  },
  { q: "A gardener has 1000 plants. He wants to plant them in such a way that the number of rows and columns remains the same. What is the minimum number of more plants that he needs for this?", opts: ["14", "24", "32", "34"], correctAnswer: "24" },
  { q: "The least number which when divided by 5, 6, 7 and 8 leaves a remainder 3, but when divided by 9 leaves no remainder, is:", opts: ["1677", "1683", "2523", "3363"], correctAnswer: "1683" },
  { q: "A, B and C start at the same time in the same direction to run around a circular stadium. A completes a round in 252 seconds, B in 308 seconds and C in 198 seconds, all starting at the same point. After what time will they next meet at the starting point?", opts: ["26 min 18 sec", "42 min 36 sec", "45 min", "46 min 12 sec"], correctAnswer: "46 min 12 sec" },
  { q: "A hemispherical bowl of internal radius 9 cm contains a liquid. This liquid is to be filled into cylindrical shaped small bottles of diameter 3 cm and height 4 cm. How many bottles will be needed to empty the bowl?", opts: ["27", "35", "54", "63"], correctAnswer: "54" },
  { q: "The surface area of a sphere is 616 cm². Its radius is:", opts: ["7 cm", "14 cm", "21 cm", "28 cm"], correctAnswer: "7 cm" },
  { q: "A person takes a loan of Rs. 200 at 5% simple interest. He returns Rs. 100 at the end of 1 year. In order to clear his dues at the end of 2 years, he would pay:", opts: ["Rs. 105", "Rs. 110", "Rs. 115", "Rs. 120"], correctAnswer: "Rs. 110" },
  { q: "What is the unit digit in (7^95 - 3^58)?", opts: ["0", "4", "6", "7"], correctAnswer: "4" },
  { q: "If x = 1 + sqrt(2) + sqrt(3), then x + 1/(x-1) is:", opts: ["1+2sqrt(3)", "2+sqrt(3)", "3+sqrt(2)", "2+2sqrt(3)"], correctAnswer: "1+2sqrt(3)" },
  { q: "A shopkeeper cheats to the extent of 10% while buying as well as selling, by using false weights. His total gain is:", opts: ["10%", "11%", "20%", "21%"], correctAnswer: "21%" },
  { q: "The difference between the compound interest and simple interest on a certain sum at 10% per annum for 2 years is Rs. 631. Find the sum.", opts: ["Rs. 60,000", "Rs. 63,100", "Rs. 64,000", "Rs. 65,000"], correctAnswer: "Rs. 63,100" },
  { q: "Three numbers are such that if the average of any two of them is added to the third number, the sums obtained are 168, 174 and 180 respectively. What is the average of the original three numbers?", opts: ["84", "87", "89", "91"], correctAnswer: "87" },
  { q: "A contractor undertakes to build a wall in 50 days. He employs 50 peoples for the same. However, after 25 days he finds that only 40% of the work is complete. How many more people need to be employed to finish the work on time?", opts: ["25", "30", "35", "20"], correctAnswer: "25" },
  { q: "In a race of 200m, A beats S by 20m and N by 40m. If S and N are running a race of 100m with exactly the same speeds as before, S will beat N by how many meters?", opts: ["11.11 m", "10 m", "12 m", "25 m"], correctAnswer: "11.11 m" },
  { q: "A vessel contains a mixture of milk and water in the ratio 7:5. When 9 litres of mixture is drawn off and the vessel is filled with water, the ratio of milk and water becomes 7:9. How many litres of milk was in the vessel initially?", opts: ["21", "24", "27", "18"], correctAnswer: "21" },
  { q: "Find the number of ways in which 8 non-attacking queens can be placed on an 8x8 chessboard.", opts: ["92", "42", "128", "256"], correctAnswer: "92" },
  { q: "What is the remainder when 2^100 is divided by 101?", opts: ["1", "2", "100", "50"], correctAnswer: "1" },
  { q: "A rectangular park 60m long and 40m wide has two concrete crossroads running in the middle of the park and rest of the park has been used as a lawn. If the area of the lawn is 2109 sq. m, then what is the width of the road?", opts: ["3m", "2m", "5m", "4m"], correctAnswer: "3m" },
  { q: "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?", opts: ["12 days", "15 days", "16 days", "18 days"], correctAnswer: "15 days" },
  { q: "A man can row 6 km/h in still water. If the speed of the current is 2 km/h, it takes him 3 hours to row to a place and come back. How far is the place?", opts: ["8 km", "9 km", "10 km", "12 km"], correctAnswer: "8 km" },
  { q: "How many positive integers 'n' less than 1000 have the property that the sum of the digits of 'n' is divisible by 9?", opts: ["111", "110", "108", "99"], correctAnswer: "111" },
  { q: "If x^2 + y^2 + z^2 = xy + yz + zx, then the triangle formed by sides x, y, z is:", opts: ["Equilateral", "Isosceles", "Right angled", "Scalene"], correctAnswer: "Equilateral" },
  { q: "The probability that a man can hit a target is 3/4. He tries 5 times. The probability that he will hit the target at least 3 times is:", opts: ["459/512", "371/464", "291/312", "None"], correctAnswer: "459/512" },
  { q: "A sum of Rs. 725 is lent in the beginning of a year at a certain rate of interest. After 8 months, a sum of Rs. 362.50 more is lent but at the rate twice the former. At the end of the year, Rs. 33.50 is earned as interest from both the loans. What was the original rate of interest?", opts: ["3.46%", "4.5%", "5%", "6%"], correctAnswer: "3.46%" },
  { q: "A tank has two pipes. The first pipe can fill it in 45 minutes and the second can empty it in 1 hour. In what time will the empty tank be filled if the pipes be opened one at a time in alternate minutes?", opts: ["2 hours 55 min", "3 hours", "3 hours 40 min", "5 hours 53 min"], correctAnswer: "5 hours 53 min" },
  { q: "Find the last two digits of 3^100.", opts: ["01", "03", "07", "09"], correctAnswer: "01" },
  { q: "The ratio of the area of a square to that of the square drawn on its diagonal is:", opts: ["1:2", "1:1", "1:4", "1:sqrt(2)"], correctAnswer: "1:2" },
  { q: "If 5 spiders can catch 5 flies in 5 minutes, how many spiders will catch 100 flies in 100 minutes?", opts: ["5", "100", "20", "50"], correctAnswer: "5" },
  { q: "A milkman has two cans of milk. The first contains 25% water and the rest milk. The second contains 50% water and 50% milk. How much milk should he mix from each container so as to get 12 litres of milk such that the ratio of water to milk is 3:5?", opts: ["6L, 6L", "4L, 8L", "5L, 7L", "8L, 4L"], correctAnswer: "6L, 6L" },
  { q: "The number of integers n such that n+3 divides n^2 + 11 is:", opts: ["8", "4", "2", "1"], correctAnswer: "8" },
  { q: "In how many ways can the letters of the word 'LEADER' be arranged?", opts: ["360", "720", "144", "210"], correctAnswer: "360" },
  { q: "A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?", opts: ["240 m", "225 m", "300 m", "360 m"], correctAnswer: "240 m" },
  { q: "If log 2 = 0.3010 and log 3 = 0.4771, the number of digits in 6^20 is:", opts: ["16", "15", "17", "18"], correctAnswer: "16" },
  { q: "A clock strikes once at 1 o'clock, twice at 2 o'clock, thrice at 3 o'clock and so on. How many times will it strike in 24 hours?", opts: ["156", "78", "136", "196"], correctAnswer: "156" },
  { q: "A right triangle has hypotenuse 10 and altitude to the hypotenuse 6. What is the area of the triangle?", opts: ["None (Not possible)", "30", "24", "60"], correctAnswer: "None (Not possible)" },
  { q: "The sum of all three-digit numbers which leave a remainder 2 when divided by 3 is:", opts: ["164850", "162250", "165900", "163350"], correctAnswer: "164850" },
  { q: "If the radius of a circle is increased by 100%, the area is increased by:", opts: ["300%", "100%", "200%", "400%"], correctAnswer: "300%" },
  { q: "What is the smallest number which when divided by 20, 25, 35 and 40 leaves remainders 14, 19, 29 and 34 respectively?", opts: ["1394", "1400", "1406", "1412"], correctAnswer: "1394" },
  { q: "A and B entered into a partnership investing Rs. 16000 and Rs. 12000 respectively. After 3 months, A withdrew Rs. 5000 while B invested Rs. 5000 more. After 3 more months, C joins the business with a capital of Rs. 21000. The share of B exceeds that of C, out of a total profit of Rs. 26400 after one year, by:", opts: ["Rs. 3600", "Rs. 2400", "Rs. 1200", "Rs. 4800"], correctAnswer: "Rs. 3600" },
  { q: "A bag contains 6 black and 8 white balls. One ball is drawn at random. What is the probability that the ball drawn is white?", opts: ["4/7", "3/4", "3/7", "1/8"], correctAnswer: "4/7" },
  { q: "If 1.5x = 0.04y, then the value of (y-x)/(y+x) is:", opts: ["73/77", "7.3/7.7", "73/7.7", "None"], correctAnswer: "73/77" }
];

export const GRAMMAR_POOL = [
  {
    q: "Choose the correct alternative which can be substituted for the following: 'A person who renounces a religious or political belief or principle.'",
    opts: ["Apostate", "Antiquarian", "Ascetic", "Atheist"],
    correctAnswer: "Apostate"
  },
  {
    q: "Identify the part of the sentence that has an error: 'Neither of the two candidates (A) / who had applied (B) / were found suitable (C) / for the post (D).'",
    opts: ["A", "B", "C", "D"],
    correctAnswer: "C"
  },
  {
    q: "Select the correctly spelled word.",
    opts: ["Accommodate", "Acomodate", "Accomodate", "Acommodate"],
    correctAnswer: "Accommodate"
  },
  {
    q: "Choose the word most nearly opposite in meaning to 'Fastidious'.",
    opts: ["Fussy", "Cooperative", "Careless", "Promising"],
    correctAnswer: "Careless"
  },
  {
    q: "Fill in the blank: 'He was so _______ at his job that he was soon promoted.'",
    opts: ["adept", "adapt", "adopt", "abyss"],
    correctAnswer: "adept"
  },
  {
    q: "What is the meaning of the idiom 'To keep the wolf from the door'?",
    opts: ["To avoid extreme poverty", "To live a luxurious life", "To keep away from danger", "To fight with a wolf"],
    correctAnswer: "To avoid extreme poverty"
  },
  {
    q: "Change the voice: 'The committee is considering the proposal.'",
    opts: ["The proposal is considered by the committee.", "The proposal is being considered by the committee.", "The proposal was being considered by the committee.", "The proposal had been considered by the committee."],
    correctAnswer: "The proposal is being considered by the committee."
  },
  {
    q: "Select the correct option to complete the sentence: 'If I ______ a king, I would make you my minister.'",
    opts: ["was", "am", "were", "had been"],
    correctAnswer: "were"
  },
  {
    q: "Choose the synonym of 'Prudent'.",
    opts: ["Reckless", "Wise", "Foolish", "Hasty"],
    correctAnswer: "Wise"
  },
  {
    q: "Identify the figure of speech: 'The camel is the ship of the desert.'",
    opts: ["Simile", "Metaphor", "Personification", "Oxymoron"],
    correctAnswer: "Metaphor"
  },
  { q: "Identify the error: 'Had he known about the meeting (A) / he would have (B) / attended it (C) / without fail (D).'", opts: ["A", "B", "C", "No error"], correctAnswer: "No error" },
  { q: "Which of the following sentences uses the subjunctive mood correctly?", opts: ["I wish I was taller.", "It is essential that he be present.", "If he is here, he would help.", "She acts as if she is the boss."], correctAnswer: "It is essential that he be present." },
  { q: "Identify the part of speech of the underlined word: 'The *fast* train arrived late.'", opts: ["Noun", "Adjective", "Adverb", "Verb"], correctAnswer: "Adjective" },
  { q: "Choose the correct preposition: 'He is proficient ___ three languages.'", opts: ["in", "at", "with", "for"], correctAnswer: "in" },
  { q: "What is the antonym of 'Ephemeral'?", opts: ["Transient", "Permanent", "Frail", "Ethereal"], correctAnswer: "Permanent" },
  { q: "Select the correct collective noun: 'A ___ of lions.'", opts: ["Herd", "Pride", "Pack", "Swarm"], correctAnswer: "Pride" },
  { q: "Identify the figure of speech: 'Parting is such sweet sorrow.'", opts: ["Hyperbole", "Oxymoron", "Simile", "Metonymy"], correctAnswer: "Oxymoron" },
  { q: "Choose the correct form of the verb: 'Neither the principal nor the teachers ___ present.'", opts: ["is", "are", "was", "has been"], correctAnswer: "are" },
  { q: "What is the meaning of 'In camera'?", opts: ["In front of a camera", "Secretly", "Openly", "To be photographed"], correctAnswer: "Secretly" },
  { q: "Select the correctly punctuated sentence.", opts: ["The students, who were late, were punished.", "The students who were late, were punished.", "The students, who were late were punished.", "The students who were late were punished."], correctAnswer: "The students, who were late, were punished." },
  { q: "Fill in the blank: 'Lately, there ___ been a lot of talk about the new policy.'", opts: ["has", "have", "had", "is"], correctAnswer: "has" },
  { q: "Identify the error: 'The reason why he failed (A) / is because (B) / he did not (C) / work hard (D).'", opts: ["A", "B", "C", "D"], correctAnswer: "B" },
  { q: "Choose the word most nearly similar in meaning to 'Abnegation'.", opts: ["Self-denial", "Acceptance", "Gluttony", "Selfishness"], correctAnswer: "Self-denial" },
  { q: "Identify the type of sentence: 'Alas! He is dead.'", opts: ["Assertive", "Imperative", "Exclamatory", "Interrogative"], correctAnswer: "Exclamatory" },
  { q: "What is the feminine form of 'Bachelor'?", opts: ["Spinster", "Widow", "Maid", "Nun"], correctAnswer: "Spinster" },
  { q: "Which of the following is a 'Dangling Modifier'?", opts: ["Walking down the road, a dog bit me.", "A dog bit me while I was walking.", "As I was walking down the road, a dog bit me.", "None of the above"], correctAnswer: "Walking down the road, a dog bit me." },
  { q: "Choose the correct idiom: 'He is a bit ___.' (meaning slightly unwell)", opts: ["under the weather", "in the pink", "on cloud nine", "down in the dumps"], correctAnswer: "under the weather" },
  { q: "Identify the underlined phrase: 'To err is human.'", opts: ["Gerund phrase", "Infinitive phrase", "Participle phrase", "Prepositional phrase"], correctAnswer: "Infinitive phrase" },
  { q: "What is the synonym of 'Garrulous'?", opts: ["Silent", "Talkative", "Brave", "Cowardly"], correctAnswer: "Talkative" },
  { q: "Choose the correct indirect speech: 'He said to me, \"Wait here till I return.\"'", opts: ["He asked me to wait there till he returned.", "He told me to wait here till he returned.", "He ordered me to wait there till I returned.", "He told me to wait there till I return."], correctAnswer: "He asked me to wait there till he returned." },
  { q: "Select the word that means 'A hater of mankind'.", opts: ["Misanthrope", "Misogynist", "Philanthropist", "Optimist"], correctAnswer: "Misanthrope" },
  { q: "Identify the error: 'One of my friends (A) / are going (B) / to America (C) / next month (D).'", opts: ["A", "B", "C", "D"], correctAnswer: "B" },
  { q: "What is the plural of 'Criterion'?", opts: ["Criterions", "Criteria", "Criterias", "Criteriones"], correctAnswer: "Criteria" },
  { q: "Choose the correct word: 'The ___ of the school was very strict.'", opts: ["Principle", "Principal", "Princeple", "Prinsipal"], correctAnswer: "Principal" },
  { q: "Identify the figure of speech: 'Death lays its icy hands on kings.'", opts: ["Simile", "Metaphor", "Personification", "Oxymoron"], correctAnswer: "Personification" },
  { q: "What is the meaning of the phrase 'To kick the bucket'?", opts: ["To start a fight", "To die", "To be happy", "To win a race"], correctAnswer: "To die" },
  { q: "Fill in the blank: 'I have not seen him ___ last year.'", opts: ["from", "since", "for", "by"], correctAnswer: "since" },
  { q: "Identify the error: 'Suppose if you are (A) / late, what (B) / will you (C) / do? (D).'", opts: ["A", "B", "C", "D"], correctAnswer: "A" },
  { q: "What is the synonym of 'Laconic'?", opts: ["Brief", "Wordy", "Loud", "Clear"], correctAnswer: "Brief" },
  { q: "Choose the correct alternative: 'The criminal was ___.'", opts: ["hanged", "hung", "hanging", "hang"], correctAnswer: "hanged" }
];

export const TYPING_TOPICS = [
  {
    title: "The Industrial Revolution",
    text: "The Industrial Revolution was a period of global transition of the human economy towards more widespread, efficient and stable manufacturing processes that succeeded the Agricultural Revolution, starting from Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1820–1840. This transition included going from hand production methods to machines, new chemical manufacturing and iron production processes, the increasing use of steam power and water power, the development of machine tools and the rise of the mechanized factory system. The Industrial Revolution led to an unprecedented rise in the rate of population growth. In the 18th century, the United Kingdom was the first country to experience this change, which eventually spread to other parts of the world over the next century. The social and economic impact of this revolution was profound, leading to the growth of cities and a shift in the labor force."
  },
  {
    title: "The Digital Age",
    text: "The Digital Age, also known as the Information Age, is a historical period that began in the mid-20th century, characterized by a rapid epochal shift from traditional industry established by the Industrial Revolution to an economy primarily based upon information technology. The onset of the Information Age is associated with the development of the transistor in 1947 and the optical amplifier in the 1950s, which became the basis of computing and fiber-optics. According to the United Nations Public Administration Network, the Information Age formed by capitalizing on computer microminiaturization advances, with broader use of personal computers and web browsers. This era has transformed the way people live, work, and communicate, making information instantly accessible to anyone with an internet connection. The rise of social media and big data has further defined this era."
  }
];

export const CODING_DSA_POOL = [
  {
    title: "Q1. Median of Two Sorted Arrays",
    difficulty: "Hard",
    desc: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).\n\nExample 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000",
    initialCode: "/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};",
    tests: [
      { input: "[1,3], [2]", output: "2.00000" },
      { input: "[1,2], [3,4]", output: "2.50000" },
      { input: "[0,0], [0,0]", output: "0.00000" },
      { input: "[], [1]", output: "1.00000" },
      { input: "[2], []", output: "2.00000" },
      { input: "[1,2,3], [4,5,6]", output: "3.5" },
      { input: "[100], [101]", output: "100.5" },
      { input: "[1,5,9], [2,6,10]", output: "5.5" },
      { input: "[1,2], [1,2]", output: "1.5" },
      { input: "[3], [-2,-1]", output: "-1.0" }
    ]
  },
  {
    title: "Q2. Regular Expression Matching",
    difficulty: "Hard",
    desc: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n'.' Matches any single character.\n'*' Matches zero or more of the preceding element.\nThe matching should cover the entire input string (not partial).\n\nExample:\nInput: s = 'aa', p = 'a*'\nOutput: true",
    initialCode: "/**\n * @param {string} s\n * @param {string} p\n * @return {boolean}\n */\nvar isMatch = function(s, p) {\n    \n};",
    tests: [
      { input: '"aa", "a"', output: "false" },
      { input: '"aa", "a*"', output: "true" },
      { input: '"ab", ".*"', output: "true" },
      { input: '"aab", "c*a*b"', output: "true" },
      { input: '"mississippi", "mis*is*p*."', output: "false" },
      { input: '"aaa", "a*a"', output: "true" },
      { input: '"aaa", "ab*a*c*a"', output: "true" },
      { input: '"a", "ab*"', output: "true" },
      { input: '"bbbba", ".*a*a"', output: "true" },
      { input: '"ab", ".*c"', output: "false" }
    ]
  }
];

export const DOMAIN_MCQ_POOL = {
  "VLSI Design": [
    { q: "What is the primary advantage of using a FinFET over a planar MOSFET in sub-22nm nodes?", opts: ["Higher mobility", "Better gate control/lower leakage", "Lower cost", "Simpler manufacturing"], correctAnswer: "Better gate control/lower leakage" },
    { q: "In CMOS VLSI design, what is 'Latch-up'?", opts: ["A type of logic race", "Unintended parasitic SCR activation", "A memory state", "High-speed switching noise"], correctAnswer: "Unintended parasitic SCR activation" },
    { q: "Which of the following is used for Static Timing Analysis (STA)?", opts: ["Monte Carlo", "PrimeTime", "HSPICE", "Virtuoso"], correctAnswer: "PrimeTime" },
    { q: "What does the 'setup time' constraint ensure in a flip-flop?", opts: ["Data arrives before clock edge", "Data remains stable after edge", "Clock period is sufficient", "Hold time is minimized"], correctAnswer: "Data arrives before clock edge" },
    { q: "In a 4-input NAND gate in static CMOS, how many NMOS transistors are in series?", opts: ["1", "2", "3", "4"], correctAnswer: "4" },
    { q: "Which effect causes a decrease in threshold voltage as channel length decreases?", opts: ["Body Effect", "Drain Induced Barrier Lowering (DIBL)", "Channel Length Modulation", "Hot Carrier Injection"], correctAnswer: "Drain Induced Barrier Lowering (DIBL)" },
    { q: "What is the logical effort of a 3-input NOR gate?", opts: ["5/3", "7/3", "2", "1"], correctAnswer: "7/3" },
    { q: "In a dynamic CMOS gate, what is the purpose of a 'keeper' transistor?", opts: ["To speed up switching", "To prevent charge leakage and maintain state", "To reduce power", "To increase gain"], correctAnswer: "To prevent charge leakage and maintain state" },
    { q: "Which material is commonly used as a high-k dielectric in modern CMOS?", opts: ["SiO2", "HfO2", "Si3N4", "Polysilicon"], correctAnswer: "HfO2" },
    { q: "What is the 'Body Effect' in MOSFETs?", opts: ["Change in mobility", "Shift in threshold voltage due to Vsb", "Increase in parasitic capacitance", "Leakage through substrate"], correctAnswer: "Shift in threshold voltage due to Vsb" },
    { q: "Which scaling theory maintains constant electric field strength?", opts: ["Constant Voltage Scaling", "Full Scaling (Constant Field)", "Combined Scaling", "General Scaling"], correctAnswer: "Full Scaling (Constant Field)" },
    { q: "What is the primary source of power consumption in modern idle chips?", opts: ["Switching power", "Short circuit power", "Subthreshold leakage", "Dynamic power"], correctAnswer: "Subthreshold leakage" },
    { q: "In a layout, what does 'DRC' stand for?", opts: ["Design Rule Check", "Data Retrieval Cycle", "Digital Routing Core", "Direct Resistance Calculation"], correctAnswer: "Design Rule Check" },
    { q: "What is 'Electromigration'?", opts: ["Carrier diffusion", "Transport of material caused by gradual movement of ions in a conductor", "Electron tunneling", "Ion implantation"], correctAnswer: "Transport of material caused by gradual movement of ions in a conductor" },
    { q: "Which tool is used for physical layout design?", opts: ["Genus", "Innovus", "Virtuoso", "VCS"], correctAnswer: "Virtuoso" },
    { q: "What is the typical P/N width ratio in a CMOS inverter for balanced rise/fall?", opts: ["1:1", "2:1", "1:2", "3:1"], correctAnswer: "2:1" },
    { q: "What does 'GDSII' represent?", opts: ["Graphic Data System", "General Design Standard", "Global Digital Signal", "Grid Data Source"], correctAnswer: "Graphic Data System" },
    { q: "Which of these is a non-volatile memory in VLSI?", opts: ["SRAM", "DRAM", "EEPROM", "Register File"], correctAnswer: "EEPROM" },
    { q: "What is 'Crosstalk' in VLSI?", opts: ["Radio interference", "Unwanted signal coupling between adjacent wires", "Logic errors", "Power surge"], correctAnswer: "Unwanted signal coupling between adjacent wires" },
    { q: "Which clock distribution method minimizes skew?", opts: ["H-Tree", "Grid", "Daisy Chain", "Star"], correctAnswer: "H-Tree" },
    { q: "What is the purpose of 'Antenna Rules' in layout?", opts: ["Wireless communication", "Prevent gate damage during plasma etching", "Signal reception", "EMI shielding"], correctAnswer: "Prevent gate damage during plasma etching" },
    { q: "Which type of logic is faster but consumes more static power?", opts: ["Static CMOS", "Pass Transistor Logic", "CPL (Complementary Pass Logic)", "Pseudo-NMOS"], correctAnswer: "Pseudo-NMOS" },
    { q: "What is 'Logical Effort'?", opts: ["Complexity of a gate", "Ratio of input capacitance to an inverter", "Delay of a gate", "Power efficiency"], correctAnswer: "Ratio of input capacitance to an inverter" },
    { q: "In Verilog, what is the difference between '=' and '<='?", opts: ["Blocking vs Non-blocking", "Equal vs Less than", "Assignment vs Comparison", "Continuous vs Procedural"], correctAnswer: "Blocking vs Non-blocking" },
    { q: "What is a 'Scan Chain' used for?", opts: ["Memory access", "Design for Testability (DFT)", "Clock routing", "Power gating"], correctAnswer: "Design for Testability (DFT)" },
    { q: "What is 'Clock Gating'?", opts: ["Increasing clock frequency", "Disabling clock to idle modules to save power", "Synchronizing clocks", "Generating clock signals"], correctAnswer: "Disabling clock to idle modules to save power" },
    { q: "Which parasitics are dominant in 7nm and below?", opts: ["Gate resistance", "Interconnect resistance and capacitance", "Substrate resistance", "Source/Drain resistance"], correctAnswer: "Interconnect resistance and capacitance" },
    { q: "What is 'OVM/UVM' in VLSI?", opts: ["Optimization modules", "Verification methodologies", "Manufacturing standards", "Design patterns"], correctAnswer: "Verification methodologies" },
    { q: "What is 'TDP' in chip design?", opts: ["Total Design Power", "Thermal Design Power", "Timed Data Path", "True Digital Port"], correctAnswer: "Thermal Design Power" },
    { q: "Which effect causes current to flow even when Vgs < Vth?", opts: ["DIBL", "Subthreshold conduction", "Punch-through", "Velocity saturation"], correctAnswer: "Subthreshold conduction" },
    { q: "What is the 'FO4' delay?", opts: ["Delay of an inverter driving 4 identical inverters", "Frequency of 4GHz", "Fan-out of 4 bits", "Fourth order delay"], correctAnswer: "Delay of an inverter driving 4 identical inverters" },
    { q: "What does 'P&R' stand for?", opts: ["Power and Resistance", "Place and Route", "Plan and Review", "Point and Record"], correctAnswer: "Place and Route" },
    { q: "Which layer is used for global power routing?", opts: ["Poly", "M1", "Top Metal (Fat Metal)", "Diffusion"], correctAnswer: "Top Metal (Fat Metal)" },
    { q: "What is 'Negative Bias Temperature Instability' (NBTI)?", opts: ["Cooling effect", "Aging effect that increases Vth of PMOS", "Power surge", "Frequency shift"], correctAnswer: "Aging effect that increases Vth of PMOS" },
    { q: "What is 'Hold Time Violation'?", opts: ["Data arrives too late", "Data changes too soon after clock edge", "Clock is too fast", "Power is too low"], correctAnswer: "Data changes too soon after clock edge" },
    { q: "Which tool is used for Formal Verification?", opts: ["JasperGold", "Questasim", "VCS", "Vivado"], correctAnswer: "JasperGold" },
    { q: "What is the 'Alpha-power law' model used for?", opts: ["Power estimation", "Short-channel MOSFET delay estimation", "Area calculation", "Temperature modeling"], correctAnswer: "Short-channel MOSFET delay estimation" },
    { q: "What is 'Yield' in semiconductor manufacturing?", opts: ["Current produced", "Percentage of functional chips on a wafer", "Processing time", "Material cost"], correctAnswer: "Percentage of functional chips on a wafer" },
    { q: "What is 'CMP'?", opts: ["Chemical Mechanical Polishing", "Chip Multi-Processor", "Circuit Management Plan", "Current Mode Logic"], correctAnswer: "Chemical Mechanical Polishing" },
    { q: "What is a 'Via'?", opts: ["A routing path", "An interlayer connection between metals", "A transistor gate", "A substrate contact"], correctAnswer: "An interlayer connection between metals" }
  ],
  "AutoCAD": [
    { q: "Which command is used to create a 3D solid by rotating a 2D profile around an axis?", opts: ["EXTRUDE", "REVOLVE", "SWEEP", "LOFT"], correctAnswer: "REVOLVE" },
    { q: "What is the purpose of the 'UCS' command in AutoCAD?", opts: ["User Coordinate System", "Unit Conversion System", "Universal Control Script", "Utility Command Suite"], correctAnswer: "User Coordinate System" },
    { q: "In AutoCAD, what does the 'F3' key toggle?", opts: ["Ortho mode", "Object Snap", "Grid", "Polar Tracking"], correctAnswer: "Object Snap" },
    { q: "Which file format is the native drawing format for AutoCAD?", opts: [".DXF", ".DWG", ".DWT", ".PDF"], correctAnswer: ".DWG" },
    { q: "What is the command to create a block in AutoCAD?", opts: ["BLK", "MAKE", "BLOCK", "GROUP"], correctAnswer: "BLOCK" },
    { q: "Which command is used to combine two or more 3D solids into one?", opts: ["JOIN", "UNION", "MERGE", "COMBINE"], correctAnswer: "UNION" },
    { q: "What is the shortcut for the 'OFFSET' command?", opts: ["O", "OF", "OS", "OT"], correctAnswer: "O" },
    { q: "Which workspace is used for 3D modeling in AutoCAD?", opts: ["Drafting & Annotation", "3D Basics", "3D Modeling", "AutoCAD Classic"], correctAnswer: "3D Modeling" },
    { q: "What is the 'PAPER SPACE' used for?", opts: ["Drawing 3D models", "Setting up layouts and printing", "Drafting 2D sketches", "Defining materials"], correctAnswer: "Setting up layouts and printing" },
    { q: "Which command removes unused named objects (like layers or blocks)?", opts: ["CLEAN", "PURGE", "DELETE", "ERASE"], correctAnswer: "PURGE" },
    { q: "What is the 'LAYER 0' special property?", opts: ["It cannot be deleted", "Objects on it take properties of the block they are in", "It is always red", "Both A and B"], correctAnswer: "Both A and B" },
    { q: "Which command is used to create a pattern of objects in rows and columns?", opts: ["MIRROR", "COPY", "ARRAY", "OFFSET"], correctAnswer: "ARRAY" },
    { q: "What does 'XREF' stand for?", opts: ["Extended Reference", "External Reference", "X-axis Reference", "Extra Record"], correctAnswer: "External Reference" },
    { q: "Which key is used to cancel any running command?", opts: ["Enter", "Space", "Esc", "Backspace"], correctAnswer: "Esc" },
    { q: "What is 'Polar Tracking'?", opts: ["Tracking cursor in X-Y", "Restricting cursor to specified angles", "Drawing circles", "GPS integration"], correctAnswer: "Restricting cursor to specified angles" },
    { q: "Which command measures the distance between two points?", opts: ["DIST", "MEASURE", "LENGTH", "AREA"], correctAnswer: "DIST" },
    { q: "What is the 'FILLET' command used for?", opts: ["Creating sharp corners", "Rounding corners", "Joining lines", "Splitting lines"], correctAnswer: "Rounding corners" },
    { q: "Which command is used to convert a closed polyline into a 3D solid by giving it height?", opts: ["EXTRUDE", "LOFT", "PRESSPULL", "THICKEN"], correctAnswer: "EXTRUDE" },
    { q: "What is a 'Viewport'?", opts: ["A window into Model Space from Paper Space", "A 3D camera", "A rendering tool", "A file preview"], correctAnswer: "A window into Model Space from Paper Space" },
    { q: "What is the extension for an AutoCAD Template file?", opts: [".dwg", ".dxf", ".dwt", ".bak"], correctAnswer: ".dwt" },
    { q: "Which command is used to break an object into its component parts?", opts: ["EXPLODE", "BREAK", "SPLIT", "DIVIDE"], correctAnswer: "EXPLODE" },
    { q: "What is 'WBLOCK' used for?", opts: ["Writing a block to a new drawing file", "Locking a block", "Creating a web block", "Window block selection"], correctAnswer: "Writing a block to a new drawing file" },
    { q: "Which command is used to draw an infinite line?", opts: ["LINE", "PLINE", "XLINE", "MLINE"], correctAnswer: "XLINE" },
    { q: "What is the function of 'F8' in AutoCAD?", opts: ["Grid", "Snap", "Ortho", "Polar"], correctAnswer: "Ortho" },
    { q: "Which command is used to stretch objects?", opts: ["SCALE", "EXTEND", "STRETCH", "LENGTHEN"], correctAnswer: "STRETCH" },
    { q: "What is the 'MATCHPROP' command used for?", opts: ["Matching geometry", "Copying properties from one object to another", "Aligning objects", "Finding similar items"], correctAnswer: "Copying properties from one object to another" },
    { q: "In 3D, what does 'Z-axis' represent?", opts: ["Length", "Width", "Height/Depth", "Time"], correctAnswer: "Height/Depth" },
    { q: "Which command is used to create a 3D solid from the space between two or more existing solids?", opts: ["INTERSECT", "SUBTRACT", "UNION", "SLICE"], correctAnswer: "INTERSECT" },
    { q: "What is 'Dynamic Input'?", opts: ["A way to enter commands at the cursor", "Real-time physics", "Voice commands", "Auto-scaling"], correctAnswer: "A way to enter commands at the cursor" },
    { q: "Which command is used to create text that flows along an arc?", opts: ["TEXT", "MTEXT", "ARCTEXT", "POLYGON"], correctAnswer: "ARCTEXT" },
    { q: "What is the 'HATCH' command used for?", opts: ["Filling an area with a pattern", "Drawing cross-sections", "Locking objects", "Creating layers"], correctAnswer: "Filling an area with a pattern" },
    { q: "Which command changes the scale of an object?", opts: ["STRETCH", "SCALE", "ZOOM", "RESIZE"], correctAnswer: "SCALE" },
    { q: "What is the shortcut for 'Trim'?", opts: ["TR", "T", "TM", "TRI"], correctAnswer: "TR" },
    { q: "Which coordinate system uses distances and angles (e.g., @5<45)?", opts: ["Absolute", "Relative Rectangular", "Polar", "Spherical"], correctAnswer: "Polar" },
    { q: "What is the 'Design Center' (CTRL+2) used for?", opts: ["Rendering", "Accessing content from other drawings", "Customer support", "Writing scripts"], correctAnswer: "Accessing content from other drawings" },
    { q: "Which command is used to mirror objects in 3D?", opts: ["MIRROR", "MIRROR3D", "3DMIRROR", "FLIP"], correctAnswer: "MIRROR3D" },
    { q: "What is the 'PROPERTIES' palette shortcut?", opts: ["CTRL+1", "CTRL+P", "CTRL+M", "F1"], correctAnswer: "CTRL+1" },
    { q: "Which command creates a region from an enclosed area?", opts: ["REGION", "BOUNDARY", "POLY", "AREA"], correctAnswer: "REGION" },
    { q: "What is 'Visual Style' in AutoCAD?", opts: ["A font style", "How 3D objects are displayed (e.g., Wireframe, Realistic)", "A layout theme", "A layer property"], correctAnswer: "How 3D objects are displayed (e.g., Wireframe, Realistic)" },
    { q: "Which command is used to rotate objects in 2D?", opts: ["ROT", "ROTATE", "RO", "TURN"], correctAnswer: "RO" }
  ],
  "Embedded Systems": [
    { q: "What is a 'Priority Inversion' in RTOS?", opts: ["High priority task waits for low priority task", "Interrupts are disabled", "Stack overflow", "Context switch delay"], correctAnswer: "High priority task waits for low priority task" },
    { q: "Which communication protocol uses a 2-wire interface (SDA and SCL)?", opts: ["SPI", "UART", "I2C", "CAN"], correctAnswer: "I2C" },
    { q: "What is the purpose of a Watchdog Timer (WDT)?", opts: ["Measure clock speed", "Reset system on software hang", "Power saving", "PWM generation"], correctAnswer: "Reset system on software hang" },
    { q: "In ARM architecture, what is the 'Link Register' (LR) used for?", opts: ["Arithmetic results", "Stack pointer", "Return address from subroutines", "Program counter"], correctAnswer: "Return address from subroutines" },
    { q: "Which memory type is typically used for executable code in microcontrollers?", opts: ["SRAM", "EEPROM", "Flash", "DRAM"], correctAnswer: "Flash" },
    { q: "What is 'Jitter' in an embedded system?", opts: ["Noise in signal", "Variation in time between periodic events", "Power fluctuation", "Frequency shift"], correctAnswer: "Variation in time between periodic events" },
    { q: "Which of the following is a hard real-time system?", opts: ["Video player", "Airbag deployment system", "E-commerce website", "Smart TV"], correctAnswer: "Airbag deployment system" },
    { q: "What is the 'Critical Section' of code?", opts: ["The main function", "Code that accesses shared resources", "Exception handlers", "Initialization code"], correctAnswer: "Code that accesses shared resources" },
    { q: "Which protocol is full-duplex and uses 4 wires (MOSI, MISO, SCK, CS)?", opts: ["I2C", "UART", "SPI", "1-Wire"], correctAnswer: "SPI" },
    { q: "What is 'Interrupt Latency'?", opts: ["Time to finish interrupt", "Time from interrupt trigger to start of ISR", "Duration of ISR", "Frequency of interrupts"], correctAnswer: "Time from interrupt trigger to start of ISR" },
    { q: "What is the purpose of 'DMA' (Direct Memory Access)?", opts: ["Speed up CPU", "Data transfer between memory and peripherals without CPU", "Expand RAM", "Manage stack"], correctAnswer: "Data transfer between memory and peripherals without CPU" },
    { q: "Which register in ARM holds the address of the current instruction being executed?", opts: ["R0", "R13 (SP)", "R14 (LR)", "R15 (PC)"], correctAnswer: "R15 (PC)" },
    { q: "In C, what does the 'volatile' keyword tell the compiler?", opts: ["Value is constant", "Value can change unexpectedly", "Optimize this variable", "Store in register"], correctAnswer: "Value can change unexpectedly" },
    { q: "What is a 'Semaphore' used for?", opts: ["Math operations", "Task synchronization and resource management", "Clock generation", "Error correction"], correctAnswer: "Task synchronization and resource management" },
    { q: "Which architecture uses separate buses for instruction and data?", opts: ["Von Neumann", "Harvard", "CISC", "RISC"], correctAnswer: "Harvard" },
    { q: "What is 'Bootloader'?", opts: ["A peripheral driver", "Code that runs on power-up to load OS/App", "A debug tool", "An OS kernel"], correctAnswer: "Code that runs on power-up to load OS/App" },
    { q: "What is the standard baud rate for UART?", opts: ["9600", "115200", "Both A and B", "9999"], correctAnswer: "Both A and B" },
    { q: "What is 'Little Endian'?", opts: ["LSB at highest address", "LSB at lowest address", "MSB at lowest address", "Random byte order"], correctAnswer: "LSB at lowest address" },
    { q: "Which of these is a typical 8-bit microcontroller?", opts: ["ARM Cortex-M", "8051", "Pentium", "STM32"], correctAnswer: "8051" },
    { q: "What is 'CAN' bus primarily used for?", opts: ["Home automation", "Automotive electronics", "Medical devices", "Networking"], correctAnswer: "Automotive electronics" },
    { q: "What is the purpose of 'Pull-up' resistors on I2C lines?", opts: ["To limit current", "To maintain high logic level when idle", "To filter noise", "To protect against ESD"], correctAnswer: "To maintain high logic level when idle" },
    { q: "What is 'RTOS'?", opts: ["Real Time Operating System", "Remote Task Operating System", "Random Task OS", "Robust Task OS"], correctAnswer: "Real Time Operating System" },
    { q: "Which scheduling algorithm is commonly used in RTOS?", opts: ["FCFS", "Round Robin with Priority", "Shortest Job First", "LIFO"], correctAnswer: "Round Robin with Priority" },
    { q: "What is 'Bit-banging'?", opts: ["A security attack", "Implementing serial communication via software", "Hardware acceleration", "Memory corruption"], correctAnswer: "Implementing serial communication via software" },
    { q: "Which ARM mode is used for normal program execution?", opts: ["User mode", "System mode", "Supervisor mode", "Abort mode"], correctAnswer: "User mode" },
    { q: "What is 'PWM' used for in embedded systems?", opts: ["Power management", "Controlling motor speed and LED brightness", "Data encryption", "Clock division"], correctAnswer: "Controlling motor speed and LED brightness" },
    { q: "What is 'Deadlock'?", opts: ["CPU hang", "Tasks waiting for each other to release resources", "Memory leak", "Stack overflow"], correctAnswer: "Tasks waiting for each other to release resources" },
    { q: "Which file format is used to flash code into a microcontroller?", opts: [".txt", ".hex", ".doc", ".exe"], correctAnswer: ".hex" },
    { q: "What is 'ISR'?", opts: ["Instruction Set Register", "Interrupt Service Routine", "Input Signal Receiver", "Internal System Report"], correctAnswer: "Interrupt Service Routine" },
    { q: "What is the purpose of a 'Mutex'?", opts: ["Multiply and execute", "Mutual Exclusion for shared resources", "Multi-tasking", "Memory utility"], correctAnswer: "Mutual Exclusion for shared resources" },
    { q: "Which compiler is commonly used for ARM?", opts: ["GCC", "Clang", "IAR/Keil", "All of the above"], correctAnswer: "All of the above" },
    { q: "What is 'Brown-out Reset'?", opts: ["Reset due to high temperature", "Reset when supply voltage drops below threshold", "Manual reset", "Watchdog reset"], correctAnswer: "Reset when supply voltage drops below threshold" },
    { q: "What is 'In-Circuit Emulation' (ICE)?", opts: ["Simulating code", "Hardware debugging in real-time", "Chip manufacturing", "Circuit testing"], correctAnswer: "Hardware debugging in real-time" },
    { q: "Which sensor uses I2C or SPI?", opts: ["Accelerometer", "Push button", "LED", "Speaker"], correctAnswer: "Accelerometer" },
    { q: "What is 'GPIO'?", opts: ["General Purpose Input Output", "Global Power Interface Office", "Graphics Port Input", "Ground Power Input"], correctAnswer: "General Purpose Input Output" },
    { q: "Which ARM instruction set is 16-bit compressed?", opts: ["ARM", "Thumb", "Jazelle", "Neon"], correctAnswer: "Thumb" },
    { q: "What is 'Sleep Mode'?", opts: ["CPU running at full speed", "Low power state where clock is stopped", "Turning off power completely", "Screen saver"], correctAnswer: "Low power state where clock is stopped" },
    { q: "What is 'Endianness'?", opts: ["Word length", "Byte ordering in memory", "CPU speed", "Instruction set"], correctAnswer: "Byte ordering in memory" },
    { q: "Which type of interrupt cannot be disabled by the software?", opts: ["IRQ", "FIQ", "NMI (Non-Maskable Interrupt)", "Software Interrupt"], correctAnswer: "NMI (Non-Maskable Interrupt)" },
    { q: "What is 'Throughput' in a real-time system?", opts: ["Number of tasks completed per unit time", "Memory speed", "Clock cycle", "Latency"], correctAnswer: "Number of tasks completed per unit time" }
  ],
  "Civil Engineering": [
    { q: "What is the Poisson's ratio for concrete?", opts: ["0.10 - 0.20", "0.25 - 0.35", "0.40 - 0.50", "0.60 - 0.70"], correctAnswer: "0.10 - 0.20" },
    { q: "In survey, what is the 'True Meridian'?", opts: ["Line passing through magnetic poles", "Line passing through geographical poles", "Fixed reference line", "Arbitrary line"], correctAnswer: "Line passing through geographical poles" }
  ],
  "Data Analytics": [
    { q: "Which SQL clause is used to filter records after aggregation?", opts: ["WHERE", "HAVING", "GROUP BY", "FILTER"], correctAnswer: "HAVING" },
    { q: "In statistics, what is the 'p-value'?", opts: ["Probability of null hypothesis being true", "Probability of alternative hypothesis", "Confidence interval", "Standard deviation"], correctAnswer: "Probability of null hypothesis being true" },
    { q: "Which of the following is a non-volatile memory in a computer?", opts: ["SRAM", "DRAM", "ROM", "Registers"], correctAnswer: "ROM" },
    { q: "What is the purpose of a 'Window Function' in SQL?", opts: ["Filter rows", "Perform calculation across a set of table rows", "Join tables", "Create views"], correctAnswer: "Perform calculation across a set of table rows" },
    { q: "Which visualization is best for showing the distribution of a single continuous variable?", opts: ["Pie Chart", "Histogram", "Scatter Plot", "Bar Chart"], correctAnswer: "Histogram" }
  ],
  "Data Science": [
    { q: "What is 'Overfitting' in Machine Learning?", opts: ["Model performs well on training but poor on test", "Model performs poor on both", "Model is too simple", "High bias"], correctAnswer: "Model performs well on training but poor on test" },
    { q: "Which algorithm is used for dimensionality reduction?", opts: ["Random Forest", "PCA", "SVM", "Logistic Regression"], correctAnswer: "PCA" },
    { q: "What does 'Bias' represent in a model?", opts: ["Error due to overly complex model", "Error due to overly simple model", "Random noise", "Data leakage"], correctAnswer: "Error due to overly simple model" },
    { q: "In a neural network, what is the purpose of an 'Activation Function'?", opts: ["Normalize input", "Introduce non-linearity", "Update weights", "Backpropagation"], correctAnswer: "Introduce non-linearity" },
    { q: "What is the 'F1 Score' a harmonic mean of?", opts: ["Bias and Variance", "Precision and Recall", "Accuracy and Loss", "TP and TN"], correctAnswer: "Precision and Recall" }
  ],
  "Electric Vehicles": [
    { q: "Which motor is most commonly used in Tesla vehicles?", opts: ["DC Shunt Motor", "AC Induction Motor", "PMSM", "Universal Motor"], correctAnswer: "AC Induction Motor" },
    { q: "What is the role of a 'BMS' in an EV?", opts: ["Brake Monitoring System", "Battery Management System", "Bluetooth Media System", "Base Mount Support"], correctAnswer: "Battery Management System" },
    { q: "What is 'Regenerative Braking'?", opts: ["Charging battery during braking", "Self-repairing brakes", "ABS system", "Hydraulic failure"], correctAnswer: "Charging battery during braking" },
    { q: "Which battery chemistry is known for high energy density but safety concerns?", opts: ["LiFePO4", "NMC", "Lead-Acid", "Ni-MH"], correctAnswer: "NMC" },
    { q: "What does 'SoC' stand for in battery technology?", opts: ["Source of Charge", "State of Charge", "Stability of Current", "Solid on Cell"], correctAnswer: "State of Charge" }
  ],
  "AI & Machine Learning": [
    { q: "What is the 'Turing Test' designed to measure?", opts: ["Hardware speed", "Machine intelligence", "Algorithm complexity", "Memory capacity"], correctAnswer: "Machine intelligence" },
    { q: "In NLP, what does 'Stemming' refer to?", opts: ["Removing stop words", "Reducing words to their root form", "Part-of-speech tagging", "Sentiment analysis"], correctAnswer: "Reducing words to their root form" },
    { q: "Which of the following is a 'Generative AI' model?", opts: ["XGBoost", "GPT-4", "K-Means", "Decision Tree"], correctAnswer: "GPT-4" },
    { q: "What is a 'Convolutional Neural Network' (CNN) primarily used for?", opts: ["Text generation", "Image processing", "Time series analysis", "Tabular data"], correctAnswer: "Image processing" },
    { q: "In reinforcement learning, what is the 'Reward'?", opts: ["Input data", "Feedback from environment", "Model parameters", "Loss function"], correctAnswer: "Feedback from environment" }
  ],
  "Cybersecurity": [
    { q: "What is a 'DDoS' attack?", opts: ["Distributed Denial of Service", "Direct Disk Operating System", "Data Delivery over Socket", "Dynamic Domain of Security"], correctAnswer: "Distributed Denial of Service" },
    { q: "Which protocol is used for secure web browsing?", opts: ["HTTP", "HTTPS", "FTP", "SSH"], correctAnswer: "HTTPS" }
  ],
  "Cloud Computing": [
    { q: "What is 'SaaS'?", opts: ["Software as a Service", "Storage as a Service", "Security as a Service", "System as a Service"], correctAnswer: "Software as a Service" },
    { q: "Which cloud service model provides a virtual machine to the user?", opts: ["IaaS", "PaaS", "SaaS", "DaaS"], correctAnswer: "IaaS" }
  ]
};

export const DSA_HARD_POOL = [
  {
    title: "Trapping Rain Water",
    desc: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    objective: "Understand 2-pointer or stack-based approach to solve elevation mapping in O(N) time.",
    task: "Complete the function `solve` that takes a space-separated string of heights and returns the total water trapped.",
    inputFormat: "A space-separated string of integers.",
    outputFormat: "An integer representing the total water trapped.",
    sampleInput: "0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "The elevation map is trapped with 6 units of rain water.",
    initialCode: "function solve(input) {\n  const height = input.trim().split(/\\s+/).map(Number);\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0;\n  let res = 0;\n  \n  // Write your logic here\n  \n  return res;\n}",
    tests: [
      { id: 1, input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
      { id: 2, input: "4 2 0 3 2 5", expectedOutput: "9" },
      { id: 3, input: "1 1 1", expectedOutput: "0", isHidden: true },
      { id: 4, input: "5 4 1 2", expectedOutput: "1", isHidden: true },
      { id: 5, input: "0 2 0", expectedOutput: "0", isHidden: true },
      { id: 6, input: "2 0 2", expectedOutput: "2", isHidden: true },
      { id: 7, input: "3 0 0 2 0 4", expectedOutput: "10", isHidden: true },
      { id: 8, input: "10 9 1 1 6", expectedOutput: "8", isHidden: true },
      { id: 9, input: "0 0 0", expectedOutput: "0", isHidden: true },
      { id: 10, input: "5 5 1 7 1 1 5 2 7 6", expectedOutput: "23", isHidden: true }
    ]
  },
  {
    title: "Median of Two Sorted Arrays",
    desc: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    objective: "Implement a binary search algorithm to find the partition point across two sorted arrays.",
    task: "Complete the function `solve` that takes a string with two lines of space-separated integers and returns the median.",
    inputFormat: "Two lines of space-separated integers.",
    outputFormat: "A number representing the median.",
    sampleInput: "1 3\\n2",
    sampleOutput: "2",
    explanation: "Merged array is [1,2,3] and median is 2.",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  const nums1 = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];\n  const nums2 = lines[1] ? lines[1].trim().split(/\\s+/).map(Number) : [];\n  \n  // Write your logic here\n  \n  return 0;\n}",
    tests: [
      { id: 1, input: "1 3\\n2", expectedOutput: "2" },
      { id: 2, input: "1 2\\n3 4", expectedOutput: "2.5" },
      { id: 3, input: "0 0\\n0 0", expectedOutput: "0", isHidden: true },
      { id: 4, input: "\\n1", expectedOutput: "1", isHidden: true },
      { id: 5, input: "2\\n", expectedOutput: "2", isHidden: true },
      { id: 6, input: "1 3 8\\n7 9 10 11", expectedOutput: "8", isHidden: true },
      { id: 7, input: "1 2 3 4 5\\n6 7 8 9 10 11 12", expectedOutput: "6.5", isHidden: true },
      { id: 8, input: "100000\\n100001", expectedOutput: "100000.5", isHidden: true },
      { id: 9, input: "1 1 1\\n1 1 1", expectedOutput: "1", isHidden: true },
      { id: 10, input: "1 2\\n1 2 3", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "First Missing Positive",
    desc: "Given an unsorted integer array nums, return the smallest missing positive integer.",
    objective: "Understand cycle sort or hash mapping in-place.",
    task: "Complete the function `solve` that takes a space-separated string of numbers and returns the missing positive integer.",
    inputFormat: "A space-separated string of integers.",
    outputFormat: "The smallest missing positive integer.",
    sampleInput: "1 2 0",
    sampleOutput: "3",
    explanation: "The numbers in the array are 1, 2, 0. The smallest missing positive is 3.",
    initialCode: "function solve(input) {\n  const nums = input.trim().split(/\\s+/).map(Number);\n  \n  // Write your logic here\n  \n  return 1;\n}",
    tests: [
      { id: 1, input: "1 2 0", expectedOutput: "3" },
      { id: 2, input: "3 4 -1 1", expectedOutput: "2" },
      { id: 3, input: "7 8 9 11 12", expectedOutput: "1", isHidden: true },
      { id: 4, input: "1", expectedOutput: "2", isHidden: true },
      { id: 5, input: "-1 -2 -3", expectedOutput: "1", isHidden: true },
      { id: 6, input: "0 2 2 1 1", expectedOutput: "3", isHidden: true },
      { id: 7, input: "2 1", expectedOutput: "3", isHidden: true },
      { id: 8, input: "1 2 3 4 5", expectedOutput: "6", isHidden: true },
      { id: 9, input: "5 4 3 2 1", expectedOutput: "6", isHidden: true },
      { id: 10, input: "10000", expectedOutput: "1", isHidden: true }
    ]
  },
  {
    title: "Regular Expression Matching",
    desc: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character, and '*' matches zero or more of the preceding element.",
    objective: "Master dynamic programming for string pattern matching.",
    task: "Complete the function `solve` that takes a string with two lines (s and p) and returns 'true' or 'false'.",
    inputFormat: "Two lines: first line is string `s`, second line is pattern `p`.",
    outputFormat: "A boolean 'true' or 'false' as a string.",
    sampleInput: "aa\\na",
    sampleOutput: "false",
    explanation: "'a' does not match the entire string 'aa'.",
    initialCode: "function solve(input) {\n  const [s, p] = input.trim().split('\\n');\n  \n  // Write your logic here\n  \n  return false;\n}",
    tests: [
      { id: 1, input: "aa\\na", expectedOutput: "false" },
      { id: 2, input: "aa\\na*", expectedOutput: "true" },
      { id: 3, input: "ab\\n.*", expectedOutput: "true" },
      { id: 4, input: "aab\\nc*a*b", expectedOutput: "true" },
      { id: 5, input: "mississippi\\nmis*is*p*.", expectedOutput: "false" },
      { id: 6, input: "ab\\n.*c", expectedOutput: "false" },
      { id: 7, input: "aaa\\na*a", expectedOutput: "true" },
      { id: 8, input: "a\\nab*", expectedOutput: "true" },
      { id: 9, input: "bbbba\\n.*a*a", expectedOutput: "true" },
      { id: 10, input: "\\n.*", expectedOutput: "true" }
    ]
  },
  {
    title: "Sliding Window Maximum",
    desc: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.",
    objective: "Optimize window processing using a Deque or Heap in O(N).",
    task: "Complete the function `solve` that takes a string with two lines: the first line is the array (space-separated) and the second line is k.",
    inputFormat: "Line 1: space-separated integers. Line 2: integer k.",
    outputFormat: "Space-separated maximums for each window.",
    sampleInput: "1 3 -1 -3 5 3 6 7\\n3",
    sampleOutput: "3 3 5 5 6 7",
    explanation: "[1 3 -1] -> 3, [3 -1 -3] -> 3, [-1 -3 5] -> 5, etc.",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  const nums = lines[0].split(/\\s+/).map(Number);\n  const k = parseInt(lines[1]);\n  \n  // Write your logic here\n  \n  return \"\";\n}",
    tests: [
      { id: 1, input: "1 3 -1 -3 5 3 6 7\\n3", expectedOutput: "3 3 5 5 6 7" },
      { id: 2, input: "1\\n1", expectedOutput: "1" },
      { id: 3, input: "1 -1\\n1", expectedOutput: "1 -1", isHidden: true },
      { id: 4, input: "9 11\\n2", expectedOutput: "11", isHidden: true },
      { id: 5, input: "4 -2\\n2", expectedOutput: "4", isHidden: true },
      { id: 6, input: "1 2 3 4 5 6 7 8 9 10\\n3", expectedOutput: "3 4 5 6 7 8 9 10", isHidden: true },
      { id: 7, input: "10 9 8 7 6 5 4 3 2 1\\n3", expectedOutput: "10 9 8 7 6 5 4 3 2", isHidden: true },
      { id: 8, input: "1 3 1 2 0 5\\n3", expectedOutput: "3 3 2 5", isHidden: true },
      { id: 9, input: "-7 -8 7 5 7 1 6 0\\n4", expectedOutput: "7 7 7 7 7", isHidden: true },
      { id: 10, input: "1 2 3\\n1", expectedOutput: "1 2 3", isHidden: true }
    ]
  },
  {
    title: "Edit Distance",
    desc: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert, Delete, Replace.",
    objective: "Implement a 2D dynamic programming solution.",
    task: "Complete `solve` that takes two lines (word1 and word2) and returns the minimum operations.",
    inputFormat: "Line 1: word1. Line 2: word2.",
    outputFormat: "An integer representing minimum operations.",
    sampleInput: "horse\\nros",
    sampleOutput: "3",
    explanation: "horse -> rorse -> rose -> ros",
    initialCode: "function solve(input) {\n  const [w1, w2] = input.trim().split('\\n');\n  // Write your logic here\n  return 0;\n}",
    tests: [
      { id: 1, input: "horse\\nros", expectedOutput: "3" },
      { id: 2, input: "intention\\nexecution", expectedOutput: "5" },
      { id: 3, input: "abc\\nabc", expectedOutput: "0" },
      { id: 4, input: "a\\nb", expectedOutput: "1" },
      { id: 5, input: "abc\\n", expectedOutput: "3" },
      { id: 6, input: "\\nabc", expectedOutput: "3" },
      { id: 7, input: "dinitrophenylhydrazine\\nbenzalphenylhydrazone", expectedOutput: "7" },
      { id: 8, input: "plasma\\naltruism", expectedOutput: "6" },
      { id: 9, input: "zoologico\\nzoologist", expectedOutput: "3" },
      { id: 10, input: "distance\\nediting", expectedOutput: "5" }
    ]
  },
  {
    title: "N-Queens",
    desc: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions.",
    objective: "Apply backtracking to find all valid configurations.",
    task: "Complete `solve` that takes an integer n and returns the total number of solutions.",
    inputFormat: "An integer n.",
    outputFormat: "An integer representing the count of solutions.",
    sampleInput: "4",
    sampleOutput: "2",
    explanation: "There are two distinct solutions for a 4x4 board.",
    initialCode: "function solve(input) {\n  const n = parseInt(input);\n  // Write your logic here\n  return 0;\n}",
    tests: [
      { id: 1, input: "4", expectedOutput: "2" },
      { id: 2, input: "1", expectedOutput: "1" },
      { id: 3, input: "2", expectedOutput: "0", isHidden: true },
      { id: 4, input: "3", expectedOutput: "0", isHidden: true },
      { id: 5, input: "5", expectedOutput: "10", isHidden: true },
      { id: 6, input: "6", expectedOutput: "4", isHidden: true },
      { id: 7, input: "7", expectedOutput: "40", isHidden: true },
      { id: 8, input: "8", expectedOutput: "92", isHidden: true },
      { id: 9, input: "9", expectedOutput: "352", isHidden: true },
      { id: 10, input: "10", expectedOutput: "724", isHidden: true }
    ]
  },
  {
    title: "Edit Distance (Levenshtein)",
    desc: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
    objective: "Master string-based dynamic programming.",
    task: "Complete `solve` that takes two lines of strings.",
    inputFormat: "Two lines of strings.",
    outputFormat: "Minimum operations count.",
    sampleInput: "intention\\nexecution",
    sampleOutput: "5",
    explanation: "5 operations needed.",
    initialCode: "function solve(input) {\n  // Implementation here\n}",
    tests: [
       { id: 1, input: "intention\\nexecution", expectedOutput: "5" },
       { id: 2, input: "sunday\\nsaturday", expectedOutput: "3" },
       { id: 3, input: "abc\\ny", expectedOutput: "3" },
       { id: 4, input: "a\\na", expectedOutput: "0" },
       { id: 5, input: "gumbo\\ngambol", expectedOutput: "2" },
       { id: 6, input: "cat\\ncut", expectedOutput: "1" },
       { id: 7, input: "tcl\\ntk", expectedOutput: "2" },
       { id: 8, input: "javascript\\njava", expectedOutput: "6" },
       { id: 9, input: "python\\ncython", expectedOutput: "1" },
       { id: 10, input: "google\\nlookup", expectedOutput: "4" }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    objective: "Implement an efficient merge strategy using a Priority Queue or Divide and Conquer.",
    task: "Complete `solve` that takes multiple lines, each line is a space-separated sorted list.",
    inputFormat: "Multiple lines of space-separated integers.",
    outputFormat: "A single space-separated string of the merged sorted elements.",
    sampleInput: "1 4 5\\n1 3 4\\n2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    explanation: "Merging [1,4,5], [1,3,4], [2,6] results in [1,1,2,3,4,4,5,6].",
    initialCode: "function solve(input) {\n  const lists = input.trim().split('\\n').map(line => line.split(/\\s+/).map(Number));\n  // Write your logic here\n  return \"\";\n}",
    tests: [
      { id: 1, input: "1 4 5\\n1 3 4\\n2 6", expectedOutput: "1 1 2 3 4 4 5 6" },
      { id: 2, input: "", expectedOutput: "" },
      { id: 3, input: "1 2 3", expectedOutput: "1 2 3", isHidden: true },
      { id: 4, input: "1\\n0", expectedOutput: "0 1", isHidden: true },
      { id: 5, input: "5 10 15\\n1 2 3\\n7 8 9", expectedOutput: "1 2 3 5 7 8 9 10 15", isHidden: true },
      { id: 6, input: "-1 1\\n-3 1\\n4 10", expectedOutput: "-3 -1 1 1 4 10", isHidden: true },
      { id: 7, input: "1 1 1\\n1 1 1", expectedOutput: "1 1 1 1 1 1", isHidden: true },
      { id: 8, input: "10 20\\n5 25\\n2 30", expectedOutput: "2 5 10 20 25 30", isHidden: true },
      { id: 9, input: "100", expectedOutput: "100", isHidden: true },
      { id: 10, input: "1 5\\n2 6\\n3 7\\n4 8", expectedOutput: "1 2 3 4 5 6 7 8", isHidden: true }
    ]
  },
  {
    title: "Course Schedule II",
    desc: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return the ordering of courses you should take to finish all courses.",
    objective: "Master topological sorting in a directed acyclic graph (DAG).",
    task: "Complete `solve` that takes two lines: numCourses and prerequisites (pairs).",
    inputFormat: "Line 1: numCourses. Line 2: Space-separated pairs (a b a b).",
    outputFormat: "Space-separated ordering of courses (or empty if impossible).",
    sampleInput: "4\\n1 0 2 0 3 1 3 2",
    sampleOutput: "0 1 2 3",
    explanation: "0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3. Possible order: 0 1 2 3.",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  const numCourses = parseInt(lines[0]);\n  const pairs = lines[1] ? lines[1].split(/\\s+/).map(Number) : [];\n  // Write your logic here\n  return \"\";\n}",
    tests: [
      { id: 1, input: "4\\n1 0 2 0 3 1 3 2", expectedOutput: "0 1 2 3" },
      { id: 2, input: "2\\n1 0", expectedOutput: "0 1" },
      { id: 3, input: "2\\n1 0 0 1", expectedOutput: "", isHidden: true },
      { id: 4, input: "1\\n", expectedOutput: "0", isHidden: true },
      { id: 5, input: "3\\n1 0 2 1", expectedOutput: "0 1 2", isHidden: true },
      { id: 6, input: "3\\n0 1 1 2 2 0", expectedOutput: "", isHidden: true },
      { id: 7, input: "4\\n1 0 2 0 3 1", expectedOutput: "0 2 1 3", isHidden: true },
      { id: 8, input: "2\\n", expectedOutput: "0 1", isHidden: true },
      { id: 9, input: "5\\n1 0 2 0 3 1 4 2", expectedOutput: "0 1 2 3 4", isHidden: true },
      { id: 10, input: "4\\n1 0 0 1", expectedOutput: "", isHidden: true }
    ]
  },
  {
    title: "Wildcard Matching",
    desc: "Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for '?' and '*' where '?' matches any single character and '*' matches any sequence of characters (including the empty sequence).",
    objective: "Implement string matching with complex wildcard logic.",
    task: "Complete `solve` that takes two lines (s and p) and returns 'true' or 'false'.",
    inputFormat: "Line 1: string s. Line 2: pattern p.",
    outputFormat: "String 'true' or 'false'.",
    sampleInput: "aa\\n*",
    sampleOutput: "true",
    explanation: "'*' matches any sequence.",
    initialCode: "function solve(input) {\n  const [s, p] = input.trim().split('\\n');\n  // Write your logic here\n  return \"false\";\n}",
    tests: [
      { id: 1, input: "aa\\n*", expectedOutput: "true" },
      { id: 2, input: "cb\\n?a", expectedOutput: "false" },
      { id: 3, input: "adceb\\n*a*b", expectedOutput: "true" },
      { id: 4, input: "acdcb\\na*c?b", expectedOutput: "false" },
      { id: 5, input: "mississippi\\nm?ss*?i*i", expectedOutput: "true" },
      { id: 6, input: "abcde\\na*e", expectedOutput: "true" },
      { id: 7, input: "a\\na", expectedOutput: "true" },
      { id: 8, input: "\\n*", expectedOutput: "true" },
      { id: 9, input: "abcdefg\\na*g", expectedOutput: "true" },
      { id: 10, input: "aa\\n?", expectedOutput: "false" }
    ]
  },
  {
    title: "Binary Tree Maximum Path Sum",
    desc: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Given the root of a binary tree, return the maximum path sum of any non-empty path.",
    objective: "Use recursion to track global maximum while returning local path contributions.",
    task: "Complete `solve` that takes a space-separated string representing a level-order traversal of the tree (use 'null' for missing nodes).",
    inputFormat: "Space-separated level-order traversal string.",
    outputFormat: "Integer maximum path sum.",
    sampleInput: "-10 9 20 null null 15 7",
    sampleOutput: "42",
    explanation: "The path 15 -> 20 -> 7 has sum 15 + 20 + 7 = 42.",
    initialCode: "function solve(input) {\n  const nodes = input.trim().split(/\\s+/);\n  // Write your logic here\n  return 0;\n}",
    tests: [
      { id: 1, input: "-10 9 20 null null 15 7", expectedOutput: "42" },
      { id: 2, input: "1 2 3", expectedOutput: "6" },
      { id: 3, input: "-3", expectedOutput: "-3", isHidden: true },
      { id: 4, input: "2 -1", expectedOutput: "2", isHidden: true },
      { id: 5, input: "1 -2 -3 1 3 -2 null -1", expectedOutput: "3", isHidden: true },
      { id: 6, input: "5 4 8 11 null 13 4 7 2 null null null 1", expectedOutput: "48", isHidden: true },
      { id: 7, input: "-1 -2 -3", expectedOutput: "-1", isHidden: true },
      { id: 8, input: "1 2 null 3 null 4 null 5", expectedOutput: "15", isHidden: true },
      { id: 9, input: "10 2 10 20 1 null -25 null null null null 3 4", expectedOutput: "42", isHidden: true },
      { id: 10, input: "10 5 -3 3 2 null 11 3 -2 null 1", expectedOutput: "20", isHidden: true }
    ]
  },
  {
    title: "LRU Cache Implementation",
    desc: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the solve function to process a series of 'PUT' and 'GET' commands.",
    objective: "Manage key-value pairs with O(1) time complexity for both operations.",
    task: "Complete `solve` that takes a space-separated series of commands (e.g., 'PUT 1 1 PUT 2 2 GET 1').",
    inputFormat: "Space-separated commands and values.",
    outputFormat: "Space-separated results of GET commands (or -1 if not found).",
    sampleInput: "PUT 1 1 PUT 2 2 GET 1 PUT 3 3 GET 2 PUT 4 4 GET 1 GET 3 GET 4",
    sampleOutput: "1 -1 -1 3 4",
    explanation: "Standard LRU behavior with capacity 2 assumed for this problem.",
    initialCode: "function solve(input) {\n  const commands = input.trim().split(/\\s+/);\n  // Write your logic here\n  return \"\";\n}",
    tests: [
      { id: 1, input: "PUT 1 1 PUT 2 2 GET 1 PUT 3 3 GET 2 PUT 4 4 GET 1 GET 3 GET 4", expectedOutput: "1 -1 -1 3 4" },
      { id: 2, input: "GET 1", expectedOutput: "-1" },
      { id: 3, input: "PUT 1 1 GET 1", expectedOutput: "1" },
      { id: 4, input: "PUT 1 1 PUT 1 2 GET 1", expectedOutput: "2" },
      { id: 5, input: "PUT 1 1 PUT 2 2 GET 2 GET 1", expectedOutput: "2 1" },
      { id: 6, input: "PUT 1 1 PUT 2 2 PUT 3 3 GET 1", expectedOutput: "-1" },
      { id: 7, input: "PUT 2 1 GET 2", expectedOutput: "1" },
      { id: 8, input: "PUT 1 1 PUT 2 2 GET 1 PUT 3 3 GET 2", expectedOutput: "1 -1" },
      { id: 9, input: "PUT 10 10 GET 10", expectedOutput: "10" },
      { id: 10, input: "PUT 1 1 PUT 2 2 GET 1 GET 2", expectedOutput: "1 2" }
    ]
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    desc: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.",
    objective: "Master tree traversal and string encoding.",
    task: "Complete `solve` that takes a level-order string and returns the same level-order string after performing serialization and deserialization.",
    inputFormat: "Level-order traversal string.",
    outputFormat: "Same level-order traversal string.",
    sampleInput: "1 2 3 null null 4 5",
    sampleOutput: "1 2 3 null null 4 5",
    explanation: "Ensures the tree structure is preserved after conversion.",
    initialCode: "function solve(input) {\n  // Implementation here\n  return input;\n}",
    tests: [
      { id: 1, input: "1 2 3 null null 4 5", expectedOutput: "1 2 3 null null 4 5" },
      { id: 2, input: "null", expectedOutput: "null" },
      { id: 3, input: "1", expectedOutput: "1" },
      { id: 4, input: "1 2", expectedOutput: "1 2" },
      { id: 5, input: "1 null 2", expectedOutput: "1 null 2" },
      { id: 6, input: "1 2 3 4 5 6 7", expectedOutput: "1 2 3 4 5 6 7" },
      { id: 7, input: "10 20 30 null 40", expectedOutput: "10 20 30 null 40" },
      { id: 8, input: "5 4 7 3 null 2 null -1 null 9", expectedOutput: "5 4 7 3 null 2 null -1 null 9" },
      { id: 9, input: "1 2 3 null null null null", expectedOutput: "1 2 3" },
      { id: 10, input: "100 200", expectedOutput: "100 200" }
    ]
  },
  {
    title: "Kth Smallest Element in a BST",
    desc: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    objective: "Implement an efficient in-order traversal of a BST.",
    task: "Complete `solve` that takes a level-order string and k.",
    inputFormat: "Line 1: Level-order string. Line 2: Integer k.",
    outputFormat: "The kth smallest integer.",
    sampleInput: "3 1 4 null 2\\n1",
    sampleOutput: "1",
    explanation: "Sorted nodes: 1, 2, 3, 4. 1st smallest is 1.",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  const nodes = lines[0].split(/\\s+/);\n  const k = parseInt(lines[1]);\n  return 0;\n}",
    tests: [
      { id: 1, input: "3 1 4 null 2\\n1", expectedOutput: "1" },
      { id: 2, input: "5 3 6 2 4 null null 1\\n3", expectedOutput: "3" },
      { id: 3, input: "2 1 3\\n2", expectedOutput: "2" },
      { id: 4, input: "1\\n1", expectedOutput: "1" },
      { id: 5, input: "10 5 15 2 7 12 20\\n4", expectedOutput: "10" },
      { id: 6, input: "10 5 15 2 7 12 20\\n7", expectedOutput: "20" },
      { id: 7, input: "10 5 15 2 7 12 20\\n1", expectedOutput: "2" },
      { id: 8, input: "10 5 15 2 7 12 20\\n3", expectedOutput: "7" },
      { id: 9, input: "20 10 30\\n2", expectedOutput: "20" },
      { id: 10, input: "100\\n1", expectedOutput: "100" }
    ]
  },
  {
    title: "Word Ladder",
    desc: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter. Return the number of words in the shortest transformation sequence.",
    objective: "Implement BFS to find the shortest path in a word transformation graph.",
    task: "Complete `solve` that takes three lines: beginWord, endWord, and space-separated wordList.",
    inputFormat: "Line 1: beginWord. Line 2: endWord. Line 3: wordList.",
    outputFormat: "Length of shortest sequence.",
    sampleInput: "hit\\ncog\\nhot dot dog lot log cog",
    sampleOutput: "5",
    explanation: "hit -> hot -> dot -> dog -> cog (length 5).",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  // Write logic here\n  return 0;\n}",
    tests: [
      { id: 1, input: "hit\\ncog\\nhot dot dog lot log cog", expectedOutput: "5" },
      { id: 2, input: "hit\\ncog\\nhot dot dog lot log", expectedOutput: "0" },
      { id: 3, input: "a\\nc\\na b c", expectedOutput: "2" },
      { id: 4, input: "lost\\ncost\\nmost lost cost", expectedOutput: "2" },
      { id: 5, input: "talk\\ntail\\ntall tail talk", expectedOutput: "3" },
      { id: 6, input: "hot\\ndog\\nhot dog", expectedOutput: "0" },
      { id: 7, input: "cat\\nfin\\nfat fan fin cat", expectedOutput: "4" },
      { id: 8, input: "lead\\ngold\\nload goad gold lead", expectedOutput: "4" },
      { id: 9, input: "a\\nb\\na b", expectedOutput: "2" },
      { id: 10, input: "abc\\ndef\\nabc bbc bec dec def", expectedOutput: "5" }
    ]
  },
  {
    title: "Burst Balloons",
    desc: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it. You are asked to burst all the balloons. If you burst the ith balloon, you will get nums[i - 1] * nums[i] * nums[i + 1] coins. Return the maximum coins you can collect by bursting the balloons wisely.",
    objective: "Apply matrix chain multiplication style dynamic programming.",
    task: "Complete `solve` that takes a space-separated string of numbers and returns the max coins.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Maximum coins collected.",
    sampleInput: "3 1 5 8",
    sampleOutput: "167",
    explanation: "burst 1, then 5, then 3, then 8.",
    initialCode: "function solve(input) {\n  const nums = input.trim().split(/\\s+/).map(Number);\n  return 0;\n}",
    tests: [
      { id: 1, input: "3 1 5 8", expectedOutput: "167" },
      { id: 2, input: "1 5", expectedOutput: "10" },
      { id: 3, input: "1", expectedOutput: "1" },
      { id: 4, input: "7 9 8 0 7", expectedOutput: "1155" },
      { id: 5, input: "5 5 5", expectedOutput: "175" },
      { id: 6, input: "8 2 6 8 9 8 1 4 1 5", expectedOutput: "3446" },
      { id: 7, input: "3 5 8", expectedOutput: "152" },
      { id: 8, input: "1 2 3", expectedOutput: "12" },
      { id: 9, input: "10 20", expectedOutput: "210" },
      { id: 10, input: "1 2 3 4", expectedOutput: "40" }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock III",
    desc: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete at most two transactions. Note: You may not engage in multiple transactions simultaneously.",
    objective: "Apply state-based dynamic programming to solve multi-transaction profit maximization.",
    task: "Complete `solve` that takes a space-separated string of prices.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Maximum profit.",
    sampleInput: "3 3 5 0 0 3 1 4",
    sampleOutput: "6",
    explanation: "Buy at 0, sell at 3 (profit 3). Then buy at 1, sell at 4 (profit 3). Total 6.",
    initialCode: "function solve(input) {\n  const prices = input.trim().split(/\\s+/).map(Number);\n  return 0;\n}",
    tests: [
      { id: 1, input: "3 3 5 0 0 3 1 4", expectedOutput: "6" },
      { id: 2, input: "1 2 3 4 5", expectedOutput: "4" },
      { id: 3, input: "7 6 4 3 1", expectedOutput: "0" },
      { id: 4, input: "1", expectedOutput: "0" },
      { id: 5, input: "1 2 4 2 5 7 2 4 9 0", expectedOutput: "13" },
      { id: 6, input: "10 22 5 75 65 80", expectedOutput: "87" },
      { id: 7, input: "2 30 15 10 8 25 80", expectedOutput: "100" },
      { id: 8, input: "100 30 15 10 8 25 80", expectedOutput: "72" },
      { id: 9, input: "1 2", expectedOutput: "1" },
      { id: 10, input: "1 2 1 2 1 2", expectedOutput: "2" }
    ]
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    desc: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.",
    objective: "Master recursive tree traversal and backtracking.",
    task: "Complete `solve` that takes three lines: level-order string, node value p, node value q.",
    inputFormat: "Line 1: Level-order. Line 2: Node p. Line 3: Node q.",
    outputFormat: "LCA node value.",
    sampleInput: "3 5 1 6 2 0 8 null null 7 4\\n5\\n1",
    sampleOutput: "3",
    explanation: "LCA of 5 and 1 is 3.",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  return 0;\n}",
    tests: [
      { id: 1, input: "3 5 1 6 2 0 8 null null 7 4\\n5\\n1", expectedOutput: "3" },
      { id: 2, input: "3 5 1 6 2 0 8 null null 7 4\\n5\\n4", expectedOutput: "5" },
      { id: 3, input: "1 2\\n1\\n2", expectedOutput: "1" },
      { id: 4, input: "3 5 1 6 2 0 8 null null 7 4\\n6\\n8", expectedOutput: "3" },
      { id: 5, input: "3 5 1 6 2 0 8 null null 7 4\\n7\\n4", expectedOutput: "2" },
      { id: 6, input: "3 5 1 6 2 0 8 null null 7 4\\n0\\n8", expectedOutput: "1" },
      { id: 7, input: "1 2 3\\n2\\n3", expectedOutput: "1" },
      { id: 8, input: "10 5 15\\n5\\n15", expectedOutput: "10" },
      { id: 9, input: "5 3 6 2 4\\n2\\n4", expectedOutput: "3" },
      { id: 10, input: "100 50\\n100\\n50", expectedOutput: "100" }
    ]
  },
  {
    title: "Maximum Profit in Job Scheduling",
    desc: "We have n jobs, where every job is scheduled to be done from startTime[i] to endTime[i], obtaining a profit of profit[i]. You're given the startTime, endTime and profit arrays, return the maximum profit you can take such that there are no two jobs in the subset with overlapping time ranges.",
    objective: "Combine sorting, binary search, and dynamic programming.",
    task: "Complete `solve` that takes three lines of space-separated integers.",
    inputFormat: "Line 1: startTime. Line 2: endTime. Line 3: profit.",
    outputFormat: "Max profit.",
    sampleInput: "1 2 3 3\\n3 4 5 6\\n50 10 40 70",
    sampleOutput: "120",
    explanation: "Pick jobs 1 and 4 (profit 50+70=120).",
    initialCode: "function solve(input) {\n  const lines = input.trim().split('\\n');\n  return 0;\n}",
    tests: [
      { id: 1, input: "1 2 3 3\\n3 4 5 6\\n50 10 40 70", expectedOutput: "120" },
      { id: 2, input: "1 2 3 4 6\\n3 5 10 6 9\\n20 20 100 70 60", expectedOutput: "150" },
      { id: 3, input: "1 1 1\\n2 3 4\\n5 6 4", expectedOutput: "6" },
      { id: 4, input: "1 5\\n2 6\\n10 10", expectedOutput: "10" },
      { id: 5, input: "1 2 3 4\\n2 3 4 5\\n1 1 1 1", expectedOutput: "4" },
      { id: 6, input: "1 4 6 7\\n3 5 8 9\\n10 10 10 10", expectedOutput: "30" },
      { id: 7, input: "1 3 4 5 7\\n2 4 6 8 9\\n10 10 10 10 10", expectedOutput: "40" },
      { id: 8, input: "1 2 3 4 5\\n2 3 4 5 6\\n10 20 30 40 50", expectedOutput: "150" },
      { id: 9, input: "1 10\\n11 20\\n100 100", expectedOutput: "200" },
      { id: 10, input: "1 2 3\\n4 5 6\\n10 20 30", expectedOutput: "30" }
    ]
  }
];

export const WEB_DEV_POOL = [
  {
    title: "Netflix Clone Landing Page",
    desc: "Create a modern landing page for a streaming service like Netflix. The page should have a dark theme, a hero section with an email input to get started, and a series of feature sections. Ensure the layout is responsive.",
    objective: "Demonstrate proficiency in HTML5, CSS3, Flexbox/Grid, and responsive design.",
    task: "Write HTML and CSS code to build the landing page. Since this is an interactive IDE, write a function that returns a valid HTML string.",
    inputFormat: "None.",
    outputFormat: "A valid HTML string representing the landing page.",
    sampleInput: "()",
    sampleOutput: "\"<html>...</html>\"",
    explanation: "Return a string of HTML and CSS.",
    initialCode: "function createNetflixLanding() {\n  return `<html>\n<head><style>body { background: black; color: white; }</style></head>\n<body><h1>Unlimited movies</h1></body>\n</html>`;\n}",
    tests: [
      { id: 1, input: "()", expectedOutput: "CONTAINS:<html" },
      { id: 2, input: "()", expectedOutput: "CONTAINS:<style" },
      { id: 3, input: "()", expectedOutput: "CONTAINS:background" },
      { id: 4, input: "()", expectedOutput: "CONTAINS:<body" },
      { id: 5, input: "()", expectedOutput: "CONTAINS:<h1" },
      { id: 6, input: "()", expectedOutput: "CONTAINS:movies" },
      { id: 7, input: "()", expectedOutput: "CONTAINS:white" },
      { id: 8, input: "()", expectedOutput: "CONTAINS:black" },
      { id: 9, input: "()", expectedOutput: "CONTAINS:</body" },
      { id: 10, input: "()", expectedOutput: "CONTAINS:</html" }
    ]
  },
  {
    title: "GeoNixa UI Clone",
    desc: "Build a sleek, dark-themed login and assessment dashboard resembling the GeoNixa enterprise platform.",
    objective: "Demonstrate proficiency in creating secure, premium UIs using Flexbox and semantic tags.",
    task: "Return an HTML string representing the layout with a sidebar and a main content area.",
    inputFormat: "None.",
    outputFormat: "Valid HTML string.",
    sampleInput: "()",
    sampleOutput: "\"<html>...</html>\"",
    explanation: "Return a string containing the HTML structure.",
    initialCode: "function createGeoNixaClone() {\n  return `<div><aside>Sidebar</aside><main>Content</main></div>`;\n}",
    tests: [
      { id: 1, input: "()", expectedOutput: "CONTAINS:<div" },
      { id: 2, input: "()", expectedOutput: "CONTAINS:<aside" },
      { id: 3, input: "()", expectedOutput: "CONTAINS:<main" },
      { id: 4, input: "()", expectedOutput: "CONTAINS:Sidebar" },
      { id: 5, input: "()", expectedOutput: "CONTAINS:Content" },
      { id: 6, input: "()", expectedOutput: "CONTAINS:</main>" },
      { id: 7, input: "()", expectedOutput: "CONTAINS:</aside>" },
      { id: 8, input: "()", expectedOutput: "CONTAINS:</div>" },
      { id: 9, input: "()", expectedOutput: "CONTAINS:function" },
      { id: 10, input: "()", expectedOutput: "CONTAINS:return" }
    ]
  },
  {
    title: "Responsive Dashboard Layout",
    desc: "Create a fully responsive admin dashboard layout with a top navigation bar and a multi-column stats grid.",
    objective: "Master CSS Grid and media queries for complex data dashboards.",
    task: "Return an HTML string that uses Grid layouts.",
    inputFormat: "None",
    outputFormat: "Valid HTML string",
    sampleInput: "()",
    sampleOutput: "\"<html>...</html>\"",
    explanation: "Return the HTML string.",
    initialCode: "function createDashboard() {\n  return `<nav>Nav</nav><section class='grid'>Grid</section>`;\n}",
    tests: [
      { id: 1, input: "()", expectedOutput: "CONTAINS:<nav" },
      { id: 2, input: "()", expectedOutput: "CONTAINS:<section" },
      { id: 3, input: "()", expectedOutput: "CONTAINS:grid" },
      { id: 4, input: "()", expectedOutput: "CONTAINS:class=" },
      { id: 5, input: "()", expectedOutput: "CONTAINS:Nav" },
      { id: 6, input: "()", expectedOutput: "CONTAINS:</section>" },
      { id: 7, input: "()", expectedOutput: "CONTAINS:</nav>" },
      { id: 8, input: "()", expectedOutput: "CONTAINS:`" },
      { id: 9, input: "()", expectedOutput: "CONTAINS:{" },
      { id: 10, input: "()", expectedOutput: "CONTAINS:}" }
    ]
  },
  {
    title: "E-commerce Product Showcase",
    desc: "Build a premium e-commerce product page with a glassmorphic sidebar, an image gallery, and a floating 'Add to Cart' button.",
    objective: "Implement modern CSS effects like backdrop-filter and advanced transitions.",
    task: "Return a styled HTML string.",
    inputFormat: "None",
    outputFormat: "Styled HTML string",
    sampleInput: "()",
    sampleOutput: "\"<html>...</html>\"",
    explanation: "Focus on aesthetics and premium feel.",
    initialCode: "function createProductPage() {\n  return `<div style='backdrop-filter: blur(10px)'>Product</div>`;\n}",
    tests: [
      { id: 1, input: "()", expectedOutput: "CONTAINS:backdrop-filter" },
      { id: 2, input: "()", expectedOutput: "CONTAINS:blur" },
      { id: 3, input: "()", expectedOutput: "CONTAINS:Product" },
      { id: 4, input: "()", expectedOutput: "CONTAINS:style" },
      { id: 5, input: "()", expectedOutput: "CONTAINS:<div" },
      { id: 6, input: "()", expectedOutput: "CONTAINS:Add to Cart" },
      { id: 7, input: "()", expectedOutput: "CONTAINS:Gallery" },
      { id: 8, input: "()", expectedOutput: "CONTAINS:Price" },
      { id: 9, input: "()", expectedOutput: "CONTAINS:Description" },
      { id: 10, input: "()", expectedOutput: "CONTAINS:</html>" }
    ]
  }
];

// Merge generated questions into the existing pool if they don't exist
["AutoCAD", "VLSI Design", "Embedded Systems", "Electric Vehicles", "Civil Engineering"].forEach(domain => {
  if (!DOMAIN_MCQ_POOL[domain as keyof typeof DOMAIN_MCQ_POOL]) {
    (DOMAIN_MCQ_POOL as any)[domain] = Array.from({ length: 40 }, (_, i) => ({
      q: `[${domain}] Core Technical Concept Question ${i + 1}: Which of the following principles governs the primary operation of standard ${domain} systems?`,
      opts: [
        `Application of theoretical ${domain} mechanics.`,
        `Integration of secondary loop architectures.`,
        `Utilization of primary interface nodes.`,
        `None of the above.`
      ],
      correctAnswer: `Application of theoretical ${domain} mechanics.`
    }));
  }
});

export const TYPING_TOPICS_POOL = [
  "The impact of Artificial Intelligence on job markets and the future of human labor in a machine-driven economy.",
  "Sustainable urban planning: Creating green cities through vertical forests and renewable energy integration.",
  "The ethics of genetic engineering: Balancing scientific progress with moral responsibility in human DNA editing.",
  "Cybersecurity in the age of quantum computing: Protecting global data from unprecedented encryption threats.",
  "The philosophy of space exploration: Should humanity prioritize Mars colonization or Earth restoration?",
  "The psychology of social media: Analyzing the effects of digital connectivity on mental health and social behavior.",
  "Blockchain and the decentralization of finance: Can cryptocurrency truly replace traditional banking systems?",
  "The evolution of education: Transitioning from standard classroom models to personalized AI-driven learning.",
  "Climate change and global water security: Addressing the looming crisis of freshwater scarcity in the 21st century.",
  "The rise of remote work: How the pandemic accelerated a permanent shift in corporate culture and office life."
];

