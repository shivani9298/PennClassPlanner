'use client';

import { useState } from 'react';
import { CISConcentration, Schedule, Course } from '@/lib/types/course';
import { SchedulePlannerV2, DegreeChoices } from '@/lib/schedulerV2';

export default function PlannerPage() {
  const [degreeChoices, setDegreeChoices] = useState<DegreeChoices>({
    concentration: 'None',
    hasStatisticsMinor: false,
    hasCogsDoubleMajor: false,
  });

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [incomingCredits, setIncomingCredits] = useState<string>('');

  const handleGenerateSchedule = () => {
    const planner = new SchedulePlannerV2(degreeChoices);

    // Parse incoming credits
    const credits = incomingCredits
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const generatedSchedule = planner.generateFourYearPlan(credits);
    setSchedule(generatedSchedule);
  };

  const concentrations: CISConcentration[] = [
    'None',
    'AI',
    'Data Science',
    'Systems',
    'Software Foundations',
    'Computer Vision',
    'Cognitive Science',
    'Computational Biology',
  ];

  // Group courses by semester
  const groupedCourses = schedule?.courses.reduce((acc, course) => {
    const key = `${course.semester} ${course.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Schedule
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Select your degree options and generate an optimized 4-year plan
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Degree Options Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Degree Options
          </h2>

          {/* Concentration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CIS Concentration
            </label>
            <select
              value={degreeChoices.concentration}
              onChange={(e) =>
                setDegreeChoices({
                  ...degreeChoices,
                  concentration: e.target.value as CISConcentration,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {concentrations.map((conc) => (
                <option key={conc} value={conc}>
                  {conc}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Minor */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={degreeChoices.hasStatisticsMinor}
                onChange={(e) =>
                  setDegreeChoices({
                    ...degreeChoices,
                    hasStatisticsMinor: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Add Statistics Minor
              </span>
            </label>
          </div>

          {/* COGS Double Major */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={degreeChoices.hasCogsDoubleMajor}
                onChange={(e) =>
                  setDegreeChoices({
                    ...degreeChoices,
                    hasCogsDoubleMajor: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Add Cognitive Science Double Major
              </span>
            </label>
          </div>

          {/* Incoming Credits */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Incoming Credits (comma-separated, e.g., MATH 1400, PHYS 0150)
            </label>
            <input
              type="text"
              value={incomingCredits}
              onChange={(e) => setIncomingCredits(e.target.value)}
              placeholder="MATH 1400, PHYS 0150"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSchedule}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Generate 4-Year Schedule
          </button>
        </div>

        {/* Generated Schedule */}
        {schedule && groupedCourses && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your 4-Year Plan
            </h2>

            {/* Incoming Credits */}
            {schedule.incomingCredits.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Incoming Credits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {schedule.incomingCredits.map((course) => (
                    <span
                      key={course.code}
                      className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 text-sm rounded-full"
                    >
                      {course.code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4-Year Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((year) => (
                <div key={year} className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Year {year}
                  </h3>

                  {/* Fall Semester */}
                  <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">
                      Fall {year}
                    </h4>
                    <div className="space-y-2">
                      {groupedCourses[`Fall ${year}`]?.map((course) => (
                        <div
                          key={course.code}
                          className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {course.code}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {course.title}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {course.units} CU
                            </span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          No courses scheduled
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Total: {groupedCourses[`Fall ${year}`]?.reduce((sum, c) => sum + c.units, 0) || 0} CU
                    </p>
                  </div>

                  {/* Spring Semester */}
                  <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                      Spring {year}
                    </h4>
                    <div className="space-y-2">
                      {groupedCourses[`Spring ${year}`]?.map((course) => (
                        <div
                          key={course.code}
                          className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {course.code}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {course.title}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {course.units} CU
                            </span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          No courses scheduled
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Total: {groupedCourses[`Spring ${year}`]?.reduce((sum, c) => sum + c.units, 0) || 0} CU
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Credits */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Credits: {schedule.courses.reduce((sum, c) => sum + c.units, 0)} CU
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
