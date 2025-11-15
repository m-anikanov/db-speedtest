'use client';

import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionFilters as Filters } from '@/types';

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, createdAt: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, email: e.target.value });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, companyName: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({ createdAt: '', email: '', companyName: '' });
  };

  return (
    <Card className="p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium">
            Transaction Date
          </label>
          <Input
            id="date"
            type="date"
            value={filters.createdAt || ''}
            onChange={handleDateChange}
            placeholder="Filter by date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            User Email
          </label>
          <Input
            id="email"
            type="text"
            value={filters.email || ''}
            onChange={handleEmailChange}
            placeholder="user@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company Name
          </label>
          <Input
            id="company"
            type="text"
            value={filters.companyName || ''}
            onChange={handleCompanyChange}
            placeholder="Company name"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
