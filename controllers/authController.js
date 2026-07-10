import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const loginAdmin = async (c) => {
  try {
    const { username, password } = await c.req.json();

    const admin = await c.env.DB.prepare(
      "SELECT * FROM admins WHERE username = ?",
    )
      .bind(username)
      .first();

    if (!admin) {
      return c.json(
        { success: false, message: "Identifiants incorrects" },
        401,
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return c.json(
        { success: false, message: "Identifiants incorrects" },
        401,
      );
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      c.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return c.json({
      success: true,
      message: "Connexion réussie",
      token,
      username: admin.username,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
};

export const verifyToken = async (c) => {
  const user = c.get("user");
  return c.json({
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
};
