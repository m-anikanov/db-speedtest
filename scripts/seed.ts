import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import models
import Company from '../src/models/Company';
import User from '../src/models/User';
import Transaction from '../src/models/Transaction';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Helper functions for generating random data
const randomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Data generators
const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Energy', 'Transportation', 'Media'
];

const countries = [
  'USA', 'UK', 'Germany', 'France', 'Japan', 'China', 'Canada',
  'Australia', 'Netherlands', 'Switzerland', 'Singapore', 'India'
];

const firstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa',
  'William', 'Jennifer', 'James', 'Mary', 'Christopher', 'Patricia', 'Daniel',
  'Linda', 'Matthew', 'Barbara', 'Anthony', 'Susan', 'Mark', 'Jessica', 'Donald'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
];

const positions = [
  'Software Engineer', 'Product Manager', 'Data Analyst', 'Sales Manager',
  'Marketing Specialist', 'HR Manager', 'Financial Analyst', 'Designer',
  'DevOps Engineer', 'Customer Support', 'Business Analyst', 'QA Engineer'
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD'];
const statuses = ['pending', 'completed', 'failed'] as const;
const types = ['deposit', 'withdrawal', 'transfer'] as const;

const generateCompanies = (count: number) => {
  const companies = [];
  for (let i = 0; i < count; i++) {
    companies.push({
      name: `Company ${i + 1} ${randomElement(industries)}`,
      industry: randomElement(industries),
      country: randomElement(countries),
      revenue: randomInt(100000, 100000000),
      employeeCount: randomInt(10, 10000),
      foundedYear: randomInt(1950, 2023),
      isActive: Math.random() > 0.1,
    });
  }
  return companies;
};

const generateUsers = (count: number, companyIds: mongoose.Types.ObjectId[]) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    users.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
      firstName,
      lastName,
      phone: `+1${randomInt(1000000000, 9999999999)}`,
      position: randomElement(positions),
      salary: randomInt(30000, 200000),
      companyId: randomElement(companyIds),
    });
  }
  return users;
};

const generateTransactions = (count: number, userIds: mongoose.Types.ObjectId[]) => {
  const transactions = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2025-11-15');

  for (let i = 0; i < count; i++) {
    transactions.push({
      amount: parseFloat((Math.random() * 10000).toFixed(2)),
      currency: randomElement(currencies),
      status: randomElement(statuses),
      type: randomElement(types),
      description: `Transaction ${i + 1} - ${randomElement(types)}`,
      userId: randomElement(userIds),
      createdAt: randomDate(startDate, endDate),
    });
  }
  return transactions;
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Company.deleteMany({});
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Existing data cleared');

    // Generate and insert companies
    console.log('Generating 100 companies...');
    const companies = generateCompanies(100);
    const insertedCompanies = await Company.insertMany(companies);
    const companyIds = insertedCompanies.map(c => c._id as mongoose.Types.ObjectId);
    console.log(`✓ ${insertedCompanies.length} companies created`);

    // Generate and insert users
    console.log('Generating 500 users...');
    const users = generateUsers(500, companyIds);
    const insertedUsers = await User.insertMany(users);
    const userIds = insertedUsers.map(u => u._id as mongoose.Types.ObjectId);
    console.log(`✓ ${insertedUsers.length} users created`);

    // Generate and insert transactions (in batches for better performance)
    console.log('Generating 10,000 transactions...');
    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < 10; i++) {
      const transactions = generateTransactions(batchSize, userIds);
      const inserted = await Transaction.insertMany(transactions);
      totalInserted += inserted.length;
      console.log(`  Batch ${i + 1}/10: ${inserted.length} transactions created`);
    }

    console.log(`✓ ${totalInserted} transactions created`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- Companies: ${insertedCompanies.length}`);
    console.log(`- Users: ${insertedUsers.length}`);
    console.log(`- Transactions: ${totalInserted}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

seed();
