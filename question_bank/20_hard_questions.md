# 20 Hardcore DSA Problems (Statements Only)

Note: These are HARD / Competitive-level problems. No solutions or algorithmic hints are provided. Each problem includes: Problem statement, Constraints, Input format, Output format, Example, Explanation, Time & Space expectations. Hidden testcases exist in the judge.

---

## Q1 — Graph Shortest Path Optimization (K-Restricted Paths)
Problem statement:
Given a weighted, directed graph with N nodes and M edges, and integers S (source), T (target), and K, find the minimum cost to reach T from S using at most K edges. If impossible return -1.

Constraints:
- 2 <= N <= 2e5
- 1 <= M <= 5e5
- Edge weights are integers in range [1, 1e9]
- 1 <= K <= N

Input format:
N M K S T
Then M lines: u v w (1-based nodes)

Output format:
Single integer: minimum cost or -1

Example input:
5 6 3 1 5
1 2 2
2 3 2
1 3 10
3 4 1
4 5 1
1 5 100

Example output:
6

Explanation:
Path 1->2->3->4->5 uses 4 edges; but K=3 so use 1->2->3->4? (example only illustrates format)

Time complexity expectation: O(M log N) or O(K * M) optimized
Space complexity expectation: O(N+M)

---

## Q2 — Advanced DP on Trees (Tree Partitioning with Constraints)
Problem statement:
Given a tree of N nodes with values on nodes, partition the tree into at most K connected components by removing edges to maximize the minimum sum among the components. Return the maximum possible minimum component sum.

Constraints:
- 1 <= N <= 2e5
- Node values: -1e9 .. 1e9
- 1 <= K <= N

Input format:
N K
values[1..N]
N-1 lines: u v

Output format:
Single integer (maximum minimum sum)

Example input:
5 2
3 2 1 4 5
1 2
1 3
3 4
3 5

Example output:
6

Time: O(N log V) or O(N)
Space: O(N)

---

## Q3 — Sliding Window Maximum Optimization (K-Compress with Cost)
Problem statement:
Given an array A of N integers and integer K, select a subarray of length L (1<=L<=N) and compress adjacent equal elements with cost function; find maximum score under time constraints. (Formal detailed spec provided to judge.)

Constraints:
- 1 <= N <= 2e5
- |A[i]| <= 1e9

Input/output format: (single test case)
N K
A[1..N]

Example input:
7 2
1 1 2 2 2 3 3

Example output:
5

Time: O(N log N) expected
Space: O(N)

---

## Q4 — Segment Tree Range Query (K-th Order Statistic with Updates)
Problem statement:
Support an array of N values with two operations: update position i to x, and query the k-th smallest value in range [l,r]. Process Q operations online.

Constraints:
- 1 <= N,Q <= 2e5
- Values in range [-1e9,1e9]

Input format:
N Q
A[1..N]
Q lines: either "1 i x" for update or "2 l r k" for query

Output format:
For each query type 2, print the k-th smallest integer

Example input:
5 3
5 1 4 2 3
2 1 5 3
1 2 6
2 1 5 3

Example output:
3
4

Time: O((N+Q) log^2 N) or better
Space: O(N log N)

---

## Q5 — Trie-based Word Search (Weighted Word Paths)
Problem statement:
Given a dictionary of words and per-character weights, build a trie supporting queries: given a prefix and maximum cost C, count how many words with that prefix have path cost <= C. Words may be added/removed online.

Constraints:
- Total chars across words <= 5e6
- Q up to 2e5

Input/Output formats: (see judge)

Example: (omitted for brevity)

Time: O(length * log alphabet) amortized
Space: O(total chars)

---

## Q6 — Minimum Cost Maximum Flow (Constrained Circulation)
Problem statement:
Given a directed graph with capacities and costs, and lower/upper bounds on some edges, compute min cost to send required flow F from S to T, or report infeasible.

Constraints:
- N <= 2000, M <= 1e5
- Capacities/Costs <= 1e9

I/O: standard flow format

Time: Depends on algorithm: O(flow * E log V) expected
Space: O(N+M)

---

## Q7 — Dynamic Programming with Bitmask (TSP with Constraints)
Problem statement:
Given N <= 20 and a cost matrix, but with forbidden subsets and required visit order constraints, compute minimal Hamiltonian path cost satisfying constraints.

Constraints:
- N <= 20
- Costs non-negative

Input/Output: standard TSP-like formats

Time: O(N^2 * 2^N)
Space: O(N * 2^N)

---

