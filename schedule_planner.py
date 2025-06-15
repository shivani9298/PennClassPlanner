"""
Course Schedule Planner for CIS Major + COGS Double Major + Statistics Minor + AI Concentration
"""

import json
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import itertools

@dataclass
class Course:
    code: str
    title: str
    units: int
    semester: Optional[str] = None
    year: Optional[int] = None

@dataclass
class Requirement:
    name: str
    required_units: int
    categories: List[str]
    notes: str = ""

class SchedulePlanner:
    def __init__(self, course_map_file: str):
        """Initialize the schedule planner with course fulfillment data."""
        with open(course_map_file, 'r') as f:
            self.course_map = json.load(f)
        
        # User's degree choices
        self.degree_choices = {
            'cis_concentration': None,  # 'AI', 'Data_Science', 'Systems', 'Software_Foundations', 'Computer_Vision', 'Cognitive_Science', 'Computational_Biology'
            'statistics_minor': False,
            'cogs_double_major': False
                            }
        
        # Define all requirements
        self.requirements = self._define_requirements()
        
        # Track completed courses
        self.completed_courses: Set[str] = set()
        self.incoming_credits: Set[str] = set()  # Track incoming credits
        self.schedule: Dict[str, List[Course]] = {
            'Fall 1': [], 'Spring 1': [],
            'Fall 2': [], 'Spring 2': [],
            'Fall 3': [], 'Spring 3': [],
            'Fall 4': [], 'Spring 4': []
        }
        
        # Track requirement progress
        self.progress = self._initialize_progress()

    def set_cis_concentration(self, concentration: str) -> bool:
        """Set the CIS concentration."""
        valid_concentrations = [
            'AI', 'Data_Science', 'Systems', 'Software_Foundations', 
            'Computer_Vision', 'Cognitive_Science', 'Computational_Biology'
        ]
        if concentration in valid_concentrations:
            self.degree_choices['cis_concentration'] = concentration
            self.requirements = self._define_requirements()  # Recalculate requirements
            self.progress = self._initialize_progress()
            return True
        return False

    def set_statistics_minor(self, include: bool) -> None:
        """Set whether to include Statistics minor."""
        self.degree_choices['statistics_minor'] = include
        self.requirements = self._define_requirements()  # Recalculate requirements
        self.progress = self._initialize_progress()

    def set_cogs_double_major(self, include: bool) -> None:
        """Set whether to include COGS double major."""
        self.degree_choices['cogs_double_major'] = include
        self.requirements = self._define_requirements()  # Recalculate requirements
        self.progress = self._initialize_progress()

    def get_degree_summary(self) -> str:
        """Get a summary of the user's degree choices."""
        summary = "Degree Plan:\n"
        summary += f"   • CIS Major"
        if self.degree_choices['cis_concentration']:
            summary += f" with {self.degree_choices['cis_concentration'].replace('_', ' ')} concentration"
        summary += "\n"
        
        if self.degree_choices['statistics_minor']:
            summary += "   • Statistics Minor\n"
        
        if self.degree_choices['cogs_double_major']:
            summary += "   • Cognitive Science Double Major\n"
        
        return summary

    def _define_requirements(self) -> Dict:
        """Define requirements based on user's degree choices."""
        requirements = {}
        
        # Helper function to get courses for a requirement from the fulfillment map
        def get_courses_for_fulfillment(fulfillment_key: str) -> List[str]:
            courses = []
            for course_code, course_data in self.course_map.items():
                fulfillments = course_data.get('Fulfills', [])
                if fulfillment_key in fulfillments:
                    courses.append(course_code)
            return courses
        
        # CIS Major Requirements (always included)
        requirements["cis_core"] = {
            "name": "CIS Core Courses",
            "required": 10,
            "courses": get_courses_for_fulfillment("CIS_core"),
            "completed": 0
        }
        
        requirements["cis_tech_electives"] = {
            "name": "CIS Technical Electives",
            "required": 6,
            "categories": ["Networking", "Databases", "Machine Learning/AI", "Project"],
            "completed": 0
        }
        
        requirements["cis_senior_design"] = {
            "name": "CIS Senior Design",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_senior_design"),
            "completed": 0
        }
        
        # Math & Science Requirements (always included)
        requirements["calculus"] = {
            "name": "Calculus",
            "required": 2,
            "courses": get_courses_for_fulfillment("CIS_math_calculus"),
            "completed": 0
        }
        
        requirements["probability"] = {
            "name": "Probability",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_math_probability"),
            "completed": 0
        }
        
        requirements["linear_algebra"] = {
            "name": "Linear Algebra",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_math_linear_algebra"),
            "completed": 0
        }
        
        requirements["physics_mechanics"] = {
            "name": "Physics Mechanics",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_physics_mechanics"),
            "completed": 0
        }
        
        requirements["physics_em"] = {
            "name": "Physics EM & Radiation",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_physics_em"),
            "completed": 0
        }
        
        requirements["lab"] = {
            "name": "Lab Course",
            "required": 0.5,
            "courses": get_courses_for_fulfillment("CIS_lab"),
            "completed": 0
        }
        
        requirements["natural_science"] = {
            "name": "Natural Science",
            "required": 1,
            "courses": get_courses_for_fulfillment("CIS_natural_science"),
            "completed": 0
        }
        
        requirements["math_sci_elective"] = {
            "name": "Math/Science Elective",
            "required": 1,
            "completed": 0
        }
        
        # SSH Requirements (always included)
        requirements["ssh_electives"] = {
            "name": "SSH Electives",
            "required": 4,
            "tech_in_society": 2,
            "completed": 0
        }
        
        requirements["free_elective"] = {
            "name": "Free Elective",
            "required": 1,
            "completed": 0
        }
        
        # Add CIS concentration requirements if selected
        if self.degree_choices['cis_concentration']:
            concentration = self.degree_choices['cis_concentration']
            concentration_key = f"cis_{concentration.lower()}_concentration"
            requirements[concentration_key] = {
                "name": f"CIS {concentration.replace('_', ' ')} Concentration",
                "required": 4,  # Most concentrations require 4 courses
                "courses": get_courses_for_fulfillment(f"CIS_{concentration}_concentration"),
                "completed": 0
            }
        
        # Add Statistics minor requirements if selected
        if self.degree_choices['statistics_minor']:
            requirements["stat_core"] = {
                "name": "Statistics Core",
                "required": 3,
                "courses": get_courses_for_fulfillment("STAT_minor_core"),
                "completed": 0
            }
            requirements["stat_electives"] = {
                "name": "Statistics Electives",
                "required": 3,
                "courses": get_courses_for_fulfillment("STAT_minor_electives"),
                "completed": 0
            }
        
        # Add COGS double major requirements if selected
        if self.degree_choices['cogs_double_major']:
            requirements["cogs_core"] = {
                "name": "COGS Core",
                "required": 1,
                "courses": get_courses_for_fulfillment("COGS_core"),
                "completed": 0
            }
            requirements["cogs_breadth"] = {
                "name": "COGS Breadth Requirements",
                "psychology": {"required": 1, "completed": 0},
                "computation": {"required": 1, "completed": 0},
                "language": {"required": 1, "completed": 0},
                "philosophy": {"required": 1, "completed": 0},
                "neuroscience": {"required": 1, "completed": 0},
                "mathematics": {"required": 1, "completed": 0}
            }
            requirements["cogs_concentration"] = {
                "name": "COGS Concentration Electives",
                "required": 9,
                "attribute": "ACGC",
                "completed": 0
            }
        
        return requirements

    def _initialize_progress(self) -> Dict:
        """Initialize progress tracking for all requirements."""
        progress = {}
        for req_id, req_data in self.requirements.items():
            if isinstance(req_data, dict):
                progress[req_id] = req_data.copy()
                progress[req_id]['completed'] = 0
        return progress

    def get_course_fulfillments(self, course_code: str) -> List[str]:
        """Get all requirements that a course fulfills."""
        course_data = self.course_map.get(course_code, {})
        return course_data.get('Fulfills', [])

    def can_take_course(self, course_code: str, semester: str, year: int) -> bool:
        """Check if a course can be taken in the given semester/year."""
        # Basic checks
        if course_code in self.completed_courses:
            return False
            
        # Check prerequisites (simplified)
        prereqs = {
            "CIS 1200": ["CIS 1100"],
            "CIS 1210": ["CIS 1200"],
            "CIS 1600": ["MATH 1400"],
            "CIS 2400": ["CIS 1210"],
            "CIS 2620": ["CIS 1600"],
            "CIS 3200": ["CIS 2620"],
            "CIS 3800": ["CIS 2400"],
            "CIS 3410": ["CIS 2400"],
            "CIS 4710": ["CIS 3410"],
            "MATH 1410": ["MATH 1400"],
            "MATH 2400": ["MATH 1410"],
            "PHYS 0151": ["PHYS 0150"],
            "PHYS 0171": ["PHYS 0170"]
        }
        
        if course_code in prereqs:
            for prereq in prereqs[course_code]:
                if prereq not in self.completed_courses:
                    return False
        
        return True

    def add_course(self, course_code: str, semester: str, year: int) -> bool:
        """Add a course to the schedule and update progress."""
        if not self.can_take_course(course_code, semester, year):
            return False
            
        # Add to schedule
        semester_key = f"{semester} {year}"
        if semester_key in self.schedule:
            course = Course(course_code, self.course_map.get(course_code, {}).get('title', ''), 1, semester, year)
            self.schedule[semester_key].append(course)
            self.completed_courses.add(course_code)
            
            # Update progress
            self._update_progress(course_code)
            return True
        return False

    def _update_progress(self, course_code: str):
        """Update progress for a given course."""
        fulfillments = self.get_course_fulfillments(course_code)
        # CIS requirements
        if 'CIS_core' in fulfillments:
            self.progress['cis_core']['completed'] += 1
        # Count any CIS course that isn't core as a tech elective
        elif course_code.startswith('CIS') and 'CIS_core' not in fulfillments:
            self.progress['cis_tech_electives']['completed'] += 1
        elif 'CIS_tech_elective' in fulfillments:
            self.progress['cis_tech_electives']['completed'] += 1
        if 'CIS_senior_design' in fulfillments:
            self.progress['cis_senior_design']['completed'] += 1
        if 'CIS_math_calculus' in fulfillments:
            self.progress['calculus']['completed'] += 1
        if 'CIS_math_probability' in fulfillments:
            self.progress['probability']['completed'] += 1
        if 'CIS_math_linear_algebra' in fulfillments:
            self.progress['linear_algebra']['completed'] += 1
        if 'CIS_physics_mechanics' in fulfillments:
            self.progress['physics_mechanics']['completed'] += 1
        if 'CIS_physics_em' in fulfillments:
            self.progress['physics_em']['completed'] += 1
        if 'CIS_lab' in fulfillments:
            self.progress['lab']['completed'] += 0.5
        if 'CIS_natural_science' in fulfillments:
            self.progress['natural_science']['completed'] += 1
        if 'CIS_humanities' in fulfillments:
            self.progress['ssh_electives']['completed'] += 1
        # COGS requirements (only if present)
        if 'cogs_breadth' in self.progress:
            if 'COGS_Computation' in fulfillments:
                self.progress['cogs_breadth']['computation']['completed'] += 1
            if 'COGS_Psychology' in fulfillments:
                self.progress['cogs_breadth']['psychology']['completed'] += 1
            if 'COGS_Language' in fulfillments:
                self.progress['cogs_breadth']['language']['completed'] += 1
            if 'COGS_Philosophy' in fulfillments:
                self.progress['cogs_breadth']['philosophy']['completed'] += 1
            if 'COGS_Neuroscience' in fulfillments:
                self.progress['cogs_breadth']['neuroscience']['completed'] += 1
            if 'COGS_Mathematics' in fulfillments:
                self.progress['cogs_breadth']['mathematics']['completed'] += 1
        if 'cogs_concentration' in self.progress and 'COGS_ACGC' in fulfillments:
            self.progress['cogs_concentration']['completed'] += 1
        if 'cogs_core' in self.progress and 'COGS_core' in fulfillments:
            self.progress['cogs_core']['completed'] += 1
        # Statistics requirements if present
        if 'stat_core' in self.progress and 'STAT_minor_core' in fulfillments:
            self.progress['stat_core']['completed'] += 1
        if 'stat_electives' in self.progress and 'STAT_minor_electives' in fulfillments:
            self.progress['stat_electives']['completed'] += 1

    def get_requirement_status(self) -> Dict:
        """Get current status of all requirements."""
        status = {}
        for req_id, req_data in self.progress.items():
            if isinstance(req_data, dict):
                if 'required' in req_data:
                    status[req_id] = {
                        'name': req_data['name'],
                        'completed': req_data['completed'],
                        'required': req_data['required'],
                        'remaining': max(0, req_data['required'] - req_data['completed']),
                        'met': req_data['completed'] >= req_data['required']
                    }
                elif req_id == 'cogs_breadth':
                    # Handle nested cogs_breadth structure
                    status[req_id] = {
                        'name': req_data['name'],
                        'areas': {}
                    }
                    for area, area_data in req_data.items():
                        if isinstance(area_data, dict) and 'required' in area_data:
                            status[req_id]['areas'][area] = {
                                'completed': area_data['completed'],
                                'required': area_data['required'],
                                'remaining': max(0, area_data['required'] - area_data['completed']),
                                'met': area_data['completed'] >= area_data['required']
                            }
        return status

    def suggest_courses(self, semester: str, year: int) -> List[str]:
        """Suggest courses for a given semester based on unmet requirements."""
        suggestions = []
        status = self.get_requirement_status()
        
        # Prioritize core requirements first
        priority_requirements = [
            'cis_core', 'calculus', 'probability', 'linear_algebra',
            'physics_mechanics', 'physics_em', 'lab', 'cogs_core'
        ]
        
        for req_id in priority_requirements:
            if req_id in status and not status[req_id]['met']:
                req_data = self.requirements[req_id]
                if 'courses' in req_data:
                    for course in req_data['courses']:
                        if self.can_take_course(course, semester, year):
                            suggestions.append(course)
        
        return suggestions[:5]  # Limit to 5 suggestions

    def create_four_year_plan(self) -> Dict[str, List[Course]]:
        """Create a comprehensive 4-year plan optimized for the user's degree choices."""
        # Reset schedule
        self.schedule = {key: [] for key in self.schedule.keys()}
        self.completed_courses.clear()
        self.progress = self._initialize_progress()
        
        # Dynamic course selection based on requirements
        def get_courses_for_requirement(req_id: str) -> List[str]:
            """Get all courses that fulfill a specific requirement."""
            courses = []
            for course_code, course_data in self.course_map.items():
                fulfillments = course_data.get('Fulfills', [])
                if req_id in fulfillments:
                    courses.append(course_code)
            return courses
        
        def get_priority_courses(semester: str, year: int) -> List[str]:
            """Dynamically select courses based on unmet requirements and prerequisites."""
            suggestions = []
            status = self.get_requirement_status()
            
            # Priority order for requirements
            priority_order = [
                'cis_core', 'calculus', 'probability', 'linear_algebra',
                'physics_mechanics', 'physics_em', 'natural_science',
                'cogs_core', 'stat_core', 'cis_tech_electives', 'cis_senior_design'
            ]
            
            # Add concentration requirements if selected
            if self.degree_choices['cis_concentration']:
                concentration_key = f"cis_{self.degree_choices['cis_concentration'].lower()}_concentration"
                if concentration_key in priority_order:
                    priority_order.insert(priority_order.index('cis_tech_electives'), concentration_key)
            
            # Find unmet requirements and suggest courses
            for req_id in priority_order:
                if req_id in status and not status[req_id]['met']:
                    req_data = self.requirements.get(req_id, {})
                    
                    # Get courses for this requirement
                    if 'courses' in req_data:
                        available_courses = req_data['courses']
                    else:
                        # Dynamic course selection based on fulfillment map
                        available_courses = get_courses_for_requirement(req_id.upper())
                    
                    # Filter courses that can be taken this semester
                    for course in available_courses:
                        if self.can_take_course(course, semester, year) and course not in suggestions:
                            suggestions.append(course)
                            if len(suggestions) >= 5:  # Allow up to 5 courses per semester (including 0.5 credit labs)
                                break
                    if len(suggestions) >= 5:
                        break
            
            # Add lab requirement if not met (0.5 credit course)
            if 'lab' in status and not status['lab']['met']:
                lab_courses = get_courses_for_requirement('CIS_lab')
                for course in lab_courses:
                    if self.can_take_course(course, semester, year) and course not in suggestions:
                        suggestions.append(course)
                        break
            
            # Add COGS breadth requirements if COGS double major is selected
            if self.degree_choices['cogs_double_major'] and 'cogs_breadth' in status:
                breadth_areas = ['psychology', 'computation', 'language', 'philosophy', 'neuroscience', 'mathematics']
                for area in breadth_areas:
                    if area in status['cogs_breadth']['areas'] and not status['cogs_breadth']['areas'][area]['met']:
                        # Find courses for this breadth area
                        area_courses = get_courses_for_requirement(f'COGS_{area.capitalize()}')
                        for course in area_courses:
                            if self.can_take_course(course, semester, year) and course not in suggestions:
                                suggestions.append(course)
                                break
            
            return suggestions[:5]  # Return up to 5 courses per semester
        
        # Generate dynamic 4-year plan
        semesters = [
            ('Fall', 1), ('Spring', 1),
            ('Fall', 2), ('Spring', 2),
            ('Fall', 3), ('Spring', 3),
            ('Fall', 4), ('Spring', 4)
        ]
        
        for semester, year in semesters:
            semester_key = f"{semester} {year}"
            suggested_courses = get_priority_courses(semester, year)
            
            for course in suggested_courses:
                self.add_course(course, semester, year)
        
        return self.schedule

    def validate_schedule(self) -> Tuple[bool, List[str]]:
        """Validate the current schedule and return issues."""
        issues = []
        status = self.get_requirement_status()
        
        for req_id, req_status in status.items():
            if 'areas' in req_status:
                # Handle nested structure like cogs_breadth
                for area, area_status in req_status['areas'].items():
                    if not area_status['met']:
                        issues.append(f"{req_status['name']} - {area.capitalize()}: {area_status['remaining']} more required")
            else:
                # Handle regular requirements
                if not req_status['met']:
                    issues.append(f"{req_status['name']}: {req_status['remaining']} more required")
        
        return len(issues) == 0, issues

    def print_schedule(self):
        """Print the current schedule."""
        print("\n" + "="*60)
        print("CURRENT SCHEDULE")
        print("="*60)
        
        for semester, courses in self.schedule.items():
            if courses:
                print(f"\n{semester}:")
                for course in courses:
                    print(f"  {course.code}: {course.title}")
            else:
                print(f"\n{semester}: No courses scheduled")

    def print_requirement_status(self):
        """Print the current status of all requirements."""
        print("="*60)
        print("REQUIREMENT STATUS")
        print("="*60)
        
        status = self.get_requirement_status()
        for area_name, area_status in status.items():
            if isinstance(area_status, dict) and 'met' in area_status:
                # Single requirement
                status_icon = "✓" if area_status['met'] else "✗"
                print(f"{status_icon} {area_name}: {area_status['completed']}/{area_status['required']}")
            elif isinstance(area_status, dict) and 'areas' in area_status:
                # Group of requirements (like cogs_breadth)
                print(f"\n{area_name}:")
                for req_name, req_status in area_status['areas'].items():
                    status_icon = "✓" if req_status['met'] else "✗"
                    print(f"  {status_icon} {req_name}: {req_status['completed']}/{req_status['required']}")
            elif isinstance(area_status, dict):
                # Other dictionary structure
                print(f"\n{area_name}:")
                for req_name, req_status in area_status.items():
                    if isinstance(req_status, dict) and 'met' in req_status:
                        status_icon = "✓" if req_status['met'] else "✗"
                        print(f"  {status_icon} {req_name}: {req_status['completed']}/{req_status['required']}")

    def add_incoming_credit(self, course_code: str) -> bool:
        """Add an incoming credit (AP, transfer, etc.) to the completed courses."""
        if course_code in self.course_map:
            self.incoming_credits.add(course_code)
            self.completed_courses.add(course_code)
            # Update progress for incoming credits
            self._update_progress(course_code)
            return True
        return False

    def remove_incoming_credit(self, course_code: str) -> bool:
        """Remove an incoming credit."""
        if course_code in self.incoming_credits:
            self.incoming_credits.remove(course_code)
            self.completed_courses.remove(course_code)
            # Recalculate progress
            self._recalculate_progress()
            return True
        return False

    def _recalculate_progress(self):
        """Recalculate progress after removing incoming credits."""
        # Reset progress
        self.progress = self._initialize_progress()
        
        # Update progress for all completed courses
        for course_code in self.completed_courses:
            self._update_progress(course_code)

    def get_incoming_credits(self) -> List[str]:
        """Get list of incoming credits."""
        return list(self.incoming_credits)

    def print_incoming_credits(self):
        """Print current incoming credits."""
        print("="*60)
        print("INCOMING CREDITS")
        print("="*60)
        
        if not self.incoming_credits:
            print("No incoming credits specified.")
            print("\nTo add incoming credits, use: add_incoming <course_code>")
            print("To remove incoming credits, use: remove_incoming <course_code>")
            return
        
        for course_code, course_info in self.incoming_credits.items():
            title = course_info.get('title', 'Unknown Course')
            units = course_info.get('units', 1)
            print(f"✓ {course_code}: {title} ({units} CU)")

