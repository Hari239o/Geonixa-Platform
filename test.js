function testSubstantialLines(typed, topic) {
    if (!typed || typed.trim().length < 20) return 0;
    if (topic) {
        const stopWords = new Set(['the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'to', 'for', 'with', 'as', 'by', 'an', 'be', 'it', 'are', 'you', 'that', 'this', 'they', 'have', 'from', 'which', 'what', 'how', 'why']);
        const topicWords = topic.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        const typedWordsStr = typed.toLowerCase();
        let matchCount = 0;
        topicWords.forEach(tw => { if (typedWordsStr.includes(tw)) matchCount++; });
        if (topicWords.length > 0 && matchCount === 0) return 0;
    }
    const words = typed.trim().split(/\s+/).filter(w => w.length > 0);
    return Math.floor(words.length / 15);
}

console.log('Test 1 - Short spam: ' + testSubstantialLines('a\nb\nc\nd\ne', 'AI impact')); // Length < 20
console.log('Test 2 - Long irrelevant spam (length >= 20): ' + testSubstantialLines('qwe rty uio pas dfg hjk lzx cvb qwe rty uio pas dfg', 'AI impact')); // Irrelevant
console.log('Test 3 - Correct topic but 15 words: ' + testSubstantialLines('the impact of artificial intelligence is huge for software development changing the way we code', 'AI impact')); 
console.log('Test 4 - 30 words relevant topic: ' + testSubstantialLines('the impact of artificial intelligence is huge for software development changing the way we code the impact of artificial intelligence is huge for software development changing the way we code', 'AI impact')); 
