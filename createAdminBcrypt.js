const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./Models/admins.Model");

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Delete existing admin to recreate with bcrypt
    await Admin.deleteOne({ username: "admin" });
    console.log("🗑️  Removed old admin (if existed)");

    // Create new admin - password will be hashed by the pre-save hook
    const admin = new Admin({
      username: "admin",
      password: "admin123", // Will be hashed automatically
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created successfully with bcrypt!");
    console.log("\n🎉 LOGIN CREDENTIALS:");
    console.log("=====================================");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("=====================================");
    console.log("\n⚠️  Password is now securely hashed with bcrypt");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
