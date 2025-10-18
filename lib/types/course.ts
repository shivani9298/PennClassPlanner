// Core types for Penn Class Planner

export interface Course {
  code: string;
  title: string;
  units: number;
  semester?: 'Fall' | 'Spring';
  year?: number;
  fulfills?: string[];
}

export interface CourseFulfillmentMap {
  [courseCode: string]: {
    title: string;
    units: number;
    Fulfills: string[];
  };
}

export interface Requirement {
  name: string;
  required_units: number;
  categories: string[];
  notes?: string;
}

export interface Schedule {
  id?: string;
  userId?: string;
  name: string;
  concentration?: CISConcentration;
  hasStatisticsMinor: boolean;
  hasCogsDoubleMajor: boolean;
  courses: Course[];
  incomingCredits: Course[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type CISConcentration =
  | 'AI'
  | 'Data Science'
  | 'Systems'
  | 'Software Foundations'
  | 'Computer Vision'
  | 'Cognitive Science'
  | 'Computational Biology'
  | 'None';

export type Semester = 'Fall' | 'Spring';

export interface SemesterCourse {
  course: Course;
  semester: Semester;
  year: number; // 1, 2, 3, 4
}

export interface RequirementStatus {
  name: string;
  completed: number;
  required: number;
  isMet: boolean;
  courses: Course[];
}
