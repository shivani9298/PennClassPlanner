import { Course, CISConcentration, Schedule, RequirementStatus } from './types/course';
import { courseMap, getCourse } from './data/courseData';

export interface DegreeChoices {
  concentration: CISConcentration;
  hasStatisticsMinor: boolean;
  hasCogsDoubleMajor: boolean;
}

export class SchedulePlanner {
  private degreeChoices: DegreeChoices;
  private completedCourses: Set<string> = new Set();
  private incomingCredits: Set<string> = new Set();

  // Prerequisite map
  private prerequisites: Record<string, string[]> = {
    'CIS 1200': ['CIS 1100'],
    'CIS 1210': ['CIS 1200'],
    'CIS 1600': ['MATH 1400'],
    'CIS 2400': ['CIS 1210'],
    'CIS 2620': ['CIS 1600'],
    'CIS 3200': ['CIS 2620'],  
    'CIS 3800': ['CIS 2400'],
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
  };

  // Course equivalents/alternatives
  private courseEquivalents: Record<string, string[]> = {
    'MATH 1410': ['MATH 1610', 'MATH 1510'], 
    'MATH 1510': ['MATH 1410', 'MATH 1610'],  
    'MATH 1610': ['MATH 1410', 'MATH 1510'],
    'MATH 2400': ['MATH 2600'],  
    'MATH 2600': ['MATH 2400'],
    'PHYS 0150': ['PHYS 0170'],  
    'PHYS 0170': ['PHYS 0150'],
    'PHYS 0151': ['PHYS 0171'],  
    'PHYS 0171': ['PHYS 0151'],
    'STAT 4300': ['ESE 3010', 'CIS 2610'],
    'ESE 3010': ['STAT 4300','CIS 2610'],
    'CIS 2610': ['STAT 4300','ESE 3010'],
    'CIS 4000' : ['CIS 4100'],
    'CIS 4100' : ['CIS 4000'],
    'CIS 4010' : ['CIS 4110'],
    'CIS 4110' : ['CIS 4010'],

  };

  constructor(degreeChoices: DegreeChoices) {
    this.degreeChoices = degreeChoices;
  }

  // Check if a course can be taken based on prerequisites
  canTakeCourse(courseCode: string): boolean {
    if (this.completedCourses.has(courseCode)) {
      return false; // Already taken
    }

    // Check if an equivalent course has already been taken
    const equivalents = this.courseEquivalents[courseCode] || [];
    for (const equiv of equivalents) {
      if (this.completedCourses.has(equiv) || this.incomingCredits.has(equiv)) {
        return false; // Equivalent already taken
      }
    }

    const prereqs = this.prerequisites[courseCode] || [];
    for (const prereq of prereqs) {
      if (!this.completedCourses.has(prereq) && !this.incomingCredits.has(prereq)) {
        return false;
      }
    }

    return true;
  }

  // Get courses that fulfill a specific requirement
  getCoursesForRequirement(requirementKey: string): Course[] {
    const courses: Course[] = [];

    Object.entries(courseMap).forEach(([code, data]) => {
      if (data.Fulfills.includes(requirementKey)) {
        courses.push({
          code,
          title: data.title,
          units: data.units,
          fulfills: data.Fulfills,
        });
      }
    });

    return courses;
  }

