export const NEW_HARDCORE_DSA_POOL = [
  {
    "title": "Graph Shortest Path Optimization (K-Restricted Paths)",
    "desc": "Given a weighted, directed graph with N nodes and M edges, and integers S (source), T (target), and K, find the minimum cost to reach T from S using at most K edges. If impossible return -1.\n\nConstraints:\n- 2 <= N <= 2e5\n- 1 <= M <= 5e5\n- Edge weights are integers in range [1, 1e9]\n- 1 <= K <= N",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "N M K S T\nThen M lines: u v w (1-based nodes)",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Advanced DP on Trees (Tree Partitioning with Constraints)",
    "desc": "Given a tree of N nodes with values on nodes, partition the tree into at most K connected components by removing edges to maximize the minimum sum among the components. Return the maximum possible minimum component sum.\n\nConstraints:\n- 1 <= N <= 2e5\n- Node values: -1e9 .. 1e9\n- 1 <= K <= N",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "N K\nvalues[1..N]\nN-1 lines: u v",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Sliding Window Maximum Optimization (K-Compress with Cost)",
    "desc": "Given an array A of N integers and integer K, select a subarray of length L (1<=L<=N) and compress adjacent equal elements with cost function; find maximum score under time constraints. (Formal detailed spec provided to judge.)\n\nConstraints:\n- 1 <= N <= 2e5\n- |A[i]| <= 1e9",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "(single test case)\nN K\nA[1..N]",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Segment Tree Range Query (K-th Order Statistic with Updates)",
    "desc": "Support an array of N values with two operations: update position i to x, and query the k-th smallest value in range [l,r]. Process Q operations online.\n\nConstraints:\n- 1 <= N,Q <= 2e5\n- Values in range [-1e9,1e9]",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "N Q\nA[1..N]\nQ lines: either \"1 i x\" for update or \"2 l r k\" for query",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Trie-based Word Search (Weighted Word Paths)",
    "desc": "Given a dictionary of words and per-character weights, build a trie supporting queries: given a prefix and maximum cost C, count how many words with that prefix have path cost <= C. Words may be added/removed online.\n\nConstraints:\n",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "formats: (see judge)",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Minimum Cost Maximum Flow (Constrained Circulation)",
    "desc": "Given a directed graph with capacities and costs, and lower/upper bounds on some edges, compute min cost to send required flow F from S to T, or report infeasible.\n\nConstraints:\n- N <= 2000, M <= 1e5\n- Capacities/Costs <= 1e9",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "standard flow format",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Dynamic Programming with Bitmask (TSP with Constraints)",
    "desc": "Given N <= 20 and a cost matrix, but with forbidden subsets and required visit order constraints, compute minimal Hamiltonian path cost satisfying constraints.\n\nConstraints:\n- N <= 20\n- Costs non-negative",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "standard TSP-like formats",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Advanced Backtracking Optimization (Constrained Latin Square)",
    "desc": "Fill an N x N grid with numbers 1..N respecting Latin square rules and additional cell constraints; output any valid filling or report impossible.\n\nConstraints:\n- N <= 12\n- Extra constraints up to 1e4",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "grid description with constraints",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Multi-source BFS Graph Problem (Fire Spread Optimization)",
    "desc": "Given grid with multiple fire sources and obstacles, compute earliest time to evacuate all safe nodes under movement constraints and limited rescue teams.\n\nConstraints:\n- Grid up to 1000 x 1000\n- Multiple queries up to 1e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "grid format",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Greedy Scheduling Optimization (Weighted Interval Scheduling with K Machines)",
    "desc": "Given N jobs with start, end, profit, schedule on K identical machines to maximize total profit (jobs cannot overlap on same machine).\n\nConstraints:\n- N <= 2e5\n- K <= 1e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "N K then jobs",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Binary Lifting Queries (Dynamic LCA with Edge Updates)",
    "desc": "Support tree with edge weight updates and answer max edge weight on path(u,v) queries online.\n\nConstraints:\n- N, Q <= 2e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "tree + queries",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "String Hashing Optimization (Longest Common Substring among K strings)",
    "desc": "Given K strings (total length up to 2e6), find length of longest substring appearing in at least P of them.\n\nConstraints:\n- K up to 1e5 but total length constraint",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "K P then strings",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Union Find Dynamic Connectivity (Offline with Rollbacks)",
    "desc": "Given dynamic edge additions/removals and connectivity queries, answer queries offline using divide-and-conquer over time with union-find rollback.\n\nConstraints:\n- N <= 2e5, Q <= 2e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "events and queries",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Monotonic Stack Optimization (Maximal Rectangle variant)",
    "desc": "Given a binary matrix with updates and queries for largest rectangle of 1s in submatrix ranges, process operations online.\n\nConstraints:\n",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "Refer to problem description.",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Advanced Recursion with Memoization (Game on a DAG)",
    "desc": "Two-player impartial game on DAG with weights; determine winning strategy and maximum guaranteed score difference under optimal play.\n\nConstraints:\n- N, M <= 2e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "DAG and weights",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Kth Shortest Path Problem (Yen/K-th variants with constraints)",
    "desc": "Find K-th shortest simple path from S to T in directed graph with N up to 2e5 and constraints on path length or cost.\n\nConstraints:\n",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "Refer to problem description.",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Matrix Graph Traversal Optimization (Min-cost path with teleports)",
    "desc": "Grid with weighted cells and teleporters; compute minimal cost path with limited teleports and energy budget.\n\nConstraints:\n- Grid up to 1000x1000\n- Teleports up to 1e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "grid, teleports, queries",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Advanced Interval DP (Weighted Interval Partitioning with Penalties)",
    "desc": "Partition timeline into segments to maximize reward with penalties for splits; dynamic programming with convex hull trick expected.\n\nConstraints:\n- N <= 2e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "events list",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Heap-based Stream Processing (Top-K sliding with deletions)",
    "desc": "Design a data structure to maintain top-K elements in a sliding window with frequent deletions and comparisons; support queries online.\n\nConstraints:\n- N up to 5e5",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "stream ops",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  },
  {
    "title": "Competitive Mixed DSA Challenge (Combine multiple patterns)",
    "desc": "\n\nConstraints:\n",
    "objective": "Solve the problem optimally.",
    "task": "Implement an optimized approach.",
    "inputFormat": "Large-scale; described in judge",
    "outputFormat": "Refer to problem description.",
    "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
    "difficulty": "HARD",
    "tests": [
      {
        "id": 1,
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Standard hidden testcase."
      }
    ]
  }
];
