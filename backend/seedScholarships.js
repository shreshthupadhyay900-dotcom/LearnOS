const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');

const scholarships = [
  // --- CENTRAL SCHOLARSHIPS (INDIA) ---
  {
    name: 'National Scholarship Portal (NSP) Post-Matric',
    description: 'Central government scholarship for minority students to pursue higher education.',
    amount: '₹10,000 - ₹20,000 per year',
    deadline: new Date('2026-10-31'),
    applyLink: 'https://scholarships.gov.in/',
    category: ['Minority'],
    incomeLimit: 200000,
    educationLevel: ['Undergraduate', 'Postgraduate'],
    state: 'All India',
    scholarshipType: 'Central',
    applicationPortal: 'National Scholarship Portal (NSP)',
    requiredDocuments: ['Aadhar Card', 'Self-declaration of Minority Community', 'Income Certificate', 'Previous Year Marksheet', 'Bank Passbook'],
    eligibilitySummary: 'Minority students with >50% marks in previous exam.',
    tags: ['NSP', 'Government', 'Central']
  },
  {
    name: 'PM-YASASVI Central Sector Scheme',
    description: 'Top class education for OBC, EBC and DNT students.',
    amount: '₹75,000 - ₹1,25,000 per year',
    deadline: new Date('2026-12-15'),
    applyLink: 'https://yet.nta.ac.in/',
    category: ['OBC'],
    incomeLimit: 250000,
    educationLevel: ['Class 9', 'Class 11', 'Undergraduate'],
    state: 'All India',
    scholarshipType: 'Central',
    applicationPortal: 'NTA / YASASVI Portal',
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Aadhar Card', 'School/College ID', 'YASASVI Entrance Scorecard'],
    eligibilitySummary: 'OBC/EBC/DNT students with family income < 2.5L.',
    tags: ['OBC', 'Premium']
  },

  // --- STATE SCHOLARSHIPS (INDIA) ---
  {
    name: 'MahaDBT Post-Matric Scholarship',
    description: 'Comprehensive scholarship for students of Maharashtra state.',
    amount: 'Full Tuition Fee + Maintenance Allowance',
    deadline: new Date('2026-03-31'),
    applyLink: 'https://mahadbt.maharashtra.gov.in/',
    category: ['SC', 'ST', 'OBC', 'OBC', 'General'],
    incomeLimit: 800000,
    educationLevel: ['Undergraduate', 'Postgraduate', 'Diploma'],
    state: 'Maharashtra',
    scholarshipType: 'State',
    applicationPortal: 'MahaDBT (Aaple Sarkar)',
    requiredDocuments: ['Domicile Certificate', 'Caste Certificate', 'Income Certificate (Form 16)', 'CAP Allotment Letter', 'Hostel Certificate (if applicable)'],
    eligibilitySummary: 'Maharashtra residents with valid domicile and caste documents.',
    tags: ['Maharashtra', 'State']
  },
  {
    name: 'UP Scholarship & Fee Reimbursement Online System',
    description: 'Scholarship for students studying in Uttar Pradesh.',
    amount: '₹5,000 - ₹50,000',
    deadline: new Date('2026-01-10'),
    applyLink: 'https://scholarship.up.gov.in/',
    category: ['SC', 'ST', 'OBC', 'Minority', 'General'],
    incomeLimit: 200000,
    educationLevel: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate'],
    state: 'Uttar Pradesh',
    scholarshipType: 'State',
    applicationPortal: 'UP Scholarship Portal (Saksham)',
    requiredDocuments: ['Residential Certificate', 'Cast Certificate', 'Income Certificate', 'Aadhar Linked Bank Account', 'Fee Receipt'],
    eligibilitySummary: 'UP Domicile students studying in UP institutions.',
    tags: ['UP', 'Saksham']
  },

  // --- INTERNATIONAL SCHOLARSHIPS ---
  {
    name: 'Chevening Scholarships (UK)',
    description: 'The UK government’s international awards programme for master’s degrees.',
    amount: 'Full Tuition + Monthly Stipend + Travel',
    deadline: new Date('2026-11-05'),
    applyLink: 'https://www.chevening.org/apply/',
    category: ['All'],
    incomeLimit: 9999999, // No strict limit, but focus on leadership
    educationLevel: ['Postgraduate'],
    state: 'International',
    scholarshipType: 'International',
    applicationPortal: 'Chevening Online Application System',
    requiredDocuments: ['Passport', 'Degree Certificate', 'English Language Proof (IELTS/TOEFL)', 'Two Reference Letters', 'Two-year Work Experience Proof'],
    eligibilitySummary: 'Undergraduate degree, 2 years work experience, and leadership potential.',
    tags: ['UK', 'Masters', 'Global']
  },
  {
    name: 'Fulbright-Nehru Master’s Fellowships (USA)',
    description: 'Scholarships for Indian students to pursue master’s in the USA.',
    amount: 'Full Funding + J-1 Visa Support',
    deadline: new Date('2026-05-15'),
    applyLink: 'https://www.usief.org.in/',
    category: ['All'],
    incomeLimit: 9999999,
    educationLevel: ['Postgraduate'],
    state: 'International',
    scholarshipType: 'International',
    applicationPortal: 'USIEF / IIE Portal',
    requiredDocuments: ['Bachelor\'s Degree Marks', 'GRE/GMAT Score', 'TOEFL Score', 'Personal Statement', '3 Letters of Recommendation'],
    eligibilitySummary: 'Indian citizens with 55% marks in bachelors and 3 years work experience.',
    tags: ['USA', 'Research', 'Elite']
  },
  {
    name: 'DAAD Scholarships (Germany)',
    description: 'Scholarships for international students to study in Germany.',
    amount: '€934 - €1,200 per month + Insurance',
    deadline: new Date('2026-08-31'),
    applyLink: 'https://www.daad.de/',
    category: ['All'],
    incomeLimit: 9999999,
    educationLevel: ['Postgraduate', 'PhD'],
    state: 'International',
    scholarshipType: 'International',
    applicationPortal: 'DAAD Portal',
    requiredDocuments: ['Curriculum Vitae', 'Letter of Motivation', 'University Entrance Qualification', 'Language Certificate (German/English)', 'Project Proposal (for PhD)'],
    eligibilitySummary: 'Highly qualified graduates/doctoral students from developing countries.',
    tags: ['Germany', 'Europe', 'PhD']
  }
];

const seedScholarships = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB for Premium Scholarship Seeding...');
    
    await Scholarship.deleteMany({});
    console.log('🗑️  Cleared existing scholarships.');

    await Scholarship.insertMany(scholarships);
    console.log(`✅ ${scholarships.length} State, Central, and International Schemes inserted!`);

    console.log('🚀 COMPREHENSIVE SCHOLARSHIP SEEDING COMPLETE.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding scholarships:', error);
    process.exit(1);
  }
};

seedScholarships();
