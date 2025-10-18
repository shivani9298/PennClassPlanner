# Penn Class Planner - Web App

A modern, full-stack web application for University of Pennsylvania CIS students to plan their 4-year degree schedule with **production-grade graph algorithms** and **intelligent course scheduling**.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Next.js 15
- **Styling**: TailwindCSS
- **Testing**: Jest (19/19 graph algorithm tests passing)
- **Algorithms**: Tarjan's SCC, Kahn's Topological Sort, DFS Cycle Detection
- **Data**: JSON course database (500+ courses)

## Core Algorithms

This app implements **FAANG-level algorithms** for course scheduling:

### 1. **Graph Theory**
- **Tarjan's Algorithm** (O(V + E)) - Detects strongly connected components in prerequisite graphs
- **Kahn's Algorithm** (O(V + E)) - Topological sort for course ordering
- **DFS with Tri-color Marking** (O(V + E)) - Cycle detection in prerequisite chains

### 2. **Optimization**
- **Greedy Scheduling** (O(S × C × log C)) - Priority-based course selection
- **Dynamic Programming** (O(C × R)) - Multi-requirement optimization with memoization
- **Multi-objective Optimization** - Balances 10+ competing priorities (fundamentals, prerequisites, concentrations, minors)

### 3. **Data Structures**
- `Set<string>` for O(1) prerequisite checking
- `Map<string, string[]>` for O(1) course lookups
- Priority queue simulation with dynamic scoring

See the main [README.md](../README.md) for detailed algorithm explanations.

## Features

- **Smart Course Selection** - Choose concentration, Statistics Minor, or COGS Double Major
- **Automatic 4-Year Scheduling** - Generates optimized schedules respecting all constraints
- **Prerequisite Validation** - Ensures courses taken in correct order
- **Multi-Requirement Counting** - Maximizes efficiency by double/triple counting
- **Real-time Progress Tracking** - Shows completion status for 40+ requirements
- **Senior Design Enforcement** - Guarantees CIS 4000 (Fall) → CIS 4010 (Spring) in Year 4


### Prerequisites

- Node.js 18+ and npm installed

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
penn-class-planner-web/
├── app/                          # Next.js 15 App Router
│   ├── api/
│   │   └── courses/route.ts     # Course API endpoint
│   └── page.tsx                  # Home page
├── lib/
│   ├── schedulerV2.ts           # Main scheduling algorithm (500+ LOC)
│   ├── graphAlgorithms.ts       # Graph theory algorithms (300+ LOC)
│   ├── data/
│   │   ├── course_fulfillment_map.json
│   │   └── course_fulfillment_map_expanded.json
│   └── types/
│       └── course.ts             # TypeScript interfaces
├── __tests__/
│   ├── schedulerV2.test.ts      # 13 scheduler tests (9 passing)
│   └── graphAlgorithms.test.ts  # 19 graph tests (ALL PASSING ✅)
└── components/                   # React components
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

### Test Coverage
- **Graph Algorithms**: 19/19 tests passing (100%) ✅
  - Cycle detection (5 tests)
  - Topological sort (4 tests)
  - SCC detection (3 tests)
  - Prerequisite depth (2 tests)
  - Integration tests (5 tests)

- **Scheduler**: 9/13 tests passing (69%)
  - Core CIS requirements ✅
  - Senior design (CIS 4000/4010) ✅
  - Physics/Math scheduling ✅
  - Course equivalents ✅
  - Incoming credits ✅

### Example Test
```typescript
it('should detect cycles in prerequisite graph', () => {
  const graph = {
    'A': ['B'],
    'B': ['C'],
    'C': ['A']  // Cycle!
  };
  expect(hasCycle(graph)).toBe(true);
});
```

## Algorithm Files

### `lib/graphAlgorithms.ts`
**Production-grade graph algorithms:**
- `hasCycle()` - DFS with WHITE/GRAY/BLACK coloring
- `topologicalSort()` - Kahn's algorithm (BFS-based)
- `findStronglyConnectedComponents()` - Tarjan's algorithm
- `calculatePrerequisiteDepths()` - Memoized DP

### `lib/schedulerV2.ts`
**Intelligent course scheduler:**
- Priority-based greedy algorithm
- Multi-requirement optimization
- Prerequisite validation
- Temporal constraint enforcement

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Why This Is Impressive

This project is **equivalent to solving multiple LeetCode Hard problems**:
1. **Course Schedule II** - Topological Sort
2. **Critical Connections** - Tarjan's Algorithm
3. **Detect Cycles** - DFS with coloring
4. Plus **custom multi-objective optimization**

**Real-world applications:**
- Same algorithms used by npm/pip for dependency resolution
- Similar to Google's build system (Bazel) task scheduling
- Comparable to AWS auto-scaling constraint satisfaction

See the main [README.md](../README.md) for detailed FAANG interview relevance.

## Next Steps

- [ ] Fine-tune priority system for edge cases
- [ ] Enhanced UI with drag-and-drop calendar
- [ ] User authentication (Google OAuth)
- [ ] Save/load schedules to database
- [ ] Export schedule to PDF/calendar
- [ ] Course recommendation engine
- [ ] Mobile responsive enhancements
