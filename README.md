Penn Class Planner

A comprehensive course scheduling tool designed for University of Pennsylvania students pursuing a Computer and Information Science (CIS) major with flexible concentration options, minors, and double major choices. Built this to help me plan my four year course load while covering my different interests. 

All Information from the Unviersity of Pennsylvania's wesbite 
37cu tech elective from: cis-advising-handbook.github.io

This planner creates optimized 4-year schedules that maximize double/triple counting across all degree requirements, helping you graduate efficiently while meeting all academic requirements. It acts as your personal academic advisor, ensuring you take the most efficient path to graduation.


Key Features

- Choose your CIS concentration, add minors, and double majors
- Indicators showing requirement completion status
- Add AP, transfer, or other incoming credits
- Modify your schedule in real-time through interactive features 
- Ensures your schedule meets all degree requirements
- Automatically creates a comprehensive course plan
- Maximizes efficiency by counting courses toward multiple requirements

Degree Options
- CIS BSE Major (Main)
- Add a CIS Concentration 
- Statistics Minor
- Cognitive Science Double Major 


How to Run

pip install -r requirements.txt
python3 schedule_planner.py

How to Use Interactive Guide
The planner will guide you through an interactive setup:

Available CIS concentrations:
  1. AI
  2. Data Science
  3. Systems
  4. Software Foundations
  5. Computer Vision
  6. Cognitive Science
  7. Computational Biology
  8. No concentration

Choose your CIS concentration (1-8): 1

Would you like to add a Statistics minor? (y/n): 
Would you like to add a Cognitive Science double major? (y/n): 


 Interactive Commands

Command, what it does, and an example usage 

`add <course> <semester> <year>` 
Add course to schedule 
`add CIS 1100 Fall 1` 

`add_incoming <course>` 
Add AP/transfer credit 
`add_incoming MATH 1400` 

`remove_incoming <course>` 
Remove incoming credit 
`remove_incoming MATH 1400` 

`incoming` 
Show incoming credits 
`incoming` 

 `status` 
 Show requirement progress 
 `status` 

`schedule` 
Show current schedule 
 `schedule`

`degree` 
Show degree plan summary
 `degree` 

`quit` 
Exit program 
`quit` 



The planner generates a highly optimized schedule that adapts to your degree choices and maximizes double/triple counting. The planner strategically places courses that fulfill multiple requirements simultaneously by showing real-time progress with indicators:
- Requirement met
- Requirement not yet met
- Shows completed/required counts for each requirement


Technical Details

-Python
-JSON for course mappings and requirements

Improvements: 
- Improve the output of schedule_planner & improve accuracy 
- Create a full stack web app