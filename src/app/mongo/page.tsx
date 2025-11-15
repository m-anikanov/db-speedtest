'use client';

import { useState } from 'react';
import TransactionFilters from '@/components/TransactionFilters';
import TransactionsTable from '@/components/TransactionsTable';
import { Card } from '@/components/ui/card';
import { TransactionFilters as Filters } from '@/types';

export default function MongoPage() {
  const [filters, setFilters] = useState<Filters>({
    createdAt: '',
    email: '',
    companyName: '',
  });
  const [executionTime, setExecutionTime] = useState<number>(0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            MongoDB Performance Test
          </h1>
          <p className="text-slate-600">
            Testing relational model query performance with 10,000 transactions
          </p>
        </div>

        <Card className="sticky top-0 z-10 mb-6 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                Last Query Execution Time
              </p>
              <p className="text-4xl font-bold mt-1">
                {executionTime}
                <span className="text-xl ml-1">ms</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Server-side measurement</p>
              <p className="text-xs text-green-200 mt-1">
                Includes DB query + data processing
              </p>
            </div>
          </div>
        </Card>

        <TransactionFilters filters={filters} onFilterChange={setFilters} />

        <TransactionsTable
          filters={filters}
          onExecutionTime={setExecutionTime}
        />
      </div>
    </div>
  );
}
