import { Hono } from "hono";
import { loginAdmin, verifyToken } from "../controllers/authController.js";
import { authenticate } from "./authMiddleware.js";

const router = new Hono();

router.post("/login", loginAdmin);
router.get("/verify", authenticate, verifyToken);

export default router;
