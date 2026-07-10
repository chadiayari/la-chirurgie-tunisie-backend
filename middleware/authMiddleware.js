import jwt from "jsonwebtoken";

export const authenticate = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return c.json({ valid: false, message: "Token manquant" }, 401);
  }

  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET);

    const admin = await c.env.DB.prepare(
      "SELECT id, username, role FROM admins WHERE id = ?",
    )
      .bind(decoded.id)
      .first();

    if (!admin) {
      return c.json({ valid: false, message: "Utilisateur non trouvé" }, 401);
    }

    c.set("user", decoded);
    c.set("admin", admin);
    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ valid: false, message: "Token invalide" }, 401);
  }
};

// Alias for backward compatibility
export const protect = authenticate;
