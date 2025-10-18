/**
 * Improved Schedule Planner that prioritizes double/triple counting courses
 */

import { Course, CISConcentration, Schedule } from './types/course';
import { courseMap, getCourse } from './data/courseData';

export interface DegreeChoices {
  concentration: CISConcentration;
  hasStatisticsMinor: boolean;
  hasCogsDoubleMajor: boolean;
}

interface RequirementProgress {
  [key: string]: {
    name: string;
    required: number;
    completed: number;
    isMet: boolean;
  };
}

export class SchedulePlannerV2 {
  private degreeChoices: DegreeChoices;
  private completedCourses: Set<string> = new Set();
  private incomingCredits: Set<string> = new Set();
  private prerequisites: Record<string, string[]> = {
    'CIS 1200': ['CIS 1100'],
    'CIS 1210': ['CIS 1200'],
    'CIS 1600': ['MATH 1400'],
    'CIS 2400': ['CIS 1210'],
    'CIS 2620': ['CIS 1600'],
    'CIS 3200': ['CIS 2620'],
    'CIS 3800': ['CIS 2400'],
    'CIS 3410': ['CIS 2400'],
    'CIS 4710': ['CIS 3410'],
    'MATH 1410': ['MATH 1400'],
    'MATH 1610': ['MATH 1400'],
    'MATH 2400': ['MATH 1410'],
    'MATH 2600': ['MATH 1610'],
    'PHYS 0151': ['PHYS 0150'],
    'PHYS 0171': ['PHYS 0170'],
    'STAT 4310': ['MATH 1410', 'STAT 4300'],
    'STAT 4300': ['MATH 1410'],
    'CIS 4000': ['CIS 4100'],
    'CIS 4010': ['CIS 4110'],
    'CIS 4100': ['CIS 4000'],
    'CIS 4110': ['CIS 4010'],

  };

  private courseEquivalents: Record<string, string[]> = {
    // Math equivalents
    'MATH 1410': ['MATH 1610'],
    'MATH 1610': ['MATH 1410'],
    'MATH 2400': ['MATH 2600'],
    'MATH 2600': ['MATH 2400'],

    // Physics Mechanics equivalents (EITHER 0150 OR 0170, not both)
    'PHYS 0150': ['PHYS 0170'],
    'PHYS 0170': ['PHYS 0150'],

    // Physics E&M equivalents (EITHER 0151 OR 0171, not both)
    'PHYS 0151': ['PHYS 0171'],
    'PHYS 0171': ['PHYS 0151'],

    // NOTE: You CAN take 0150 AND 0151 (or 0170 AND 0171)
    // They are separate requirements: Mechanics + E&M

    // Statistics equivalents
    'STAT 4300': ['ESE 3010', 'CIS 2610'],
    'ESE 3010': ['STAT 4300','CIS 2610'],
    'CIS 2610': ['STAT 4300','ESE 3010'],
  };

  constructor(degreeChoices: DegreeChoices) {
    this.degreeChoices = degreeChoices;
  }

