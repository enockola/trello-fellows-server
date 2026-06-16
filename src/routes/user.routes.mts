import { Router, type Request, type Response, type NextFunction } from "express";
import { userService } from "../services/user.service.mts";
import { sanitize } from "../services/utils.mts";
import { authorize, type AuthenticatedRequest } from "../middleware/auth.middleware.mts";

const router: Router = Router();

// Authenticate a user and return a JWT token
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize the body
    const sanitizedBody = sanitize(req.body);
    const { email, password } = sanitizedBody;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Call service to check database credentials and generate token
    const { user, token } = await userService.login(email, password);

    // If either is null, credentials failed or user doesn't exist
    if (!user || !token) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Send back token and non-sensitive user profile info
    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register a new user
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sanitizedBody = sanitize(req.body);
    const { email, name, password } = sanitizedBody;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Email, name, and password are required" });
    }

    const result = await userService.register(email, name, password);
    return res.status(201).json(result);
  } catch (error: any) {
    // If validation or duplicate email checking fails, catch it here
    return res.status(error.statusCode || 400).json({ message: error.message });
  }
});

// A secure route to demo the authorize function
router.get("/protected", authorize, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ 
    message: "Welcome.",
    authenticatedUser: req.user
  });
});

export default router;