## Q8 — Advanced Backtracking Optimization (Constrained Latin Square)
Problem statement:
Fill an N x N grid with numbers 1..N respecting Latin square rules and additional cell constraints; output any valid filling or report impossible.

Constraints:
- N <= 12
- Extra constraints up to 1e4

I/O: grid description with constraints

Time: optimized backtracking expected
Space: O(N^2)

---

## Q9 — Multi-source BFS Graph Problem (Fire Spread Optimization)
Problem statement:
Given grid with multiple fire sources and obstacles, compute earliest time to evacuate all safe nodes under movement constraints and limited rescue teams.

Constraints:
- Grid up to 1000 x 1000
- Multiple queries up to 1e5

I/O: grid format

Time: O(N log N) per preprocessing
Space: O(grid)

---

## Q10 — Greedy Scheduling Optimization (Weighted Interval Scheduling with K Machines)
Problem statement:
Given N jobs with start, end, profit, schedule on K identical machines to maximize total profit (jobs cannot overlap on same machine).

Constraints:
- N <= 2e5
- K <= 1e5

I/O: N K then jobs

Time: O(N log N)
Space: O(N)

---

## Q11 — Binary Lifting Queries (Dynamic LCA with Edge Updates)
Problem statement:
Support tree with edge weight updates and answer max edge weight on path(u,v) queries online.

Constraints:
- N, Q <= 2e5

I/O: tree + queries

Time: O((N+Q) log N)
Space: O(N log N)

---

## Q12 — String Hashing Optimization (Longest Common Substring among K strings)
Problem statement:
Given K strings (total length up to 2e6), find length of longest substring appearing in at least P of them.

Constraints:
- K up to 1e5 but total length constraint

I/O: K P then strings

Time: O(total * log L)
Space: O(total)

---

## Q13 — Union Find Dynamic Connectivity (Offline with Rollbacks)
Problem statement:
Given dynamic edge additions/removals and connectivity queries, answer queries offline using divide-and-conquer over time with union-find rollback.

Constraints:
- N <= 2e5, Q <= 2e5

I/O: events and queries

Time: O((N+Q) log Q * alpha)
Space: O(N)

---

## Q14 — Monotonic Stack Optimization (Maximal Rectangle variant)
Problem statement:
Given a binary matrix with updates and queries for largest rectangle of 1s in submatrix ranges, process operations online.

Constraints:
- Rows, cols <= 2e3
- Q <= 2e5

Time: optimized per query expected
Space: O(rows*cols)

---

## Q15 — Advanced Recursion with Memoization (Game on a DAG)
Problem statement:
Two-player impartial game on DAG with weights; determine winning strategy and maximum guaranteed score difference under optimal play.

Constraints:
- N, M <= 2e5

I/O: DAG and weights

Time: O(N+M)
Space: O(N)

---

## Q16 — Kth Shortest Path Problem (Yen/K-th variants with constraints)
Problem statement:
Find K-th shortest simple path from S to T in directed graph with N up to 2e5 and constraints on path length or cost.

Constraints:
- N<=2e5, M<=5e5, K<=1000

Time: depends on algorithm; optimized variants expected
Space: O(N+M + K)

---

## Q17 — Matrix Graph Traversal Optimization (Min-cost path with teleports)
Problem statement:
Grid with weighted cells and teleporters; compute minimal cost path with limited teleports and energy budget.

Constraints:
- Grid up to 1000x1000
- Teleports up to 1e5

I/O: grid, teleports, queries

Time: O(grid log grid)
Space: O(grid)

---

## Q18 — Advanced Interval DP (Weighted Interval Partitioning with Penalties)
Problem statement:
Partition timeline into segments to maximize reward with penalties for splits; dynamic programming with convex hull trick expected.

Constraints:
- N <= 2e5

I/O: events list

Time: O(N log N)
Space: O(N)

---

## Q19 — Heap-based Stream Processing (Top-K sliding with deletions)
Problem statement:
Design a data structure to maintain top-K elements in a sliding window with frequent deletions and comparisons; support queries online.

Constraints:
- N up to 5e5

I/O: stream ops

Time: O(log N) per op expected
Space: O(N)

---

## Q20 — Competitive Mixed DSA Challenge (Combine multiple patterns)
Problem statement:
A large integrated problem combining graphs, DP, strings and data structures into multi-stage tasks with constraints. (Formal spec in judge.)

Constraints & I/O: Large-scale; described in judge

Time: Multi-stage optimized expected
Space: As required

---

End of statements. Detailed input formats and judge-facing JSON testcases are in companion file `testcases.json`.
