import connectDB from "@/lib/mongoose";
import User from "@/models/Users";
import { error } from "console";

import bcrypt from "bcryptjs";
import { signJwtToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { AppError } from "@/utils/error";

interface UserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type:
      | "VALIDATION_ERROR"
      | "BUSINESS_ERROR"
      | "SYSTEM_ERROR"
      | "NOT_FOUND"
      | "UNAUTHORIZED"
      | "CONFLICT";
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
}

export class AuthService {
  static async createUser({ name, email, password, role = "user" }: UserData) {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { message: "Invalid User Data", code: 400 };
    }
    try {
      await connectDB();
      console.log(email, password, name, role);
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        console.log(existingUser);
        return { message: "User already exist", code: 409 };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return { message: "User successfully created", code: 200 };
    } catch (error) {
      console.log("Error in authService(createUser):", error);
      return { message: "Error in  service", code: 500 };
    }
  }

  static async login({ email, password }: LoginData) {
    try {
      if (!email.trim() || !password.trim()) {
        throw AppError.invalidCredentials();
      }

      console.log(email);
      await connectDB();
      const user = await User.findOne({ email: email.trim() });

      console.log("User Found:", user);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw AppError.invalidCredentials();
      }

      const token = signJwtToken({ id: user.id, email: email });
      console.log(token);

      return token;
    } catch (error) {
      console.log("Error in Login Service", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("SERVER ERROR", "Error in login api", 500, error);
    }
  }

  static async verifyUser(email: string) {
    try {
      await connectDB();
      const userExist = User.findOne({ email });
      return userExist;
    } catch (error) {
      console.log("Error in auth Service(verifyUser): ", error);
      return new AppError(
        "SERVER ERROR",
        "Error in finding user from db",
        500,
        error
      );
    }
  }
}
