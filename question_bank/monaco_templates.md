# Monaco Editor Minimal Templates

Guidelines: Provide only minimal syntax templates (2–3% of solution). Do NOT include algorithmic logic, loops, or branching that solves the problem. Only function/class skeletons and input parsing helpers where absolutely necessary.

Java

```
class Solution {
    public static void main(String[] args) throws Exception {
        // Read input and call `solve`.
    }

    public int solve(/* parameters as described in problem */) {
        // implement
        return 0; // placeholder
    }
}
```

Python

```
class Solution:
    def solve(self, /* params */):
        # implement
        return None

if __name__ == "__main__":
    s = Solution()
    # read input and call s.solve(...)
```

C++

```
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    long long solve(/* params */) {
        // implement
        return 0;
    }
};

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    Solution sol;
    // parse input and call sol.solve(...)
    return 0;
}
```

JavaScript (Node)

```
function solve(/* params */) {
    // implement
}

// read input from stdin and call solve
```

Monaco prompt recommendation (for exam config):
- System prompt: "Only return minimal syntax templates and function signatures. Do NOT provide solutions, pseudocode, or hints. Do NOT reveal hidden testcases."
- Student prompt template: "Implement `solve` to read input and print the required output. No external libraries beyond standard allowed."

Keep templates minimal and never include solution-specific logic.
