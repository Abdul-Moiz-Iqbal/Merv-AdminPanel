// models/FindRequest.ts
import mongoose from "mongoose";

export interface IFindRequest {
  _id?: string;
  email:string;
  product: string;
  quantity: string;
  targetCountry: string;
  status: "pending" | "responded";
  createdAt?: Date;
  updatedAt?: Date;
}

const findRequestSchema = new mongoose.Schema<IFindRequest>(
  {
    email: { type: String, required: [true, "Email is required"], trim: true },

    product: {
      type: String,
      required: [true, "Product is required"],
      trim: true,
      maxlength: [200, "Product cannot exceed 200 characters"],
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required"],
      trim: true,
      maxlength: [100, "Quantity cannot exceed 100 characters"],
    },
    targetCountry: {
      type: String,
      required: [true, "Target country is required"],
      trim: true,
      maxlength: [100, "Target country cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "responded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const FindRequest =
  mongoose.models.FindRequest ||
  mongoose.model<IFindRequest>("FindRequest", findRequestSchema);

export default FindRequest;
