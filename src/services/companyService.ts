// services/CompanyService.ts
import connectDB from "@/lib/mongoose";
import Company from "@/models/Companies";
import mongoose, { Types } from "mongoose";
import {
  deleteFromCloudinary,
} from "@/utils/cloudinary";
import { getTranslations } from "@/utils/geminiAiTranslation";


interface Company {
  name: string;
  contact: string;
  email: string;
  phone: string;
  productDescription: string;
  category:string;
  logo?: string;
  logoPublicId?: string; // Add this to store Cloudinary public ID
  status?: string;
}

interface CompanyUpdateInput {
  _id?: string;
  status?: string;
  email?: string;
  phone?: string;
  contact?: string;
  name?: string;
  category?: string;
  productDescription?: Map<string, string>;
  logo?: string;
  logoPublicId?: string;
}

export class CompanyService {
  //create a new company
  static async createComapny(comapnyData: Company) {
    const {
      name,
      contact,
      email,
      phone,
      productDescription,
      logo,
      category,
      logoPublicId,
    } = comapnyData;
    if (!name.trim() || !contact.trim() || !email.trim() || !category.trim() || !phone.trim() ) {
      return { message: "Invalid Data", code: 400 };
    }

    // this will auto detect the language and return the translated version
  const translatedDescription = await getTranslations(productDescription)
    
  console.log(translatedDescription)
    try {
      await connectDB();
      await Company.create({
        name,
        contact,
        email,
        phone,
        category,
        productDescription: translatedDescription,
        logo,
        logoPublicId,
      });
      return { message: "Company Created Successfully", code: 200 };
    } catch (error) {
      console.log("Error in services(CompanyService)", error);
      return { message: "Error in services", error };
    }
  }

  static async getAllCompanies() {
    try {
      await connectDB();
      const companies = await Company.find();
      console.log(companies);
      return companies;
    } catch (error) {
      console.log("error in fetching companies", error);
      return { message: "error in fetching companies", code: 500 };
    }
  }

  // delete a single company (with Cloudinary image cleanup)
  static async deleteCompany(id: string) {
    console.log(id);
    if (!id) {
      return { message: "Invalid Id", code: 400 };
    }

    try {
      await connectDB();

      // Get company data to retrieve logo public ID
      const company = await Company.findById(new Types.ObjectId(id));

      if (!company) {
        return { message: "Company not found", code: 404 };
      }

      // Delete image from Cloudinary if exists
      if (company.logoPublicId) {
        try {
          await deleteFromCloudinary(company.logoPublicId);
        } catch (cloudinaryError) {
          console.error(
            "Failed to delete image from Cloudinary:",
            cloudinaryError
          );
          // Continue with company deletion even if Cloudinary deletion fails
        }
      }

      const result = await Company.deleteOne({ _id: new Types.ObjectId(id) });
      console.log(result);

      if (result.deletedCount > 0) {
        return { message: "Successfully Deleted", code: 200 };
      } else {
        return { message: "Failed to delete", code: 500 };
      }
    } catch (error) {
      console.log("Error in delete company service:", error);
      return { message: "Error in delete company service", code: 500 };
    }
  }

  //delete multiple companies at once (with Cloudinary cleanup)
  static async deleteCompanies(ids: string[]) {
    try {
      console.log(ids);
      if (!ids.length) {
        return { message: "Invalid Id", code: 400 };
      }

      await connectDB();

      // Get companies data to retrieve logo public IDs
      const companies = await Company.find({ _id: { $in: ids } });

      // Delete images from Cloudinary
      const cloudinaryDeletions = companies
        .filter((company) => company.logoPublicId)
        .map((company) => deleteFromCloudinary(company.logoPublicId));

      // Execute all Cloudinary deletions (don't fail if some fail)
      if (cloudinaryDeletions.length > 0) {
        await Promise.allSettled(cloudinaryDeletions);
      }

      const result = await Company.deleteMany({ _id: ids });
      console.log(result);

      if (result.deletedCount > 0) {
        return { message: "Successfully Deleted", code: 200 };
      } else {
        return { message: "Failed to delete", code: 500 };
      }
    } catch (error) {
      console.log("error in Deleting bulk companies ", error);
      return { message: "Error in bulk delete", code: 500 };
    }
  }

  //update's a single company data (with Cloudinary cleanup for logo changes)
  static async updateCompany(id: string, data: CompanyUpdateInput) {
    try {
      console.log(id, data);
      await connectDB();

      // If updating logo, handle old logo deletion
      if (data.logo && data.logo !== "") {
        const existingCompany = await Company.findById(new Types.ObjectId(id));

        // Delete old logo from Cloudinary if it exists and is different
        if (
          existingCompany?.logoPublicId &&
          existingCompany.logo !== data.logo
        ) {
          try {
            await deleteFromCloudinary(existingCompany.logoPublicId);
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete old image from Cloudinary:",
              cloudinaryError
            );
          }
        }
      }

      const res = await Company.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: data }
      );

      if (res.modifiedCount > 0) {
        return { message: "Updated Successfully", code: 200 };
      } else {
        return { message: "Error in Updating Company", code: 500 };
      }
    } catch (error) {
      console.log("Error in company update Service", error);
      return { message: "Error in update service", code: 500 };
    }
  }

  //this can update data of many companies
  static async updateCompanies(data: CompanyUpdateInput[], ids: string[]) {
    try {
      await connectDB();

      const ops = data.map(({ _id, ...rest }) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(_id) },
          update: { $set: rest },
        },
      }));

      const companies = await Company.bulkWrite(ops);
      console.log(companies);
      if (companies.modifiedCount > 0) {
        return { message: "Successfully updated", code: 200 };
      } else {
        return { message: "Error in update", code: 500 };
      }
    } catch (error) {
      console.log("Error in Bulk update Service", error);
      return { message: "Error in Bulk update Service", code: 500 };
    }
  }

  //status update to approved
  static async approveCompaniesStatus(ids: string[]) {
    try {
      console.log(ids);
      await connectDB();
      const companies = await Company.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "approved" } }
      );
      console.log("Result:", companies);

      if (companies.matchedCount > 0) {
        return { message: "Successfully updated", code: 200 };
      } else {
        return { message: "Error in update", code: 500 };
      }
    } catch (error) {
      console.log("Error in approve status Service", error);
      return { message: "Error in approve status Service", code: 500 };
    }
  }

  //Status update to Reject of companies
  static async rejectCompaniesStatus(ids: string[]) {
    try {
      await connectDB();
      const companies = await Company.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "rejected" } }
      );

      if (companies.matchedCount > 0) {
        return { message: "Successfully updated", code: 200 };
      } else {
        return { message: "Error in update", code: 500 };
      }
    } catch (error) {
      console.log("Error in reject status Service", error);
      return { message: "Error in reject status Service", code: 500 };
    }
  }
}
