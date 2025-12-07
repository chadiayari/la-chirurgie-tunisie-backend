const jwt = require("jsonwebtoken");
const Admin = require("../Models/admins.Model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      valid: false,
      message: "Token manquant",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    // Optionally verify admin still exists
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({
        valid: false,
        message: "Utilisateur non trouvé",
      });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      valid: false,
      message: "Token invalide",
    });
  }
};

// Alias for backward compatibility
const protect = authenticate;

module.exports = { authenticate, protect };
