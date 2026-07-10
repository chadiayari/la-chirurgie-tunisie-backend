import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./middleware/authRoutes.js";
import contactRouter from "./routes/contact.js";
import newsletterRouter from "./routes/newsletter.js";

const app = new Hono();

app.use("*", cors());

app.use("*", async (c, next) => {
  console.log(`${new Date().toISOString()} ${c.req.method} ${c.req.path}`);
  await next();
});

app.get("/", (c) =>
  c.json({ message: "Welcome to the La Chirurgie Tunisie Backend API" }),
);

app.route("/api/contact", contactRouter);
app.route("/api/contacts", contactRouter);
app.route("/api/newsletter", newsletterRouter);
app.route("/api/auth", authRouter);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error",
    },
    500,
  );
});

export default app;
