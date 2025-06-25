import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
// Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true ,unique:true},
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  password: { type: String, required: true },
});

const User = models.User || model("User", UserSchema);

export default User;
