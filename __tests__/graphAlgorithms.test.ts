/**
 * Unit tests for graph algorithms (cycle detection, topological sort, SCC)
 */

import {
  hasCycle,
  findAllCycles,
  topologicalSort,
  calculatePrerequisiteDepths,
  findStronglyConnectedComponents,
  PrerequisiteGraph,
} from '../lib/graphAlgorithms';

describe('Graph Algorithms', () => {
  describe('hasCycle', () => {
    it('should detect no cycle in a simple DAG', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1200': ['CIS 1100'],
        'CIS 1210': ['CIS 1100'],
        'CIS 2400': ['CIS 1200'],
        'CIS 1100': [],
      };

      expect(hasCycle(graph)).toBe(false);
    });

    it('should detect a simple cycle', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['A'], // Cycle: A -> B -> C -> A
      };

      expect(hasCycle(graph)).toBe(true);
    });

    it('should detect a self-loop', () => {
      const graph: PrerequisiteGraph = {
        'A': ['A'], // Self-loop
      };

      expect(hasCycle(graph)).toBe(true);
    });

    it('should handle empty graph', () => {
      const graph: PrerequisiteGraph = {};
      expect(hasCycle(graph)).toBe(false);
    });

    it('should handle complex graph with cycle', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1200': ['CIS 1100'],
        'CIS 2400': ['CIS 1200'],
        'CIS 3200': ['CIS 2400'],
        'CIS 1100': ['CIS 3200'], 
      };

      expect(hasCycle(graph)).toBe(true);
    });
  });

  describe('findAllCycles', () => {
    it('should find all cycles in a graph', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['A'], // Cycle: A -> B -> C -> A
        'D': ['E'],
        'E': ['D'], // Another cycle: D -> E -> D
      };

      const cycles = findAllCycles(graph);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should return empty array for DAG', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1200': ['CIS 1100'],
        'CIS 1210': ['CIS 1100'],
        'CIS 2400': ['CIS 1200'],
        'CIS 1100': [],
      };

      const cycles = findAllCycles(graph);
      expect(cycles.length).toBe(0);
    });
  });

  describe('topologicalSort', () => {
    it('should return valid topological order for DAG', () => {
      const graph: PrerequisiteGraph = {
        'CIS 2400': ['CIS 1200'],
        'CIS 1200': ['CIS 1100'],
        'CIS 1210': ['CIS 1100'],
        'CIS 1100': [],
      };

      const sorted = topologicalSort(graph);
      expect(sorted).not.toBeNull();

      if (sorted) {
        // CIS 1100 should come before CIS 1200
        const idx1100 = sorted.indexOf('CIS 1100');
        const idx1200 = sorted.indexOf('CIS 1200');
        expect(idx1100).toBeLessThan(idx1200);

        // CIS 1200 should come before CIS 2400
        const idx2400 = sorted.indexOf('CIS 2400');
        expect(idx1200).toBeLessThan(idx2400);
      }
    });

    it('should return null for graph with cycle', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['A'], // Cycle
      };

      const sorted = topologicalSort(graph);
      expect(sorted).toBeNull();
    });

    it('should handle empty graph', () => {
      const graph: PrerequisiteGraph = {};
      const sorted = topologicalSort(graph);
      expect(sorted).toEqual([]);
    });

    it('should handle disconnected components', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': [],
        'C': ['D'],
        'D': [],
      };

      const sorted = topologicalSort(graph);
      expect(sorted).not.toBeNull();
      expect(sorted?.length).toBe(4);
    });
  });

  describe('calculatePrerequisiteDepths', () => {
    it('should calculate correct depths', () => {
      const graph: PrerequisiteGraph = {
        'CIS 3200': ['CIS 2400'],
        'CIS 2400': ['CIS 1200'],
        'CIS 1200': ['CIS 1100'],
        'CIS 1100': [],
      };

      const depths = calculatePrerequisiteDepths(graph);

      expect(depths.get('CIS 1100')).toBe(0); // No prerequisites
      expect(depths.get('CIS 1200')).toBe(1); // 1 level deep
      expect(depths.get('CIS 2400')).toBe(2); // 2 levels deep
      expect(depths.get('CIS 3200')).toBe(3); // 3 levels deep
    });


    it('should handle cycles gracefully', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['A'], // Cycle
      };

      const depths = calculatePrerequisiteDepths(graph);

      // Should not throw, should return 0 for cycles
      expect(depths.get('A')).toBe(0);
      expect(depths.get('B')).toBe(0);
      expect(depths.get('C')).toBe(0);
    });
  });

  describe('findStronglyConnectedComponents', () => {
    it('should find SCCs in a graph', () => {
      const graph: PrerequisiteGraph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['A'], // SCC: {A, B, C}
        'D': ['E'],
        'E': [], // SCC: {D}, {E}
      };

      const sccs = findStronglyConnectedComponents(graph);

      // Should have 3 SCCs: {A,B,C}, {D}, {E}
      expect(sccs.length).toBe(3);

      // Find the SCC containing A
      const sccWithA = sccs.find(scc => scc.includes('A'));
      expect(sccWithA).toBeDefined();
      expect(sccWithA?.length).toBe(3); // Should contain A, B, C
    });

    it('should identify each node as its own SCC in a DAG', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1200': ['CIS 1100'],
        'CIS 1210': ['CIS 1100'],
        'CIS 1100': [],
      };

      const sccs = findStronglyConnectedComponents(graph);

      // In a DAG, each node is its own SCC
      expect(sccs.length).toBe(3);
      sccs.forEach(scc => {
        expect(scc.length).toBe(1);
      });
    });

    it('should handle complex graph with multiple SCCs', () => {
      const graph: PrerequisiteGraph = {
        '1': ['2'],
        '2': ['3', '4'],
        '3': ['1'], // SCC: {1, 2, 3}
        '4': ['5'],
        '5': ['6'],
        '6': ['4'], // SCC: {4, 5, 6}
        '7': ['8'],
        '8': [], // SCC: {7}, {8}
      };

      const sccs = findStronglyConnectedComponents(graph);

      // Should have 4 SCCs
      expect(sccs.length).toBe(4);

      // Find SCCs with more than 1 node
      const nonTrivialSccs = sccs.filter(scc => scc.length > 1);
      expect(nonTrivialSccs.length).toBe(2);
    });
  });

  describe('Integration: Detecting Impossible Prerequisites', () => {
    it('should detect impossible prerequisite loops', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1200': ['CIS 1100'], 
        'CIS 2400': ['CIS 1200'], 
        'CIS 1100': ['CIS 2400'], 
      };

      // All three methods should detect the problem
      expect(hasCycle(graph)).toBe(true);
      expect(topologicalSort(graph)).toBeNull();

      const sccs = findStronglyConnectedComponents(graph);
      const impossibleSCC = sccs.find(scc => scc.length > 1);
      expect(impossibleSCC).toBeDefined();
      expect(impossibleSCC?.length).toBe(3); // All 3 courses are in the cycle
    });

    it('should allow valid prerequisite chains', () => {
      const graph: PrerequisiteGraph = {
        'CIS 1100': [],
        'CIS 1200': ['CIS 1100'],
        'CIS 2400': ['CIS 1200'],
        'CIS 3200': ['CIS 2620'],
      };

      expect(hasCycle(graph)).toBe(false);
      expect(topologicalSort(graph)).not.toBeNull();

      const depths = calculatePrerequisiteDepths(graph);
      expect(depths.get('CIS 4000')).toBe(4);
    });
  });
});
