import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request interface so TypeScript knows it's safe to attach user data to req.user
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authorize = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Grab the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // 3. Extract the raw token string
    const token = authHeader.split(" ")[1];

    // 4. Verify the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");

    // 5. Attach the decoded user payload to the request object so subsequent routes can use it
    req.user = decoded;

    // 6. Pass execution to the next function/route handler
    next();
  } catch (error) {
    // If jwt.verify throws an error (expired token, tampered token, etc.)
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
