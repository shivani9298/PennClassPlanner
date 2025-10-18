/**
 * Unit tests for SchedulePlannerV2
 * Tests requirement tracking, course scheduling, and progress calculation
 */

import { SchedulePlannerV2, DegreeChoices } from '../lib/schedulerV2';
import courseFulfillmentMap from '../lib/data/course_fulfillment_map_expanded.json';

describe('SchedulePlannerV2', () => {
  describe('Basic CIS Requirements', () => {
    it('should include all basic CIS requirements for a standard degree', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count courses by requirement
      const coursesByReq: Record<string, number> = {};

      schedule.courses.forEach(course => {
        const courseData = courseFulfillmentMap[course.code as keyof typeof courseFulfillmentMap];
        if (courseData && courseData.Fulfills) {
          courseData.Fulfills.forEach((req: string) => {
            coursesByReq[req] = (coursesByReq[req] || 0) + course.units;
          });
        }
      });

      // Verify CIS Core (should have 10 CU)
      expect(coursesByReq['CIS_core']).toBeGreaterThanOrEqual(10);

      // Verify Calculus (should have 2 CU)
      expect(coursesByReq['CIS_math_calculus']).toBeGreaterThanOrEqual(2);

      // Verify Linear Algebra (should have 1 CU)
      expect(coursesByReq['CIS_math_linear_algebra']).toBeGreaterThanOrEqual(1);

      // Verify Probability (should have 1 CU)
      expect(coursesByReq['CIS_math_probability']).toBeGreaterThanOrEqual(1);

      // Verify Physics Mechanics (should have 1 CU)
      expect(coursesByReq['CIS_physics_mechanics']).toBeGreaterThanOrEqual(1);

      // Verify Physics E&M (should have 1 CU)
      expect(coursesByReq['CIS_physics_em']).toBeGreaterThanOrEqual(1);

      // Verify SSH (should have 4 CU)
      const sshCount = (coursesByReq['CIS_ssh'] || 0) +
                       (coursesByReq['CIS_humanities'] || 0) +
                       (coursesByReq['CIS_social_science'] || 0);
      expect(sshCount).toBeGreaterThanOrEqual(4);

      // Verify Tech Electives (should have 6 CU)
      expect(coursesByReq['CIS_tech_elective']).toBeGreaterThanOrEqual(6);

      // Verify Senior Design (should have 2 CU - CIS 4000 + CIS 4010)
      expect(coursesByReq['CIS_senior_design']).toBeGreaterThanOrEqual(2);
    });

    it('should prioritize fundamental CIS courses in Year 1-2', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      const fundamentals = ['CIS 1100', 'CIS 1200', 'CIS 1210', 'CIS 1600'];
      const year1and2Courses = schedule.courses.filter(c => c.year <= 2);

      fundamentals.forEach(fundamental => {
        const found = year1and2Courses.find(c => c.code === fundamental);
        expect(found).toBeDefined();
        expect(found?.year).toBeLessThanOrEqual(2);
      });
    });

    it('should schedule physics courses in Year 1-2', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      const physicsCourses = schedule.courses.filter(c => c.code.startsWith('PHYS'));

      // Should have at least 2 physics courses (mechanics + E&M)
      expect(physicsCourses.length).toBeGreaterThanOrEqual(2);

      // All physics courses should be in Year 1-2
      physicsCourses.forEach(course => {
        expect(course.year).toBeLessThanOrEqual(2);
      });
    });

    it('should schedule CIS 4000 and CIS 4010 (Senior Design) in Year 4', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      const cis4000 = schedule.courses.find(c => c.code === 'CIS 4000');
      const cis4010 = schedule.courses.find(c => c.code === 'CIS 4010');

      // Both CIS 4000 and CIS 4010 should be scheduled
      expect(cis4000).toBeDefined();
      expect(cis4010).toBeDefined();

      // Both should be in Year 4
      expect(cis4000?.year).toBe(4);
      expect(cis4010?.year).toBe(4);

      // CIS 4000 should be in Fall, CIS 4010 in Spring
      expect(cis4000?.semester).toBe('Fall');
      expect(cis4010?.semester).toBe('Spring');

      // Verify total senior design credits
      const seniorDesignCredits = (cis4000?.units || 0) + (cis4010?.units || 0);
      expect(seniorDesignCredits).toBe(2);
    });
  });

  describe('Statistics Minor', () => {
    it('should add STAT requirements when Statistics Minor is selected', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: true,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count STAT courses
      const statCourses = schedule.courses.filter(c => {
        const courseData = courseFulfillmentMap[c.code as keyof typeof courseFulfillmentMap];
        return courseData && courseData.Fulfills && (
          courseData.Fulfills.includes('STAT_minor_core') ||
          courseData.Fulfills.includes('STAT_minor_electives')
        );
      });

      // Calculate total STAT credits
      const statCoreCredits = statCourses
        .filter(c => {
          const courseData = courseFulfillmentMap[c.code as keyof typeof courseFulfillmentMap];
          return courseData?.Fulfills?.includes('STAT_minor_core');
        })
        .reduce((sum, c) => sum + c.units, 0);

      const statElectiveCredits = statCourses
        .filter(c => {
          const courseData = courseFulfillmentMap[c.code as keyof typeof courseFulfillmentMap];
          return courseData?.Fulfills?.includes('STAT_minor_electives');
        })
        .reduce((sum, c) => sum + c.units, 0);

      // Should have at least 3 CU of STAT core
      expect(statCoreCredits).toBeGreaterThanOrEqual(3);

      // Should have at least 4 CU of STAT electives
      expect(statElectiveCredits).toBeGreaterThanOrEqual(4);

      // Total should be at least 7 CU
      expect(statCoreCredits + statElectiveCredits).toBeGreaterThanOrEqual(7);
    });

    it('should NOT add STAT requirements when Statistics Minor is not selected', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count STAT courses
      const statCourses = schedule.courses.filter(c => c.code.startsWith('STAT'));

      // May have some STAT courses that also fulfill other requirements,
      // but shouldn't have 7+ CU of STAT courses
      const totalStatCredits = statCourses.reduce((sum, c) => sum + c.units, 0);
      expect(totalStatCredits).toBeLessThan(7);
    });
  });

  describe('COGS Double Major', () => {
    it('should add COGS requirements when COGS Double Major is selected', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: true,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count COGS courses by requirement
      const cogsCoursesByReq: Record<string, number> = {};

      schedule.courses.forEach(course => {
        const courseData = courseFulfillmentMap[course.code as keyof typeof courseFulfillmentMap];
        if (courseData && courseData.Fulfills) {
          courseData.Fulfills.forEach((req: string) => {
            if (req.startsWith('COGS_')) {
              cogsCoursesByReq[req] = (cogsCoursesByReq[req] || 0) + course.units;
            }
          });
        }
      });

      // Should have COGS core (1 CU)
      expect(cogsCoursesByReq['COGS_core']).toBeGreaterThanOrEqual(1);

      // Should have breadth requirements (1 CU each)
      expect(cogsCoursesByReq['COGS_Psychology']).toBeGreaterThanOrEqual(1);
      expect(cogsCoursesByReq['COGS_Computation']).toBeGreaterThanOrEqual(1);
      expect(cogsCoursesByReq['COGS_Language']).toBeGreaterThanOrEqual(1);
      expect(cogsCoursesByReq['COGS_Philosophy']).toBeGreaterThanOrEqual(1);
      expect(cogsCoursesByReq['COGS_Neuroscience']).toBeGreaterThanOrEqual(1);
      expect(cogsCoursesByReq['COGS_Mathematics']).toBeGreaterThanOrEqual(1);

      // Should have COGS concentration (9 CU)
      expect(cogsCoursesByReq['COGS_ACGC']).toBeGreaterThanOrEqual(9);
    });

    it('should NOT add COGS requirements when COGS Double Major is not selected', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count COGS courses
      const cogsCourses = schedule.courses.filter(c => {
        const courseData = courseFulfillmentMap[c.code as keyof typeof courseFulfillmentMap];
        return courseData && courseData.Fulfills &&
               courseData.Fulfills.some((req: string) => req.startsWith('COGS_'));
      });

      // May have some COGS courses that also fulfill SSH,
      // but shouldn't have 15+ CU of COGS courses
      const totalCogsCredits = cogsCourses.reduce((sum, c) => sum + c.units, 0);
      expect(totalCogsCredits).toBeLessThan(15);
    });
  });

  describe('Concentration Selection', () => {
    it('should add AI concentration requirements when selected', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'AI',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Count AI concentration courses
      const aiCourses = schedule.courses.filter(c => {
        const courseData = courseFulfillmentMap[c.code as keyof typeof courseFulfillmentMap];
        return courseData && courseData.Fulfills &&
               courseData.Fulfills.includes('CIS_AI_concentration');
      });

      const totalAICredits = aiCourses.reduce((sum, c) => sum + c.units, 0);

      // Should have at least 4 CU of AI concentration courses
      expect(totalAICredits).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Combined Selections', () => {
    it('should handle all selections together', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'AI',
        hasStatisticsMinor: true,
        hasCogsDoubleMajor: true,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      // Should have courses from all requirements
      const coursesByReq: Record<string, number> = {};

      schedule.courses.forEach(course => {
        const courseData = courseFulfillmentMap[course.code as keyof typeof courseFulfillmentMap];
        if (courseData && courseData.Fulfills) {
          courseData.Fulfills.forEach((req: string) => {
            coursesByReq[req] = (coursesByReq[req] || 0) + course.units;
          });
        }
      });

      // Verify basic CIS requirements
      expect(coursesByReq['CIS_core']).toBeGreaterThanOrEqual(10);

      // Verify STAT requirements
      expect(coursesByReq['STAT_minor_core'] || 0).toBeGreaterThanOrEqual(3);
      expect(coursesByReq['STAT_minor_electives'] || 0).toBeGreaterThanOrEqual(4);

      // Verify COGS requirements
      expect(coursesByReq['COGS_core'] || 0).toBeGreaterThanOrEqual(1);
      expect(coursesByReq['COGS_ACGC'] || 0).toBeGreaterThanOrEqual(9);

      // Verify AI concentration
      expect(coursesByReq['CIS_AI_concentration'] || 0).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Incoming Credits', () => {
    it('should respect incoming credits and not reschedule them', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan(['MATH 1400', 'PHYS 0150']);

      // Check incoming credits
      expect(schedule.incomingCredits).toHaveLength(2);
      expect(schedule.incomingCredits.some(c => c.code === 'MATH 1400')).toBe(true);
      expect(schedule.incomingCredits.some(c => c.code === 'PHYS 0150')).toBe(true);

      // Should NOT have MATH 1400 or PHYS 0150 in the scheduled courses
      expect(schedule.courses.some(c => c.code === 'MATH 1400')).toBe(false);
      expect(schedule.courses.some(c => c.code === 'PHYS 0150')).toBe(false);
    });
  });

  describe('Course Equivalents', () => {
    it('should not schedule both MATH 2400 and MATH 2600', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      const has2400 = schedule.courses.some(c => c.code === 'MATH 2400');
      const has2600 = schedule.courses.some(c => c.code === 'MATH 2600');

      // Should have one or the other, but not both
      expect(has2400 || has2600).toBe(true);
      expect(has2400 && has2600).toBe(false);
    });

    it('should allow PHYS 0150 and PHYS 0151 together (not equivalents)', () => {
      const degreeChoices: DegreeChoices = {
        concentration: 'None',
        hasStatisticsMinor: false,
        hasCogsDoubleMajor: false,
      };

      const planner = new SchedulePlannerV2(degreeChoices);
      const schedule = planner.generateFourYearPlan([]);

      const physicsCourses = schedule.courses.filter(c => c.code.startsWith('PHYS 0'));

      // Should have mechanics (0150 or 0170) AND E&M (0151 or 0171)
      const hasMechanics = physicsCourses.some(c => c.code === 'PHYS 0150' || c.code === 'PHYS 0170');
      const hasEM = physicsCourses.some(c => c.code === 'PHYS 0151' || c.code === 'PHYS 0171');

      expect(hasMechanics).toBe(true);
      expect(hasEM).toBe(true);
    });
  });
});