  // Calculate requirement progress dynamically (matching Python logic)
  private calculateProgress(scheduledCourses: Course[]): RequirementProgress {
    const progress: RequirementProgress = {};

    // Define all requirements
    const requirements = [
      { key: 'CIS_core', name: 'CIS Core', required: 10 },
      { key: 'CIS_math_calculus', name: 'Calculus', required: 2 },
      { key: 'CIS_math_probability', name: 'Probability', required: 1 },
      { key: 'CIS_math_linear_algebra', name: 'Linear Algebra', required: 1 },
      { key: 'CIS_physics_mechanics', name: 'Physics Mechanics', required: 1 },
      { key: 'CIS_physics_em', name: 'Physics E&M', required: 1 },
      { key: 'CIS_lab', name: 'Lab', required: 0.5 },
      { key: 'CIS_natural_science', name: 'Natural Science', required: 1 },
      { key: 'CIS_ssh', name: 'SSH Electives', required: 4 },
      { key: 'CIS_tech_elective', name: 'Tech Electives', required: 6 },
      { key: 'CIS_senior_design', name: 'Senior Design', required: 2 }, // CIS 4000 + CIS 4010
    ];

    if (this.degreeChoices.concentration !== 'None') {
      const key = `CIS_${this.degreeChoices.concentration.replace(' ', '_')}_concentration`;
      requirements.push({ key, name: `${this.degreeChoices.concentration} Concentration`, required: 4 });
    }

    if (this.degreeChoices.hasStatisticsMinor) {
      requirements.push({ key: 'STAT_minor_core', name: 'STAT Core', required: 3 });
      requirements.push({ key: 'STAT_minor_electives', name: 'STAT Electives', required: 4 });
    }

    if (this.degreeChoices.hasCogsDoubleMajor) {
      requirements.push({ key: 'COGS_core', name: 'COGS Core', required: 1 });
      requirements.push({ key: 'COGS_Psychology', name: 'COGS Psychology Breadth', required: 1 });
      requirements.push({ key: 'COGS_Computation', name: 'COGS Computation Breadth', required: 1 });
      requirements.push({ key: 'COGS_Language', name: 'COGS Language Breadth', required: 1 });
      requirements.push({ key: 'COGS_Philosophy', name: 'COGS Philosophy Breadth', required: 1 });
      requirements.push({ key: 'COGS_Neuroscience', name: 'COGS Neuroscience Breadth', required: 1 });
      requirements.push({ key: 'COGS_Mathematics', name: 'COGS Mathematics Breadth', required: 1 });
      requirements.push({ key: 'COGS_ACGC', name: 'COGS Concentration (ACGC)', required: 9 });
    }

    // Initialize all requirements
    requirements.forEach(req => {
      progress[req.key] = {
        name: req.name,
        required: req.required,
        completed: 0,
        isMet: false,
      };
    });

    // Calculate progress (MATCHES PYTHON _update_progress logic)
    scheduledCourses.forEach(course => {
      const fulfills = course.fulfills || [];

      // CIS core
      if (fulfills.includes('CIS_core')) {
        progress['CIS_core'].completed += course.units;
      }
      // Non-core CIS courses count as tech electives (IMPORTANT!)
      else if (course.code.startsWith('CIS') && !fulfills.includes('CIS_core')) {
        progress['CIS_tech_elective'].completed += course.units;
      }
      // Explicit tech electives
      if (fulfills.includes('CIS_tech_elective')) {
        progress['CIS_tech_elective'].completed += course.units;
      }

      // All other requirements
      if (fulfills.includes('CIS_senior_design')) {
        progress['CIS_senior_design'].completed += course.units;
      }
      if (fulfills.includes('CIS_math_calculus')) {
        progress['CIS_math_calculus'].completed += course.units;
      }
      if (fulfills.includes('CIS_math_probability')) {
        progress['CIS_math_probability'].completed += course.units;
      }
      if (fulfills.includes('CIS_math_linear_algebra')) {
        progress['CIS_math_linear_algebra'].completed += course.units;
      }
      if (fulfills.includes('CIS_physics_mechanics')) {
        progress['CIS_physics_mechanics'].completed += course.units;
      }
      if (fulfills.includes('CIS_physics_em')) {
        progress['CIS_physics_em'].completed += course.units;
      }
      if (fulfills.includes('CIS_lab')) {
        progress['CIS_lab'].completed += 0.5;
      }
      if (fulfills.includes('CIS_natural_science')) {
        progress['CIS_natural_science'].completed += course.units;
      }
      if (fulfills.includes('CIS_ssh') || fulfills.includes('CIS_humanities') || fulfills.includes('CIS_social_science')) {
        progress['CIS_ssh'].completed += course.units;
      }

      // Concentration
      if (this.degreeChoices.concentration !== 'None') {
        const key = `CIS_${this.degreeChoices.concentration.replace(' ', '_')}_concentration`;
        if (fulfills.includes(key)) {
          progress[key].completed += course.units;
        }
      }

      // Statistics minor
      if (this.degreeChoices.hasStatisticsMinor) {
        if (fulfills.includes('STAT_minor_core')) {
          progress['STAT_minor_core'].completed += course.units;
        }
        if (fulfills.includes('STAT_minor_electives')) {
          progress['STAT_minor_electives'].completed += course.units;
        }
      }

      // COGS double major
      if (this.degreeChoices.hasCogsDoubleMajor) {
        if (fulfills.includes('COGS_core')) {
          progress['COGS_core'].completed += course.units;
        }
        if (fulfills.includes('COGS_Psychology')) {
          progress['COGS_Psychology'].completed += course.units;
        }
        if (fulfills.includes('COGS_Computation')) {
          progress['COGS_Computation'].completed += course.units;
        }
        if (fulfills.includes('COGS_Language')) {
          progress['COGS_Language'].completed += course.units;
        }
        if (fulfills.includes('COGS_Philosophy')) {
          progress['COGS_Philosophy'].completed += course.units;
        }
        if (fulfills.includes('COGS_Neuroscience')) {
          progress['COGS_Neuroscience'].completed += course.units;
        }
        if (fulfills.includes('COGS_Mathematics')) {
          progress['COGS_Mathematics'].completed += course.units;
        }
        if (fulfills.includes('COGS_ACGC')) {
          progress['COGS_ACGC'].completed += course.units;
        }
      }
    });

    // Update isMet status
    Object.keys(progress).forEach(key => {
      progress[key].isMet = progress[key].completed >= progress[key].required;
    });

    return progress;
  }

