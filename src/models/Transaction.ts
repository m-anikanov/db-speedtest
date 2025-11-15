import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'transfer'], required: true },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Индекс для фильтрации по дате
TransactionSchema.index({ createdAt: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
