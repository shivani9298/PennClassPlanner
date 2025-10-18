'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course } from '@/lib/types/course';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCourses, setTotalCourses] = useState(0);

  // Fetch courses on search
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const url = searchQuery
          ? `/api/courses?q=${encodeURIComponent(searchQuery)}`
          : '/api/courses';

        const response = await fetch(url);
        const data = await response.json();

        setCourses(data.courses.slice(0, 20)); // Show first 20 results
        setTotalCourses(data.count);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Penn Class Planner
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Plan your 4-year CIS degree with ease
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Build Your Perfect Schedule
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Search through 300+ courses and plan your path to graduation
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses (e.g., CIS 1200, Machine Learning, Algorithms...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-lg"
              />
              {loading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            {totalCourses > 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Found {totalCourses} courses {courses.length < totalCourses && `(showing first ${courses.length})`}
              </p>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.code}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {course.code}
                </h3>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                  {course.units} CU
                </span>
              </div>

              <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">
                {course.title}
              </p>

              {course.fulfills && course.fulfills.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fulfills:</p>
                  <div className="flex flex-wrap gap-1">
                    {course.fulfills.slice(0, 3).map((req) => (
                      <span
                        key={req}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {req.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {course.fulfills.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                        +{course.fulfills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && courses.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No courses found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Getting Started */}
        {!searchQuery && (
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Getting Started
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Your Path</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Select your CIS concentration, minor, or double major
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Build Schedule</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Generate your optimized 4-year plan automatically
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  See real-time updates on requirement completion
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link
                href="/planner"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Create Your Schedule Now
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
