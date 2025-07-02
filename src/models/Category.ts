import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
// Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
 
});

const User = models.User || model("User", UserSchema);

export default User;
