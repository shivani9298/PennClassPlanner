/**
 * Graph algorithms for prerequisite handling
 * Implements cycle detection and topological sorting
 */

export type PrerequisiteGraph = Record<string, string[]>;

/**
 * Detect cycles in prerequisite graph using DFS with color coding
 * Returns true if a cycle is detected
 */
export function hasCycle(graph: PrerequisiteGraph): boolean {
  const WHITE = 0; // Not visited
  const GRAY = 1;  // Currently being explored (in DFS stack)
  const BLACK = 2; // Fully explored

  const colors = new Map<string, number>();

  // Initialize all nodes as WHITE
  for (const node of Object.keys(graph)) {
    colors.set(node, WHITE);
  }

  function dfs(node: string): boolean {
    colors.set(node, GRAY);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      const color = colors.get(neighbor) || WHITE;

      if (color === GRAY) {
        // Back edge detected
        return true;
      }

      if (color === WHITE) {
        if (dfs(neighbor)) {
          return true;
        }
      }
    }

    colors.set(node, BLACK);
    return false;
  }

  // Try DFS from each unvisited node
  for (const node of Object.keys(graph)) {
    if (colors.get(node) === WHITE) {
      if (dfs(node)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find all cycles in the graph
 * Returns array of cycles (each cycle is an array of course codes)
 */
export function findAllCycles(graph: PrerequisiteGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // Cycle detected, extract the cycle from path
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, neighbor]); // Include the repeated node to show the cycle
      }
    }

    path.pop();
    recursionStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

/**
 * Topological sort using Kahn's algorithm (BFS-based)
 * Returns null if graph has cycles, otherwise returns topologically sorted array
 *
 * Our graph format is course -> [prerequisites]
 * So in-degree = number of prerequisites (courses that must come before)
 */
export function topologicalSort(graph: PrerequisiteGraph): string[] | null {
  const allNodes = new Set<string>();
  const reversedGraph: Record<string, string[]> = {};

  for (const course of Object.keys(graph)) {
    allNodes.add(course);
    if (!reversedGraph[course]) {
      reversedGraph[course] = [];
    }

    for (const prereq of graph[course] || []) {
      allNodes.add(prereq);
      if (!reversedGraph[prereq]) {
        reversedGraph[prereq] = [];
      }
      reversedGraph[prereq].push(course);
    }
  }

  // Calculate in-degrees (number of prerequisites for each course)
  const inDegree = new Map<string, number>();
  for (const node of allNodes) {
    inDegree.set(node, (graph[node] || []).length);
  }

  // Find all nodes with in-degree 0 (no prerequisites)
  const queue: string[] = [];
  for (const node of allNodes) {
    if (inDegree.get(node) === 0) {
      queue.push(node);
    }
  }

  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    // For each course that depends on this node, reduce its in-degree
    for (const dependent of reversedGraph[node] || []) {
      const newInDegree = (inDegree.get(dependent) || 0) - 1;
      inDegree.set(dependent, newInDegree);

      if (newInDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // If result doesn't include all nodes, there's a cycle
  if (result.length !== allNodes.size) {
    return null; // Cycle detected
  }

  return result;
}

/**
 * Calculate prerequisite depth for each course (longest path from any root)
 * Uses memoization for efficiency
 */
export function calculatePrerequisiteDepths(graph: PrerequisiteGraph): Map<string, number> {
  // First, detect which nodes are in cycles using SCC
  const sccs = findStronglyConnectedComponents(graph);
  const nodesInCycles = new Set<string>();

  // Any SCC with more than 1 node contains a cycle
  for (const scc of sccs) {
    if (scc.length > 1) {
      for (const node of scc) {
        nodesInCycles.add(node);
      }
    }
  }

  // Now calculate depths, setting 0 for nodes in cycles
  const depths = new Map<string, number>();

  function dfs(node: string): number {
    if (depths.has(node)) {
      return depths.get(node)!;
    }

    // If node is in a cycle, return 0
    if (nodesInCycles.has(node)) {
      depths.set(node, 0);
      return 0;
    }

    const prereqs = graph[node] || [];
    if (prereqs.length === 0) {
      depths.set(node, 0);
      return 0;
    }

    let maxDepth = 0;
    for (const prereq of prereqs) {
      maxDepth = Math.max(maxDepth, dfs(prereq));
    }

    const depth = maxDepth + 1;
    depths.set(node, depth);
    return depth;
  }

  for (const node of Object.keys(graph)) {
    if (!depths.has(node)) {
      dfs(node);
    }
  }

  return depths;
}

/**
 * Find strongly connected components using Tarjan's algorithm
 * Returns array of SCCs (each SCC is an array of course codes)
 */
export function findStronglyConnectedComponents(graph: PrerequisiteGraph): string[][] {
  const sccs: string[][] = [];
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let index = 0;

  function strongConnect(node: string): void {
    indices.set(node, index);
    lowLinks.set(node, index);
    index++;
    stack.push(node);
    onStack.add(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!indices.has(neighbor)) {
        strongConnect(neighbor);
        lowLinks.set(node, Math.min(lowLinks.get(node)!, lowLinks.get(neighbor)!));
      } else if (onStack.has(neighbor)) {
        lowLinks.set(node, Math.min(lowLinks.get(node)!, indices.get(neighbor)!));
      }
    }

    // If node is a root node, pop the stack to get the SCC
    if (lowLinks.get(node) === indices.get(node)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== node);

      sccs.push(scc);
    }
  }

  for (const node of Object.keys(graph)) {
    if (!indices.has(node)) {
      strongConnect(node);
    }
  }

  return sccs;
}
