// Mock data for Brown Community Visualization
// Replace this with actual Brown University data


const brownData = {
 year: 2024,
 totalCount: 15203,


 students: {
   total: 11232,
   byClass: {
     firstYear: 2500,
     sophomore: 2500,
     junior: 2500,
     senior: 2500
   },
   byGender: {
     men: {
       enrolled: 5200,
       admitted: 6500,
       applicants: 25000, // Total who applied (not admitted)
       acceptanceRate: 5.1,
       yieldRate: 80.0,
       byClass: {
         firstYear: 1320,
         sophomore: 1300,
         junior: 1290,
         senior: 1290
       }
     },
     women: {
       enrolled: 4600,
       admitted: 5840,
       applicants: 28000, // Total who applied (not admitted)
       acceptanceRate: 5.2,
       yieldRate: 79.2,
       byClass: {
         firstYear: 1180,
         sophomore: 1142,
         junior: 1156,
         senior: 1122
       }
     },
     nonBinary: {
       enrolled: 200,
       admitted: 280,
       applicants: 1200, // Total who applied (not admitted)
       acceptanceRate: 4.8,
       yieldRate: 71.4,
       byClass: {
         firstYear: 50,
         sophomore: 58,
         junior: 54,
         senior: 38
       }
     }
   },
   // Class of 2024 seniors by concentration
   seniorsByConcentration: [
     {
       name: "Computer Science",
       bachelors: 222,
       masters: 150,
       topCombinations: [
         { combo: "CS + Applied Math", count: 45 },
         { combo: "CS + Economics", count: 32 },
         { combo: "CS + Engineering", count: 28 }
       ]
     },
     {
       name: "Engineering",
       bachelors: 99,
       masters: 151,
       topCombinations: [
         { combo: "Engineering + CS", count: 28 },
         { combo: "Engineering + Physics", count: 18 },
         { combo: "Engineering + Applied Math", count: 15 }
       ]
     },
     {
       name: "Social Sciences",
       bachelors: 361,
       masters: 141,
       topCombinations: [
         { combo: "Economics + Political Science", count: 52 },
         { combo: "Sociology + Public Health", count: 38 },
         { combo: "Psychology + Neuroscience", count: 34 }
       ]
     },
     {
       name: "Biomedical Sciences",
       bachelors: 224,
       masters: 57,
       topCombinations: [
         { combo: "Biology + Public Health", count: 36 },
         { combo: "Neuroscience + Psychology", count: 28 },
         { combo: "Biology + Chemistry", count: 22 }
       ]
     },
     {
       name: "Mathematics",
       bachelors: 179,
       masters: 14,
       topCombinations: [
         { combo: "Math + CS", count: 42 },
         { combo: "Math + Economics", count: 28 },
         { combo: "Math + Physics", count: 18 }
       ]
     },
     {
       name: "Interdisciplinary Studies",
       bachelors: 97,
       masters: 113,
       topCombinations: [
         { combo: "Custom Independent", count: 15 },
         { combo: "Science & Society", count: 12 },
         { combo: "Urban Studies + Public Policy", count: 10 }
       ]
     },
     {
       name: "English",
       bachelors: 82,
       masters: 26,
       topCombinations: [
         { combo: "English + History", count: 18 },
         { combo: "English + Theatre Arts", count: 12 },
         { combo: "English + Comparative Literature", count: 10 }
       ]
     },
     {
       name: "Visual Arts",
       bachelors: 49,
       masters: 32,
       topCombinations: [
         { combo: "Visual Arts + Art History", count: 8 },
         { combo: "Visual Arts + Architecture", count: 6 },
         { combo: "Visual Arts + Theatre", count: 5 }
       ]
     },
     {
       name: "Physical Sciences",
       bachelors: 52,
       masters: 53,
       topCombinations: [
         { combo: "Physics + Math", count: 12 },
         { combo: "Chemistry + Biology", count: 10 },
         { combo: "Physics + Engineering", count: 8 }
       ]
     },
     {
       name: "Psychology",
       bachelors: 55,
       masters: 2,
       topCombinations: [
         { combo: "Psychology + Neuroscience", count: 14 },
         { combo: "Psychology + Cognitive Science", count: 8 },
         { combo: "Psychology + Education", count: 6 }
       ]
     },
     {
       name: "History",
       bachelors: 43,
       masters: 9,
       topCombinations: [
         { combo: "History + Political Science", count: 10 },
         { combo: "History + English", count: 8 },
         { combo: "History + International Relations", count: 6 }
       ]
     },
     {
       name: "Gender Studies",
       bachelors: 39,
       masters: 13,
       topCombinations: [
         { combo: "Gender Studies + Sociology", count: 8 },
         { combo: "Gender Studies + English", count: 6 },
         { combo: "Gender Studies + Public Health", count: 5 }
       ]
     },
     {
       name: "Conservation",
       bachelors: 34,
       masters: 0,
       topCombinations: [
         { combo: "Environmental Studies + Biology", count: 8 },
         { combo: "Environmental Studies + Public Policy", count: 6 },
         { combo: "Environmental Studies + Economics", count: 4 }
       ]
     },
     {
       name: "Business",
       bachelors: 34,
       masters: 38,
       topCombinations: [
         { combo: "Commerce + Economics", count: 10 },
         { combo: "Commerce + Entrepreneurship", count: 8 },
         { combo: "Commerce + Finance", count: 6 }
       ]
     },
     {
       name: "Foreign Languages",
       bachelors: 28,
       masters: 1,
       topCombinations: [
         { combo: "Hispanic Studies + Portuguese", count: 6 },
         { combo: "French + Comparative Literature", count: 5 },
         { combo: "Italian + Art History", count: 4 }
       ]
     },
     {
       name: "Journalism",
       bachelors: 23,
       masters: 2,
       topCombinations: [
         { combo: "Journalism + Political Science", count: 5 },
         { combo: "Journalism + English", count: 4 },
         { combo: "Journalism + Media Studies", count: 3 }
       ]
     },
     {
       name: "Philosophy",
       bachelors: 20,
       masters: 1,
       topCombinations: [
         { combo: "Philosophy + Political Science", count: 5 },
         { combo: "Philosophy + Cognitive Science", count: 4 },
         { combo: "Philosophy + English", count: 3 }
       ]
     },
     {
       name: "Education",
       bachelors: 15,
       masters: 40,
       topCombinations: [
         { combo: "Education + Psychology", count: 4 },
         { combo: "Education + Public Policy", count: 3 },
         { combo: "Education + Sociology", count: 2 }
       ]
     },
     {
       name: "Architecture",
       bachelors: 14,
       masters: 0,
       topCombinations: [
         { combo: "Architecture + Visual Arts", count: 3 },
         { combo: "Architecture + Engineering", count: 2 },
         { combo: "Architecture + Urban Studies", count: 2 }
       ]
     },
     {
       name: "Public Administration",
       bachelors: 12,
       masters: 66,
       topCombinations: [
         { combo: "Public Policy + Economics", count: 3 },
         { combo: "Public Policy + Political Science", count: 2 },
         { combo: "Public Policy + Urban Studies", count: 2 }
       ]
     },
     {
       name: "Health Professions",
       bachelors: 0,
       masters: 77,
       topCombinations: [
         { combo: "Public Health + Biology", count: 15 },
         { combo: "Public Health + Sociology", count: 12 },
         { combo: "Public Health + Health Policy", count: 10 }
       ]
     }
   ]
 },


 faculty: {
   total: 880,
   byDepartment: [
     { name: "Computer Science", count: 45, assistantProf: 12, associateProf: 15, fullProf: 18 },
     { name: "Engineering", count: 82, assistantProf: 22, associateProf: 28, fullProf: 32 },
     { name: "Biology", count: 58, assistantProf: 15, associateProf: 20, fullProf: 23 },
     { name: "Economics", count: 52, assistantProf: 14, associateProf: 18, fullProf: 20 },
     { name: "Mathematics", count: 38, assistantProf: 10, associateProf: 12, fullProf: 16 },
     { name: "English", count: 42, assistantProf: 11, associateProf: 14, fullProf: 17 },
     { name: "History", count: 40, assistantProf: 10, associateProf: 13, fullProf: 17 },
     { name: "Physics", count: 36, assistantProf: 9, associateProf: 12, fullProf: 15 },
     { name: "Chemistry", count: 34, assistantProf: 9, associateProf: 11, fullProf: 14 },
     { name: "Political Science", count: 35, assistantProf: 9, associateProf: 12, fullProf: 14 },
     { name: "Psychology", count: 32, assistantProf: 8, associateProf: 11, fullProf: 13 },
     { name: "Medical School", count: 180, assistantProf: 60, associateProf: 65, fullProf: 55 },
     { name: "Other Departments", count: 176, assistantProf: 50, associateProf: 60, fullProf: 66 }
   ],
   // Faculty by rank with gender breakdown
   byRank: {
     assistantProf: {
       total: 239,
       men: 120,
       women: 119
     },
     associateProf: {
       total: 291,
       men: 160,
       women: 131
     },
     fullProf: {
       total: 320,
       men: 205,
       women: 115
     }
   }
 },


 staff: {
   total: 3971,
   byDivision: [
     { name: "Student Services", count: 340, subDepts: ["Admissions", "Financial Aid", "Student Life", "Health Services", "Counseling", "Career Services", "Residential Life"] },
     { name: "Administration", count: 280, subDepts: ["President's Office", "Provost", "Dean's Offices", "Legal", "Compliance"] },
     { name: "Facilities & Operations", count: 1100, subDepts: ["Dining Services", "Maintenance", "Security", "Transportation", "Housekeeping"] },
     { name: "Academic Support", count: 520, subDepts: ["Libraries", "IT Services", "Research Administration", "Academic Technology", "Writing Center"] },
     { name: "Athletics & Recreation", count: 180, subDepts: ["Coaching Staff", "Athletic Training", "Recreation Centers", "Intramurals"] },
     { name: "Development & Alumni", count: 210, subDepts: ["Fundraising", "Alumni Relations", "Donor Relations", "Annual Giving"] },
     { name: "Communications", count: 145, subDepts: ["Marketing", "Public Relations", "Social Media", "Publications"] },
     { name: "Finance & HR", count: 380, subDepts: ["Accounting", "Payroll", "HR", "Benefits", "Procurement"] },
     { name: "Other", count: 1343, subDepts: ["Various departments"] }
   ]
 }
};


// Color palette
const colors = {
 students: '#4A90E2',
 faculty: '#F5A623',
 staff: '#7ED321',


 // Gender colors
 men: '#4A90E2',
 women: '#E94B8C',
 nonBinary: '#9B59B6',


 // Degree level colors
 bachelors: '#1E5A8E',
 masters: '#D35400',


 // Muted versions (30% opacity)
 mutedStudents: 'rgba(74, 144, 226, 0.3)',
 mutedFaculty: 'rgba(245, 166, 35, 0.3)',
 mutedStaff: 'rgba(126, 211, 33, 0.3)'
};
