import { Hono } from "hono";
import {
  subscribeNewsletter,
  getSubscribers,
  unsubscribe,
} from "../controllers/newsletterController.js";
import { validateNewsletter } from "../validators/newsletterValidator.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = new Hono();

// Public route - no authentication required
router.post("/", validateNewsletter, subscribeNewsletter);

// Protected routes - authentication required
router.get("/", authenticate, getSubscribers);
router.delete("/:id", authenticate, unsubscribe);

export default router;
