import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

// Helper functions for generating random data
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
const statuses = ['pending', 'completed', 'failed'];
const types = ['deposit', 'withdrawal', 'transfer'];

async function seed() {
  try {
    console.log('Connecting to PostgreSQL...');
    console.log('Connected to PostgreSQL');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    console.log('Existing data cleared');

    // Generate and insert companies
    console.log('Generating 100 companies...');
    const companies = [];
    for (let i = 0; i < 100; i++) {
      const company = await prisma.company.create({
        data: {
          name: `Company ${i + 1} ${randomElement(industries)}`,
          industry: randomElement(industries),
          country: randomElement(countries),
          revenue: randomInt(100000, 100000000),
          employeeCount: randomInt(10, 10000),
          foundedYear: randomInt(1950, 2023),
          isActive: Math.random() > 0.1,
        },
      });
      companies.push(company);
    }
    console.log(`✓ ${companies.length} companies created`);

    // Generate and insert users
    console.log('Generating 500 users...');
    const users = [];
    for (let i = 0; i < 500; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const user = await prisma.user.create({
        data: {
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
          firstName,
          lastName,
          phone: `+1${randomInt(1000000000, 9999999999)}`,
          position: randomElement(positions),
          salary: randomInt(30000, 200000),
          companyId: randomElement(companies).id,
        },
      });
      users.push(user);
    }
    console.log(`✓ ${users.length} users created`);

    // Generate and insert transactions (in batches)
    console.log('Generating 10,000 transactions...');
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-11-15');
    let totalInserted = 0;

    const batchSize = 1000;
    for (let batch = 0; batch < 10; batch++) {
      const transactionsData = [];
      for (let i = 0; i < batchSize; i++) {
        transactionsData.push({
          amount: parseFloat((Math.random() * 10000).toFixed(2)),
          currency: randomElement(currencies),
          status: randomElement(statuses),
          type: randomElement(types),
          description: `Transaction ${batch * batchSize + i + 1} - ${randomElement(types)}`,
          userId: randomElement(users).id,
          createdAt: randomDate(startDate, endDate),
        });
      }

      await prisma.transaction.createMany({
        data: transactionsData,
      });

      totalInserted += transactionsData.length;
      console.log(`  Batch ${batch + 1}/10: ${transactionsData.length} transactions created`);
    }

    console.log(`✓ ${totalInserted} transactions created`);

    console.log('\n✅ PostgreSQL database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Transactions: ${totalInserted}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\nPostgreSQL connection closed');
  }
}

seed();
