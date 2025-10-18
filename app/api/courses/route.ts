import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses, searchCourses, getCourse } from '@/lib/data/courseData';

// GET /api/courses - Get all courses or search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const code = searchParams.get('code');

  try {
    // Get specific course by code
    if (code) {
      const course = getCourse(code);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(course);
    }

    // Search courses
    if (query) {
      const results = searchCourses(query);
      return NextResponse.json({
        courses: results,
        count: results.length,
      });
    }

    // Get all courses
    const allCourses = getAllCourses();
    return NextResponse.json({
      courses: allCourses,
      count: allCourses.length,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
