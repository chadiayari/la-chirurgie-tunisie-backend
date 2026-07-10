import { Hono } from "hono";
import {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";
import { validateContact } from "../validators/contactValidators.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = new Hono();

// Public route - no authentication required
router.post("/", validateContact, addContact);

// Protected routes - authentication required
router.get("/", authenticate, getContacts);
router.patch("/:id", authenticate, updateContact);
router.delete("/:id", authenticate, deleteContact);

export default router;
