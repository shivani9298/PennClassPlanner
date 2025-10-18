import courseFulfillmentMapExpanded from './course_fulfillment_map_expanded.json';
import techElectives from './37cu_csci_tech_elective_list.json';
import statisticsMinor from './statistics_minor.json';
import sshCourses from './social_science_and_humanities.json';
import tbsCourses from './technology_in_business_and_society.json';
import { CourseFulfillmentMap, Course } from '../types/course';

// Type the imported data - using EXPANDED map with SSH and tech elective tags
export const courseMap = courseFulfillmentMapExpanded as CourseFulfillmentMap;

// Convert course map to array of courses
export function getAllCourses(): Course[] {
  return Object.entries(courseMap).map(([code, data]) => ({
    code,
    title: data.title,
    units: data.units,
    fulfills: data.Fulfills,
  }));
}

// Get course by code
export function getCourse(code: string): Course | undefined {
  const data = courseMap[code];
  if (!data) return undefined;

  return {
    code,
    title: data.title,
    units: data.units,
    fulfills: data.Fulfills,
  };
}

// Search courses by title or code
export function searchCourses(query: string): Course[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.entries(courseMap)
    .filter(([code, data]) =>
      code.toLowerCase().includes(lowercaseQuery) ||
      data.title.toLowerCase().includes(lowercaseQuery)
    )
    .map(([code, data]) => ({
      code,
      title: data.title,
      units: data.units,
      fulfills: data.Fulfills,
    }));
}

// Get courses by requirement category
export function getCoursesByRequirement(requirement: string): Course[] {
  return Object.entries(courseMap)
    .filter(([, data]) => data.Fulfills.includes(requirement))
    .map(([code, data]) => ({
      code,
      title: data.title,
      units: data.units,
      fulfills: data.Fulfills,
    }));
}

// Export raw data for advanced use cases
export { techElectives, statisticsMinor, sshCourses, tbsCourses };
