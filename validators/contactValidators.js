export const validateContact = async (c, next) => {
  const body = await c.req.json().catch(() => ({}));
  const errors = [];

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push({ path: "name", msg: "Name is required" });
  }
  if (!body.phone || typeof body.phone !== "string" || !body.phone.trim()) {
    errors.push({ path: "phone", msg: "Phone number is required" });
  }

  if (errors.length) {
    return c.json(
      {
        success: false,
        message: "Tous les champs requis doivent être remplis",
        errors,
      },
      400,
    );
  }

  await next();
};
