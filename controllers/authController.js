const jwt = require("jsonwebtoken");
const Admin = require("../Models/admins.Model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }

    // Check password using bcrypt compare method
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      username: admin.username,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

const verifyToken = async (req, res) => {
  // req.user is set by authenticate middleware
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    },
  });
};

module.exports = {
  loginAdmin,
  verifyToken,
};
