
import argon2 from "argon2";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import addKeywords from "ajv-keywords";
import type { JSONSchema7 } from "json-schema";
import { userModel, type User } from "../models/user.model.mts";
import { UserSchema } from "../database/json-schema.ts";
import { generateToken } from "./utils.mts";

// Custom error for validation failures
class EntityNotFoundError extends Error {
  statusCode: number;
  constructor(statusObj: { message: string; statusCode: number }) {
    super(statusObj.message);
    this.statusCode = statusObj.statusCode;
  }
}

export function validator(schema: JSONSchema7, data: Object) {
  // @ts-ignore
  const ajv = new Ajv();
  // @ts-ignore
  addFormats(ajv);
  // @ts-ignore
  addKeywords(ajv, "instanceof");

  const validate = ajv.compile(schema);
  if (!validate(data)) {
    if (validate.errors) {
      const message = validate.errors
        .map((error: any) => error.instancePath + " " + error.message)
        .join(", ");
      throw new EntityNotFoundError({ message: message, statusCode: 400 });
    }
  }
}

export const userService = {
  async login(email: string, password: string) {
    // Check if user exists
    const user = await userModel.getUserByEmail(email);
    
    // 🔍 DEBUG LOG 1: See exactly what MongoDB returned
    console.log("=== LOGIN DEBUG ===");
    console.log("Searching for email:", email);
    console.log("Database user found:", user);

    if (!user || !user.password) {
      console.log("❌ User not found or has no password set.");
      return { user: null, token: null };
    }

    // Verify the hashed password using argon2
    const isPasswordValid = await argon2.verify(user.password, password);
    
    // 🔍 DEBUG LOG 2: See if Argon2 thinks the passwords match
    console.log("Is password valid?:", isPasswordValid);
    console.log("===================");

    if (!isPasswordValid) {
      return { user: null, token: null };
    }

    // Generate a valid token
    const token = generateToken(user);
    return { user, token };
  },

  async register(email: string, name: string, password: string) {
    // Check if email is already taken
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash the password securely
    const hashedPassword = await argon2.hash(password);

    const newUser: User = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    // Run AJV validation against the UserSchema
    validator(UserSchema, newUser);

    // Persist to database via model
    await userModel.createUser(newUser);
    return { message: "Registration successful" };
  }
};
