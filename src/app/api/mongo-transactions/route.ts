import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const createdAt = searchParams.get('createdAt');
    const email = searchParams.get('email');
    const companyName = searchParams.get('companyName');

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Stage 1: Filter by date early (if present, uses index)
    if (createdAt) {
      const date = new Date(createdAt);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      pipeline.push({
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      });
    }

    // Stage 2: Sort early (uses createdAt index)
    pipeline.push({ $sort: { createdAt: -1 } });

    // Stage 3: Limit early if no user/company filters
    // Key optimization: only lookup what we need to display
    if (!email && !companyName) {
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    // Stage 4: Lookup User
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    });

    pipeline.push({
      $unwind: '$user',
    });

    // Stage 5: Filter by email (if present)
    if (email) {
      pipeline.push({
        $match: {
          'user.email': email,
        },
      });
    }

    // Stage 6: Lookup Company through User
    pipeline.push({
      $lookup: {
        from: 'companies',
        localField: 'user.companyId',
        foreignField: '_id',
        as: 'company',
      },
    });

    pipeline.push({
      $unwind: '$company',
    });

    // Stage 7: Filter by company name (if present)
    if (companyName) {
      pipeline.push({
        $match: {
          'company.name': companyName,
        },
      });
    }

    // Stage 8: Limit late if we had user/company filters
    if (email || companyName) {
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    // Create a separate pipeline for counting (without pagination)
    const countPipeline: any[] = [];

    // Add date filter if present
    if (createdAt) {
      const date = new Date(createdAt);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      countPipeline.push({
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      });
    }

    // If we have user/company filters, we need to do lookups for counting
    if (email || companyName) {
      countPipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      });
      countPipeline.push({ $unwind: '$user' });

      if (email) {
        countPipeline.push({
          $match: {
            'user.email': email,
          },
        });
      }

      countPipeline.push({
        $lookup: {
          from: 'companies',
          localField: 'user.companyId',
          foreignField: '_id',
          as: 'company',
        },
      });
      countPipeline.push({ $unwind: '$company' });

      if (companyName) {
        countPipeline.push({
          $match: {
            'company.name': companyName,
          },
        });
      }
    }

    countPipeline.push({ $count: 'total' });

    // Stage 6: Project the final shape
    pipeline.push({
      $project: {
        _id: 1,
        amount: 1,
        currency: 1,
        status: 1,
        type: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        user: {
          _id: '$user._id',
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          position: '$user.position',
        },
        company: {
          _id: '$company._id',
          name: '$company.name',
          industry: '$company.industry',
          country: '$company.country',
        },
      },
    });

    // Execute both queries in parallel
    const [transactions, countResult] = await Promise.all([
      Transaction.aggregate(pipeline),
      Transaction.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return NextResponse.json({
      data: transactions,
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
