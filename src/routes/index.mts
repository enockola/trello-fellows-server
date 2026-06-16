import { Router } from "express";
import productRoutes from "./product.routes.mts";
import swaggerRoutes from "./swagger.routes.mts";
import userRoutes from "./user.routes.mts"; // 1. Import user routes

const router: Router = Router();

// Home page
router.get("/", (req, res) => {
  res.json({ title: "API V1" });
});

// Product routes
router.use("/products", productRoutes);

// User routes
router.use("/users", userRoutes);

router.use(swaggerRoutes);
export default router;
