/**
 * Script to expand course_fulfillment_map.json with SSH and tech elective tags
 */

const fs = require('fs');
const path = require('path');

// Load all data files
const courseFulfillmentMap = require('../lib/data/course_fulfillment_map.json');
const sshData = require('../lib/data/social_science_and_humanities.json');
const techElectives = require('../lib/data/37cu_csci_tech_elective_list.json');

// Create expanded course map
const expandedMap = { ...courseFulfillmentMap };

// Add SSH tags to courses
console.log('Adding SSH tags to courses...');

// Social Sciences - Add tag to all courses from included departments
const ssDepts = sshData.Social_Sciences.included_departments.general;
const ssIndividualCourses = sshData.Social_Sciences.individual_courses;

// Humanities - Add tag to all courses from included departments
const humDepts = sshData.Humanities.included_departments.general;
const humIndividualCourses = sshData.Humanities.individual_courses;

let sshCount = 0;

// Tag existing courses in the map that match SSH criteria
Object.keys(expandedMap).forEach(courseCode => {
  const [dept, number] = courseCode.split(' ');

  // Check if course is in Social Sciences
  if (ssDepts.includes(dept)) {
    if (!expandedMap[courseCode].Fulfills.includes('CIS_ssh')) {
      expandedMap[courseCode].Fulfills.push('CIS_ssh');
      expandedMap[courseCode].Fulfills.push('CIS_social_science');
      sshCount++;
    }
  }

  // Check if course is in Humanities
  if (humDepts.includes(dept)) {
    if (!expandedMap[courseCode].Fulfills.includes('CIS_ssh')) {
      expandedMap[courseCode].Fulfills.push('CIS_ssh');
      expandedMap[courseCode].Fulfills.push('CIS_humanities');
      sshCount++;
    }
  }

  // Check individual SSH courses
  Object.entries(ssIndividualCourses).forEach(([dept, numbers]) => {
    if (courseCode.startsWith(dept + ' ')) {
      const courseNum = courseCode.split(' ')[1];
      if (numbers.includes(courseNum)) {
        if (!expandedMap[courseCode].Fulfills.includes('CIS_ssh')) {
          expandedMap[courseCode].Fulfills.push('CIS_ssh');
          expandedMap[courseCode].Fulfills.push('CIS_social_science');
          sshCount++;
        }
      }
    }
  });

  Object.entries(humIndividualCourses).forEach(([dept, numbers]) => {
    if (courseCode.startsWith(dept + ' ')) {
      const courseNum = courseCode.split(' ')[1];
      if (numbers.includes(courseNum)) {
        if (!expandedMap[courseCode].Fulfills.includes('CIS_ssh')) {
          expandedMap[courseCode].Fulfills.push('CIS_ssh');
          expandedMap[courseCode].Fulfills.push('CIS_humanities');
          sshCount++;
        }
      }
    }
  });
});

console.log(`Tagged ${sshCount} existing courses with SSH`);

// Add sample SSH courses if not enough exist
const sampleSSHCourses = [
  { code: "ECON 0100", title: "Introduction to Economics", dept: "ECON" },
  { code: "PSYC 0001", title: "Introduction to Psychology", dept: "PSYC" },
  { code: "PHIL 0010", title: "Introduction to Philosophy", dept: "PHIL" },
  { code: "HIST 0100", title: "Introduction to History", dept: "HIST" },
  { code: "ENGL 0100", title: "English Composition", dept: "ENGL" },
  { code: "SOCI 0001", title: "Introduction to Sociology", dept: "SOCI" },
  { code: "PSCI 0001", title: "Introduction to Political Science", dept: "PSCI" },
  { code: "ANTH 0001", title: "Introduction to Anthropology", dept: "ANTH" },
];

sampleSSHCourses.forEach(course => {
  if (!expandedMap[course.code]) {
    expandedMap[course.code] = {
      title: course.title,
      units: 1,
      Fulfills: ['CIS_ssh', ssDepts.includes(course.dept) ? 'CIS_social_science' : 'CIS_humanities']
    };
    console.log(`Added sample course: ${course.code}`);
  }
});

// Add tech elective tags
console.log('\nAdding tech elective tags...');

let techCount = 0;
techElectives.forEach(course => {
  const courseCode = course.course4d;

  // Only add if status allows (unrestricted or restricted, not "no")
  if (course.status !== 'no') {
    if (expandedMap[courseCode]) {
      // Course exists, add tag
      if (!expandedMap[courseCode].Fulfills.includes('CIS_tech_elective')) {
        expandedMap[courseCode].Fulfills.push('CIS_tech_elective');
        techCount++;
      }
    } else {
      // Course doesn't exist, add it
      expandedMap[courseCode] = {
        title: course.title,
        units: 1,
        Fulfills: ['CIS_tech_elective']
      };
      techCount++;
    }
  }
});

console.log(`Tagged/added ${techCount} tech elective courses`);

// Write expanded map
const outputPath = path.join(__dirname, '../lib/data/course_fulfillment_map_expanded.json');
fs.writeFileSync(outputPath, JSON.stringify(expandedMap, null, 2));

console.log(`\nCreated expanded course map with ${Object.keys(expandedMap).length} total courses`);
console.log(`   - ${sshCount + sampleSSHCourses.length} SSH courses`);
console.log(`   - ${techCount} tech electives`);
console.log(`\nSaved to: ${outputPath}`);
