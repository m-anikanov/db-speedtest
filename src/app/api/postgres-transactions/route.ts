import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const createdAt = searchParams.get('createdAt');
    const email = searchParams.get('email');
    const companyName = searchParams.get('companyName');

    // Build where clause
    const where: any = {};

    if (createdAt) {
      const date = new Date(createdAt);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.createdAt = { gte: startOfDay, lte: endOfDay };
    }

    if (email) {
      where.user = {
        email: email,
      };
    }

    if (companyName) {
      where.user = {
        ...where.user,
        company: {
          name: companyName,
        },
      };
    }

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              position: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                  country: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform data to match MongoDB format
    const data = transactions.map((t) => ({
      _id: t.id,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user: {
        _id: t.user.id,
        email: t.user.email,
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        position: t.user.position,
      },
      company: {
        _id: t.user.company.id,
        name: t.user.company.name,
        industry: t.user.company.industry,
        country: t.user.company.country,
      },
    }));

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      executionTime, // in milliseconds
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    );
  }
}
