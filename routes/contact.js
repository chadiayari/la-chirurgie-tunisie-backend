const express = require("express");
const router = express.Router();
const { addcontact } = require("../controllers/add_contact.js");
const { contactget } = require("../controllers/get_contact.js");
const { deleteContact } = require("../controllers/deleteContact.js");
const { updateContact } = require("../controllers/update_contact.js");
const validateContact = require("../validators/contactValidators.js");
const { authenticate } = require("../middleware/authMiddleware.js");

// Public route - no authentication required
router.post("/", validateContact, addcontact);

// Protected routes - authentication required
router.get("/", authenticate, contactget);
router.patch("/:id", authenticate, updateContact);
router.delete("/:id", authenticate, deleteContact);

module.exports = router;