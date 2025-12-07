const express = require("express");
const router = express.Router();
const { loginAdmin, verifyToken } = require("../controllers/authController");
const { authenticate } = require("./authMiddleware");

router.post("/login", loginAdmin);

router.get("/verify", authenticate, verifyToken);

module.exports = router;
