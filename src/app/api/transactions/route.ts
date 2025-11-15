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

    // Stage 1: Lookup User
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

    // Stage 2: Lookup Company through User
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

    // Stage 3: Apply filters
    const matchStage: any = {};

    if (createdAt) {
      const date = new Date(createdAt);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      matchStage.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (email) {
      matchStage['user.email'] = email;
    }

    if (companyName) {
      matchStage['company.name'] = companyName;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Stage 4: Sort by createdAt descending
    pipeline.push({ $sort: { createdAt: -1 } });

    // Create a separate pipeline for counting
    const countPipeline = [...pipeline, { $count: 'total' }];

    // Stage 5: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

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