  // Get multi-counting score for a course (higher = better)
  private getMultiCountScore(course: Course, progress: RequirementProgress): number {
    let score = 0;
    const fulfills = course.fulfills || [];

    fulfills.forEach(reqKey => {
      if (progress[reqKey] && !progress[reqKey].isMet) {
        score += 10; // Points for each unmet requirement this fulfills
      }
    });

    // Bonus for multiple requirements
    score += fulfills.length * 5;

    return score;
  }

  // Topological sort helper - get prerequisite depth (number of prereq levels)
  private getPrerequisiteDepth(courseCode: string, visited: Set<string> = new Set()): number {
    // Prevent cycles
    if (visited.has(courseCode)) return 0;
    visited.add(courseCode);

    const prereqs = this.prerequisites[courseCode] || [];
    if (prereqs.length === 0) return 0;

    // Recursively find the maximum depth
    let maxDepth = 0;
    for (const prereq of prereqs) {
      const depth = this.getPrerequisiteDepth(prereq, new Set(visited));
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth + 1;
  }

 // Check if course can be taken (topological sort validation)
private canTakeCourse(courseCode: string): boolean {
  if (this.completedCourses.has(courseCode)) return false;

  // Check equivalents
  const equivalents = this.courseEquivalents[courseCode] || [];
  for (const equiv of equivalents) {
    if (this.completedCourses.has(equiv) || this.incomingCredits.has(equiv)) {
      return false;
    }
  }

  // Check ALL prerequisites are completed (topological sort requirement)
  const prereqs = this.prerequisites[courseCode] || [];
  for (const prereq of prereqs) {
    if (!this.completedCourses.has(prereq) && !this.incomingCredits.has(prereq)) {
      return false;
    }
  }

  if (courseCode === 'CIS 4100') {
    if (!this.completedCourses.has('CIS 4000') && !this.incomingCredits.has('CIS 4000')) {
      return false;
    }
  }

  // IMPORTANT: CIS course level requirements
  // All CIS 1xxx must be taken before any CIS 2xxx+
  const cisMatch = courseCode.match(/^CIS (\d)(\d{3})/);
  if (cisMatch) {
    const level = parseInt(cisMatch[1]);

    // If this is CIS 2xxx or higher, check that we've completed CIS 1xxx fundamentals
    if (level >= 2) {
      const fundamentals = ['CIS 1100', 'CIS 1200', 'CIS 1210'];
      const hasAnyFundamental = fundamentals.some(
        (course) => this.completedCourses.has(course) || this.incomingCredits.has(course)
      );

      if (!hasAnyFundamental) {
        return false;
      }
    }
  }

  return true;
}


  // Get best courses for current semester (topological sort + prioritize CIS core + double-counting)
  private getBestCourses(semester: 'Fall' | 'Spring', year: number, progress: RequirementProgress): string[] {
    const suggestions: string[] = [];

    // Helper to check variety - no more than 2 courses with same prefix in one semester
    const getCoursePrefix = (code: string): string => {
      return code.split(' ')[0]; // e.g., "CIS 1200" -> "CIS"
    };

    const checkVariety = (newCourse: string): boolean => {
      const newPrefix = getCoursePrefix(newCourse);
      const prefixCount = suggestions.filter(c => getCoursePrefix(c) === newPrefix).length;
      return prefixCount < 2; // Allow max 2 courses with same prefix
    };

    // Score ALL available courses (using topological sort for ordering)
    const scoredCourses: Array<{
      code: string;
      score: number;
      isCISCore: boolean;
      prereqDepth: number; // Topological sort depth
    }> = [];

    Object.entries(courseMap).forEach(([code, data]) => {
      if (!this.canTakeCourse(code)) return;

      const course: Course = {
        code,
        title: data.title,
        units: data.units,
        fulfills: data.Fulfills,
      };

      // Calculate base score from double-counting
      const baseScore = this.getMultiCountScore(course, progress);

      if (baseScore === 0) return; // Skip if doesn't fulfill any unmet requirements

      // Get prerequisite depth (topological sort - lower depth = take earlier)
      const prereqDepth = this.getPrerequisiteDepth(code);

      // BOOST CIS core courses significantly
      const isCISCore = data.Fulfills?.includes('CIS_core') || false;

      // EXTRA BOOST for fundamental CIS courses (must take in Year 1-2)
      const fundamentals = ['CIS 1100', 'CIS 1200', 'CIS 1210', 'CIS 1600'];
      const isFundamental = fundamentals.includes(code);

      // BOOST Physics/Math requirements (must complete early)
      const isPhysics = data.Fulfills?.some(f => f.includes('physics_mechanics') || f.includes('physics_em'));
      const isMath = data.Fulfills?.some(f => f.includes('math_calculus') || f.includes('math_probability') || f.includes('math_linear_algebra'));

      // BOOST STAT courses if Statistics Minor is selected (only if requirements not met)
      const hasUnmetSTAT = this.degreeChoices.hasStatisticsMinor &&
                           data.Fulfills?.some(f => f.includes('STAT_minor') && progress[f] && !progress[f].isMet);
      const isSTAT = this.degreeChoices.hasStatisticsMinor &&
                     data.Fulfills?.some(f => f.includes('STAT_minor'));

      // BOOST COGS courses if COGS Double Major is selected (only if requirements not met)
      const hasUnmetCOGS = this.degreeChoices.hasCogsDoubleMajor &&
                           data.Fulfills?.some(f => f.startsWith('COGS_') && progress[f] && !progress[f].isMet);
      const isCOGS = this.degreeChoices.hasCogsDoubleMajor &&
                     data.Fulfills?.some(f => f.startsWith('COGS_'));

      // Check if this is senior design (CIS 4000, CIS 4010)
      const isSeniorDesign = data.Fulfills?.includes('CIS_senior_design');
      const isCIS4000 = code === 'CIS 4000';
      const isCIS4010 = code === 'CIS 4010';

      // Final score: CIS core boost + double-counting score - prereq depth penalty
      // Lower depth courses get higher priority (prerequisites first)
      let finalScore = baseScore;
      if (isFundamental) {
        finalScore += 5000; // Fundamentals get HUGE boost (prioritize in Year 1-2)
      } else if (isSeniorDesign && year === 4) {
        // Senior design courses should ONLY appear in Year 4
        finalScore += 4000; // Big boost in Year 4
        // CIS 4000 in Fall, CIS 4010 in Spring
        if (isCIS4000 && semester === 'Fall') {
          finalScore += 1000; // Extra boost for CIS 4000 in Fall
        } else if (isCIS4010 && semester === 'Spring') {
          finalScore += 1000; // Extra boost for CIS 4010 in Spring
        }
      } else if (isSeniorDesign && year < 4) {
        // Penalize senior design courses in earlier years
        finalScore -= 10000; // HUGE penalty for taking before Year 4
      } else if (isCISCore) {
        finalScore += 1000; // Other CIS core gets +1000 boost
      } else if (isPhysics && year <= 2) {
        finalScore += 3000; // Physics courses MUST be in Year 1-2
      } else if (isMath && year <= 2) {
        finalScore += 4000; // Math courses prioritized in Year 1-2
      } else if (hasUnmetSTAT) {
        finalScore += 2000; // STAT courses with unmet requirements get big boost
      } else if (isSTAT) {
        finalScore += 500; // STAT courses with met requirements get small boost
      } else if (hasUnmetCOGS) {
        finalScore += 1500; // COGS courses with unmet requirements get big boost
      } else if (isCOGS) {
        finalScore += 300; // COGS courses with met requirements get small boost
      }
      finalScore -= prereqDepth * 10; // Subtract depth penalty (take prereqs first)

      // Extra boost for fundamentals in Year 1-2
      if (isFundamental && year <= 2) {
        finalScore += 2000; // Even more boost in Year 1-2
      }

      scoredCourses.push({ code, score: finalScore, isCISCore, prereqDepth });
    });

    // Sort by score (lower prereq depth = higher score = scheduled first)
    scoredCourses.sort((a, b) => {
      // First sort by score
      if (b.score !== a.score) return b.score - a.score;
      // If tied, prefer courses with lower prerequisite depth (topological order)
      return a.prereqDepth - b.prereqDepth;
    });

    // Pick top courses with variety check
    for (const { code } of scoredCourses) {
      if (suggestions.includes(code)) continue;
      if (!checkVariety(code)) continue; // VARIETY CHECK

      // Check if an equivalent course is already in suggestions
      const equivalents = this.courseEquivalents[code] || [];
      const hasEquivalentInSuggestions = equivalents.some(equiv => suggestions.includes(equiv));
      if (hasEquivalentInSuggestions) continue; // Skip if equivalent already selected

      suggestions.push(code);

      // Stop if we have ~5 courses worth of credits
      const totalUnits = suggestions.reduce((sum, c) => {
        const course = getCourse(c);
        return sum + (course?.units || 1);
      }, 0);

      if (totalUnits >= 4.5) break;
    }

    return suggestions;
  }

  // Generate optimized 4-year plan
  generateFourYearPlan(incomingCredits: string[] = []): Schedule {
    this.completedCourses.clear();
    this.incomingCredits = new Set(incomingCredits);

    // Add incoming credits to completed
    incomingCredits.forEach(code => this.completedCourses.add(code));

    const schedule: Schedule = {
      name: 'My 4-Year Plan',
      concentration: this.degreeChoices.concentration,
      hasStatisticsMinor: this.degreeChoices.hasStatisticsMinor,
      hasCogsDoubleMajor: this.degreeChoices.hasCogsDoubleMajor,
      courses: [],
      incomingCredits: incomingCredits.map(code => {
        const course = getCourse(code);
        return course || { code, title: code, units: 1, fulfills: [] };
      }),
    };

    const semesters: Array<['Fall' | 'Spring', number]> = [
      ['Fall', 1], ['Spring', 1],
      ['Fall', 2], ['Spring', 2],
      ['Fall', 3], ['Spring', 3],
      ['Fall', 4], ['Spring', 4],
    ];

    // Generate schedule semester by semester
    for (const [semester, year] of semesters) {
      const progress = this.calculateProgress(schedule.courses);
      const bestCourses = this.getBestCourses(semester, year, progress);

      for (const courseCode of bestCourses) {
        const course = getCourse(courseCode);
        if (course) {
          schedule.courses.push({
            ...course,
            semester,
            year,
          });
          this.completedCourses.add(courseCode);
        }
      }
    }

    return schedule;
  }
}
