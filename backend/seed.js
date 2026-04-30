require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const Goal = require('./models/Goal');

const courses = [
  {
    title: 'Advanced System Design Architecture',
    description: 'Master large-scale distributed systems, microservices, and database sharding techniques used by FAANG companies.',
    level: 'advanced',
    subject: 'Computer Science',
    topics: ['Load Balancing', 'Consistent Hashing', 'Database Sharding', 'Message Queues', 'CAP Theorem', 'Microservices', 'Caching Strategies'],
    tags: ['system design', 'backend', 'scalability', 'architecture'],
    duration: 2400,
    enrolledCount: 15420,
    rating: 4.9,
  },
  {
    title: 'Deep Learning & Neural Networks',
    description: 'Comprehensive guide to building, training, and optimizing deep neural networks using PyTorch and TensorFlow.',
    level: 'advanced',
    subject: 'AI/ML',
    topics: ['Backpropagation', 'Convolutional Neural Networks', 'Recurrent Neural Networks', 'Transformers', 'Optimization Algorithms'],
    tags: ['ml', 'ai', 'data science', 'deep learning', 'pytorch'],
    duration: 3200,
    enrolledCount: 22100,
    rating: 4.8,
  },
  {
    title: 'Elite Data Structures & Algorithms',
    description: 'Crush technical interviews by mastering dynamic programming, graph theory, and advanced tree structures.',
    level: 'advanced',
    subject: 'Computer Science',
    topics: ['AVL & Red-Black Trees', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming', 'Trie Data Structure', 'Disjoint Set (Union-Find)'],
    tags: ['dsa', 'algorithms', 'cs', 'interview prep'],
    duration: 1800,
    enrolledCount: 34500,
    rating: 4.9,
  },
  {
    title: 'Quantum Computing Fundamentals',
    description: 'An introduction to quantum mechanics principles, qubits, and quantum logic gates for computer scientists.',
    level: 'beginner',
    subject: 'Physics',
    topics: ['Superposition', 'Quantum Entanglement', 'Quantum Gates', "Shor's Algorithm", "Grover's Algorithm"],
    tags: ['quantum', 'physics', 'future tech'],
    duration: 1200,
    enrolledCount: 5200,
    rating: 4.7,
  },
  {
    title: 'Full-Stack React & Node.js Mastery',
    description: 'Build production-ready, scalable web applications with React, Node, Express, and MongoDB.',
    level: 'intermediate',
    subject: 'Web Development',
    topics: ['React Hooks', 'State Management (Redux/Zustand)', 'RESTful APIs', 'JWT Authentication', 'MongoDB Aggregation'],
    tags: ['react', 'node', 'fullstack', 'javascript'],
    duration: 2100,
    enrolledCount: 41200,
    rating: 4.8,
  },
  {
    title: 'Blockchain & Smart Contract Engineering',
    description: 'Develop secure smart contracts on the Ethereum blockchain using Solidity.',
    level: 'intermediate',
    subject: 'Engineering',
    topics: ['Ethereum Virtual Machine', 'Solidity Syntax', 'Web3.js', 'DeFi Protocols', 'Smart Contract Security'],
    tags: ['web3', 'blockchain', 'solidity', 'crypto'],
    duration: 1500,
    enrolledCount: 8900,
    rating: 4.6,
  },
  {
    title: 'Advanced Mathematics for Machine Learning',
    description: 'The definitive guide to the linear algebra, calculus, and probability theory powering modern AI.',
    level: 'intermediate',
    subject: 'Mathematics',
    topics: ['Linear Algebra (Vectors/Matrices)', 'Multivariate Calculus', 'Probability Distributions', 'Information Theory', 'Optimization'],
    tags: ['math', 'ai', 'machine learning', 'theory'],
    duration: 2800,
    enrolledCount: 11300,
    rating: 4.8,
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB for Elite Seeding...');
    
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses.');

    await Course.insertMany(courses);
    console.log('✅ 7 Elite Courses inserted successfully!');

    // Generate some mock goals
    await Goal.deleteMany({});
    const globalGoal = new Goal({
      userId: new mongoose.Types.ObjectId(), // Orphaned goal just to have data in collection
      title: 'Master System Design',
      type: 'skill',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dailyTasks: [
        { text: 'Read CAP Theorem Paper', isCompleted: true },
        { text: 'Design URL Shortener', isCompleted: false },
        { text: 'Study Consistent Hashing', isCompleted: false }
      ]
    });
    await globalGoal.save();
    console.log('✅ Seed Goals inserted successfully!');

    console.log('🚀 SEEDING COMPLETE. Ready for Elite Production.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seed();
