import { Schema, models, model } from "mongoose";

const ConmpanySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    phone: { type: String, required: true },
    productDescription: { type: Map, required: true },
    category:{type:String , required:true},
    logo: { type: String },
    status: {
      type: String,
      enum: ["rejected", "pending", "approved"],
      default: "pending",
      required: true,
    },
    logoPublicId: { type: String },
  },
  {
    timestamps: true,
  }
);

ConmpanySchema.index({ status: 1 });

const Company = models.Company || model("Company", ConmpanySchema);

export default Company;
