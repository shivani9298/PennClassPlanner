# Penn Class Planner

A comprehensive course scheduling tool designed for University of Pennsylvania students pursuing a Computer and Information Science (CIS) major with flexible concentration options, minors, and double major choices. Built to help students plan their four-year course load while covering different interests.

All information from the University of Pennsylvania's website.
37CU tech elective list from: [cis-advising-handbook.github.io](https://cis-advising-handbook.github.io)

This planner creates optimized 4-year schedules that maximize double/triple counting across all degree requirements, helping you graduate efficiently while meeting all academic requirements. It acts as your personal academic advisor, ensuring you take the most efficient path to graduation.

## Key Features

- Interactive Web Interface - Modern React-based web app with Next.js 15
- Smart Course Selection - Choose your CIS concentration, add minors, and double majors
- Incoming Credits - Add AP, transfer, or other incoming credits
- Intelligent Algorithm - Priority-based scheduling with graph algorithms for prerequisite handling
- Multi-Counting Optimization - Maximizes efficiency by counting courses toward multiple requirements

## Degree Options

- CIS BSE Major (Main degree)
- CIS Concentrations: AI, Data Science, Systems, Software Foundations, Computer Vision, Cognitive Science, Computational Biology
- Statistics Minor
- Cognitive Science Double Major

## Technology Stack
- Frontend: React 19 with Next.js 15
- Styling: TailwindCSS
- Language: TypeScript
- Testing: Jest with 100% test coverage on graph algorithms
- Algorithms:
  - Cycle detection (DFS with color coding)
  - Topological sort (Kahn's algorithm)
  - Strongly Connected Components (Tarjan's algorithm)
  - Priority-based scheduling with multi-requirement optimization


## How to Run

```bash
cd penn-class-planner-web
npm install
npm run dev
```

Open http://localhost:3000 in your browser.


### Core Algorithms & Data Structures


- Cycle Detection - O(V + E) DFS with tri-color marking
  ```
  Algorithm: DFS with Color Coding (WHITE/GRAY/BLACK)
  - WHITE: Unvisited node
  - GRAY: Currently in DFS stack (visiting)
  - BLACK: Fully explored
  - Back edge to GRAY node = cycle detected

  Time Complexity: O(V + E) where V = courses, E = prerequisites
  Space Complexity: O(V) for color map + recursion stack
  ```

- Topological Sort - Kahn's Algorithm (BFS-based)
  ```
  Algorithm: Kahn's Algorithm
  1. Calculate in-degree for each node (number of prerequisites)
  2. Add all nodes with in-degree 0 to queue
  3. Process queue: remove node, decrement dependent nodes' in-degrees
  4. If all nodes processed → valid ordering; else → cycle exists

  Time Complexity: O(V + E)
  Space Complexity: O(V) for queue and in-degree map
  Use Case: Ensures prerequisites are always taken before dependent courses
  ```

- Strongly Connected Components - Tarjan's Algorithm
  ```
  Algorithm: Tarjan's SCC (Single-pass DFS)
  - Maintains discovery time and low-link values
  - Uses stack to track current path
  - When low-link[v] == discovery[v] → v is root of SCC

  Time Complexity: O(V + E) - single DFS pass
  Space Complexity: O(V) for indices, low-links, and stack
  Use Case: Detect cyclic prerequisite groups (e.g., A→B→C→A)
  ```

- Prerequisite Depth Calculation -  Memoization DFS
  ```
  Algorithm: Dynamic Programming with Memoization
  - depth[course] = 1 + max(depth[prereq] for all prereqs)
  - Cycles handled by SCC detection (depth = 0 for cyclic nodes)
  - Cached results prevent recomputation

  Time Complexity: O(V + E) with memoization, O(V * E) without
  Space Complexity: O(V) for memoization cache
  ```
```
Algorithm: Modified Greedy with Multi-Objective Optimization
For each semester:
  1. Score all available courses using:
     - Multi-requirement fulfillment (+10 per unmet req)
     - Multi-counting bonus (+5 per additional requirement)
     - Priority boost (fundamental courses +5000-7000)
     - Temporal constraints (Year 4 senior design +4000)
     - Prerequisite depth penalty (-10 per level)

  2. Sort by composite score (O(n log n))
  3. Greedily select top courses until semester full
  4. Update completion state (O(1) per course with Set)
  5. Recalculate progress for next iteration

Time Complexity: O(semesters * courses * log(courses))
                = O(8 * 500 * log(500)) ≈ O(36,000) operations
Space Complexity: O(courses) for scoring array
```

```
Data Structures:
- completedCourses: Set<string>        // O(1) lookup
- incomingCredits: Set<string>         // O(1) lookup
- courseEquivalents: Map<string, Set<string>>  // O(1) lookup
- prerequisites: Map<string, string[]> // O(1) lookup

Total Space: O(courses) = O(500)
```

### Algorithm Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| Cycle Detection (DFS) | O(V + E) | O(V) | Detect impossible prereqs |
| Topological Sort (Kahn's) | O(V + E) | O(V) | Course ordering |
| SCC (Tarjan's) | O(V + E) | O(V) | Find cyclic groups |
| Prerequisite Depth (DP) | O(V + E) | O(V) | Prioritize foundational courses |
| Greedy Scheduling | O(S × C × log C) | O(C) | Semester course selection |
| Multi-counting DP | O(C × R) | O(R) | Requirement optimization |

V = courses (500), E = prerequisites (1000+), S = semesters (8), C = courses per semester (500), R = requirements (40)


### Test Suites
- Graph Algorithms: 19/19 tests passing
  - Cycle detection (5 tests)
  - Topological sort (4 tests)
  - Strongly Connected Components (3 tests)
  - Prerequisite depth calculation (2 tests)
  - Integration tests (5 tests)

## Features in Development
- Fine-tuning priority system for edge cases
- Improved handling of concentration requirements
- Better COGS course filtering when not selected
- Enhanced UI for schedule visualization
- Export schedule to PDF/calendar
- Fix failing edge cases (the senior design, the variety in course works)

## previous verision of this project was in python, but that logic has been improved and impelemented in an react js a