  // Get priority courses for a specific semester
  getPriorityCourses(semester: 'Fall' | 'Spring', year: number): string[] {
    const suggestions: string[] = [];

    // Priority order for requirements
    const priorityRequirements = [
      'CIS_core',
      'CIS_math_calculus',
      'CIS_math_probability',
      'CIS_math_linear_algebra',
      'CIS_physics_mechanics',
      'CIS_physics_em',
      'CIS_lab',
      'CIS_natural_science',
    ];

    // Add SSH requirements (later in schedule - year 2+)
    if (year >= 2) {
      priorityRequirements.push('CIS_ssh', 'CIS_free_elective');
    }

    // Add tech electives (year 3+)
    if (year >= 3) {
      priorityRequirements.push('CIS_tech_elective', 'CIS_senior_design');
    }

    // Add concentration requirements if selected
    if (this.degreeChoices.concentration !== 'None') {
      const concentrationKey = `CIS_${this.degreeChoices.concentration.replace(' ', '_')}_concentration`;
      priorityRequirements.push(concentrationKey);
    }

    // Add COGS requirements if selected
    if (this.degreeChoices.hasCogsDoubleMajor) {
      priorityRequirements.push('COGS_core', 'COGS_Computation', 'COGS_Psychology');
    }

    // Add Statistics requirements if selected
    if (this.degreeChoices.hasStatisticsMinor) {
      priorityRequirements.push('STAT_minor_core', 'STAT_minor_elective');
    }

    // Find courses for each requirement
    for (const reqKey of priorityRequirements) {
      const courses = this.getCoursesForRequirement(reqKey);

      for (const course of courses) {
        if (this.canTakeCourse(course.code) && !suggestions.includes(course.code)) {
          suggestions.push(course.code);

          if (suggestions.length >= 5) {
            return suggestions;
          }
        }
      }
    }

    return suggestions;
  }

  // Generate a 4-year schedule
  generateFourYearPlan(incomingCredits: string[] = []): Schedule {
    // Reset state
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
      const suggestedCourses = this.getPriorityCourses(semester, year);

      for (const courseCode of suggestedCourses) {
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

  // Calculate requirement progress
  calculateProgress(schedule: Schedule): RequirementStatus[] {
    const status: RequirementStatus[] = [];

    // Define requirements based on degree choices (matching Python version)
    const requirements: Array<{ name: string; key: string; required: number }> = [
      { name: 'CIS Core', key: 'CIS_core', required: 10 },  // Fixed: 10 CU for core
      { name: 'Math: Calculus', key: 'CIS_math_calculus', required: 2 },
      { name: 'Math: Probability', key: 'CIS_math_probability', required: 1 },
      { name: 'Math: Linear Algebra', key: 'CIS_math_linear_algebra', required: 1 },
      { name: 'Physics: Mechanics', key: 'CIS_physics_mechanics', required: 1 },
      { name: 'Physics: E&M', key: 'CIS_physics_em', required: 1 },
      { name: 'Lab Requirement', key: 'CIS_lab', required: 0.5 },
      { name: 'Natural Science', key: 'CIS_natural_science', required: 1 },
      { name: 'Tech Electives', key: 'CIS_tech_elective', required: 6 },
      { name: 'Senior Design', key: 'CIS_senior_design', required: 1 },
      { name: 'SSH Electives', key: 'CIS_ssh', required: 4 },
      { name: 'Free Elective', key: 'CIS_free_elective', required: 1 },
    ];

    if (this.degreeChoices.concentration !== 'None') {
      const concentrationKey = `CIS_${this.degreeChoices.concentration.replace(' ', '_')}_concentration`;
      requirements.push({ name: `${this.degreeChoices.concentration} Concentration`, key: concentrationKey, required: 3 });
    }

    if (this.degreeChoices.hasStatisticsMinor) {
      requirements.push({ name: 'Statistics Minor Core', key: 'STAT_minor_core', required: 3 });
      requirements.push({ name: 'Statistics Electives', key: 'STAT_minor_elective', required: 4 });
    }

    if (this.degreeChoices.hasCogsDoubleMajor) {
      requirements.push({ name: 'COGS Core', key: 'COGS_core', required: 4 });
      requirements.push({ name: 'COGS Computation', key: 'COGS_Computation', required: 2 });
    }

    // Calculate progress for each requirement
    for (const req of requirements) {
      const fulfillingCourses: Course[] = [];
      let totalUnits = 0;

      // Check all courses in schedule
      [...schedule.courses, ...schedule.incomingCredits].forEach(course => {
        if (course.fulfills?.includes(req.key)) {
          fulfillingCourses.push(course);
          totalUnits += course.units;
        }
      });

      status.push({
        name: req.name,
        completed: totalUnits,
        required: req.required,
        isMet: totalUnits >= req.required,
        courses: fulfillingCourses,
      });
    }

    return status;
  }
}
