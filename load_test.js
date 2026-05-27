const http = require('http');

const url = 'http://localhost:3000/api/execute';
const numRequests = 25;

const testPayload = {
    code: 'function solve(nums) { return nums.reduce((a,b)=>a+b,0); }',
    language: 'javascript',
    questionTitle: 'sum of array',
    testCases: [
        { id: 1, input: '[1,2,3]', expectedOutput: '6', isHidden: false },
        { id: 2, input: '[10,20]', expectedOutput: '30', isHidden: true }
    ],
    mode: 'RUN'
};

async function makeRequest(id) {
    console.log(`[Request ${id}] Starting...`);
    const start = Date.now();
    
    return new Promise((resolve) => {
        const req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - start;
                try {
                    const parsed = JSON.parse(data);
                    console.log(`[Request ${id}] Finished in ${duration}ms. Status: ${res.statusCode}. Results: ${parsed.summary?.passed}/${parsed.summary?.total} passed.`);
                    resolve({ id, status: res.statusCode, duration, success: res.statusCode === 200 });
                } catch (e) {
                    console.log(`[Request ${id}] Finished in ${duration}ms with parsing error. Status: ${res.statusCode}`);
                    resolve({ id, status: res.statusCode, duration, success: false });
                }
            });
        });

        req.on('error', (e) => {
            const duration = Date.now() - start;
            console.log(`[Request ${id}] Failed in ${duration}ms. Error: ${e.message}`);
            resolve({ id, error: e.message, duration, success: false });
        });

        req.write(JSON.stringify(testPayload));
        req.end();
    });
}

async function runLoadTest() {
    console.log(`Starting load test with ${numRequests} concurrent requests...`);
    
    const promises = [];
    for (let i = 1; i <= numRequests; i++) {
        promises.push(makeRequest(i));
    }

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / results.length;

    console.log('\n--- LOAD TEST RESULTS ---');
    console.log(`Total Requests: ${results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    
    if (failed === 0) {
        console.log('✅ ALL TESTS PASSED. Concurrency handled correctly.');
    } else {
        console.log('❌ SOME TESTS FAILED. Backend may be overloaded or rate limited.');
    }
}

runLoadTest();
