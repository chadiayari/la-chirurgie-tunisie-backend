const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateNewsletter = async (c, next) => {
  const body = await c.req.json().catch(() => ({}));
  const errors = [];

  if (!body.email || !EMAIL_REGEX.test(body.email)) {
    errors.push({ path: "email", msg: "Please provide a valid email address" });
  }
  if (body.name !== undefined && typeof body.name !== "string") {
    errors.push({ path: "name", msg: "Name must be a string" });
  }

  if (errors.length) {
    return c.json({ errors }, 400);
  }

  await next();
};
