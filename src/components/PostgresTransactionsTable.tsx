'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { TransactionFilters, TransactionResponse } from '@/types';
import { format } from 'date-fns';

interface PostgresTransactionsTableProps {
  filters: TransactionFilters;
  onExecutionTime: (time: number) => void;
}

const fetchTransactions = async (
  page: number,
  filters: TransactionFilters
): Promise<TransactionResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });

  if (filters.createdAt) params.append('createdAt', filters.createdAt);
  if (filters.email) params.append('email', filters.email);
  if (filters.companyName) params.append('companyName', filters.companyName);

  const response = await fetch(`/api/postgres-transactions?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export default function PostgresTransactionsTable({
  filters,
  onExecutionTime,
}: PostgresTransactionsTableProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['postgres-transactions', filters],
    queryFn: ({ pageParam = 1 }) => fetchTransactions(pageParam, filters),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  // Update execution time whenever data changes
  useEffect(() => {
    if (data?.pages && data.pages.length > 0) {
      const lastPage = data.pages[data.pages.length - 1];
      onExecutionTime(lastPage.executionTime);
    }
  }, [data, onExecutionTime]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading transactions...</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </Card>
    );
  }

  const transactions = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.pagination.total || 0;

  return (
    <div>
      <Card className="mb-4 p-4">
        <p className="text-sm text-muted-foreground">
          Total transactions: <span className="font-semibold">{totalCount}</span>
        </p>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow key={`${transaction._id}-${index}`}>
                  <TableCell>
                    {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {transaction.amount.toFixed(2)} {transaction.currency}
                  </TableCell>
                  <TableCell className="capitalize">{transaction.type}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.user.firstName} {transaction.user.lastName}
                  </TableCell>
                  <TableCell>{transaction.user.email}</TableCell>
                  <TableCell>{transaction.company.name}</TableCell>
                  <TableCell>{transaction.company.industry}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="h-4" />

        {isFetchingNextPage && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading more...</p>
          </div>
        )}

        {!hasNextPage && transactions.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No more transactions to load
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