def main():
    """Main function to run the schedule planner."""
    try:
        planner = SchedulePlanner('course_fulfillment_map.json')
        
        print("Penn Class Planner - Flexible CIS Degree Planning")
        print("="*60)
        
        # Degree configuration
        print("\nLet's configure your degree plan:")
        print("Available CIS concentrations:")
        print("  1. AI")
        print("  2. Data Science") 
        print("  3. Systems")
        print("  4. Software Foundations")
        print("  5. Computer Vision")
        print("  6. Cognitive Science")
        print("  7. Computational Biology")
        print("  8. No concentration")
        
        while True:
            try:
                choice = input("\nChoose your CIS concentration (1-8): ").strip()
                if choice == '1':
                    planner.set_cis_concentration('AI')
                    break
                elif choice == '2':
                    planner.set_cis_concentration('Data_Science')
                    break
                elif choice == '3':
                    planner.set_cis_concentration('Systems')
                    break
                elif choice == '4':
                    planner.set_cis_concentration('Software_Foundations')
                    break
                elif choice == '5':
                    planner.set_cis_concentration('Computer_Vision')
                    break
                elif choice == '6':
                    planner.set_cis_concentration('Cognitive_Science')
                    break
                elif choice == '7':
                    planner.set_cis_concentration('Computational_Biology')
                    break
                elif choice == '8':
                    break
                else:
                    print("Please enter a number 1-8")
            except KeyboardInterrupt:
                print("\nGoodbye!")
                return
        
        # Statistics minor
        stats_choice = input("\nWould you like to add a Statistics minor? (y/n): ").strip().lower()
        if stats_choice in ['y', 'yes']:
            planner.set_statistics_minor(True)
        
        # COGS double major
        cogs_choice = input("Would you like to add a Cognitive Science double major? (y/n): ").strip().lower()
        if cogs_choice in ['y', 'yes']:
            planner.set_cogs_double_major(True)
        
        # Show degree summary
        print("\n" + "="*60)
        print(planner.get_degree_summary())
        print("="*60)
        
        # Show incoming credits section
        planner.print_incoming_credits()
        
        # Show initial status
        planner.print_requirement_status()
        
        # Create and show 4-year plan
        print("\nCreating 4-year plan...")
        schedule = planner.create_four_year_plan()
        planner.print_schedule()
        
        # Show updated status
        planner.print_requirement_status()
        
        # Validate schedule
        is_valid, issues = planner.validate_schedule()
        if not is_valid:
            print(f"\nSchedule Issues:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("\nSchedule is valid!")
        
        # Interactive mode
        print("\n" + "="*60)
        print("INTERACTIVE PLANNER")
        print("="*60)
        print("Commands:")
        print("  add <course> <semester> <year> - Add course to schedule")
        print("  add_incoming <course> - Add incoming credit (AP, transfer, etc.)")
        print("  remove_incoming <course> - Remove incoming credit")
        print("  incoming - Show incoming credits")
        print("  status - Show requirement status")
        print("  schedule - Show current schedule")
        print("  degree - Show degree plan summary")
        print("  quit - Exit program")
        
        while True:
            try:
                command = input("\n> ").strip().lower()
                if command == 'quit':
                    break
                elif command == 'status':
                    planner.print_requirement_status()
                elif command == 'schedule':
                    planner.print_schedule()
                elif command == 'incoming':
                    planner.print_incoming_credits()
                elif command == 'degree':
                    print("\n" + "="*60)
                    print(planner.get_degree_summary())
                    print("="*60)
                elif command.startswith('add '):
                    parts = command.split()
                    if len(parts) >= 4:
                        course = parts[1].upper()
                        semester = parts[2].capitalize()
                        year = int(parts[3])
                        if planner.add_course(course, semester, year):
                            print(f"Added {course} to {semester} {year}")
                        else:
                            print(f"Could not add {course} to {semester} {year}")
                    else:
                        print("Usage: add <course> <semester> <year>")
                elif command.startswith('add_incoming '):
                    parts = command.split()
                    if len(parts) >= 2:
                        course_code = parts[1].upper()
                        if planner.add_incoming_credit(course_code):
                            print(f"Added incoming credit for {course_code}")
                        else:
                            print(f"Could not add incoming credit for {course_code}")
                    else:
                        print("Usage: add_incoming <course_code>")
                elif command.startswith('remove_incoming '):
                    parts = command.split()
                    if len(parts) >= 2:
                        course_code = parts[1].upper()
                        if planner.remove_incoming_credit(course_code):
                            print(f"Removed incoming credit for {course_code}")
                        else:
                            print(f"Could not remove incoming credit for {course_code}")
                    else:
                        print("Usage: remove_incoming <course_code>")
                else:
                    print("Unknown command. Try: add, add_incoming, remove_incoming, incoming, status, schedule, degree, quit")
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")
        
        print("\nGoodbye!")
        
    except FileNotFoundError:
        print("Error: course_fulfillment_map.json not found!")
        print("Please make sure the course fulfillment map file exists.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 