import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Database Performance Comparison
          </h1>
          <p className="text-xl text-slate-600">
            Compare MongoDB vs PostgreSQL query performance on relational data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.2 10.9c-.2 0-.4.1-.6.2-1.1-1.7-3-2.9-5.2-3.1V6.7c1-.2 1.7-1.1 1.7-2.1 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2c0 1 .7 1.9 1.7 2.1V8c-2.2.2-4.1 1.4-5.2 3.1-.2-.1-.4-.2-.6-.2-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2c1 0 1.9-.7 2.1-1.7h1.7c.2 2.2 2 3.9 4.2 3.9s4-1.7 4.2-3.9h1.7c.2 1 1.1 1.7 2.1 1.7 1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">MongoDB</h2>
              <p className="text-slate-600 mb-6">
                Document database with aggregation pipeline for relational queries
              </p>
              <Link href="/mongo">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Test MongoDB
                </Button>
              </Link>
            </div>
            <div className="border-t pt-4 mt-4">
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ Aggregation pipeline</li>
                <li>✓ $lookup for joins</li>
                <li>✓ 10,000 transactions</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v6h6v-2h-4V7z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">PostgreSQL</h2>
              <p className="text-slate-600 mb-6">
                Relational database with foreign keys and SQL joins
              </p>
              <Link href="/postgres">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Test PostgreSQL
                </Button>
              </Link>
            </div>
            <div className="border-t pt-4 mt-4">
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ Prisma ORM</li>
                <li>✓ Foreign key relations</li>
                <li>✓ 10,000 transactions</li>
              </ul>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Test Scenario</h3>
          <p className="text-slate-700">
            Both databases contain identical data: 100 companies, 500 users, and 10,000 transactions.
            Each transaction is linked to a user, who belongs to a company. The test measures query
            execution time for fetching paginated transactions with optional filters by date, email,
            or company name.
          </p>
        </Card>
      </div>
    </div>
  );
}
