import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry: string;
  country: string;
  revenue: number;
  employeeCount: number;
  foundedYear: number;
  isActive: boolean;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, index: true },
    industry: { type: String, required: true },
    country: { type: String, required: true },
    revenue: { type: Number, required: true },
    employeeCount: { type: Number, required: true },
    foundedYear: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
