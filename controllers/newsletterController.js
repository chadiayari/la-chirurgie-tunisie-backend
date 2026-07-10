export const subscribeNewsletter = async (c) => {
  try {
    const { email, name } = await c.req.json();

    const existing = await c.env.DB.prepare(
      "SELECT id FROM newsletter_subscribers WHERE email = ?",
    )
      .bind(email)
      .first();

    if (existing) {
      return c.json({ message: "Email is already subscribed" }, 400);
    }

    await c.env.DB.prepare(
      "INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)",
    )
      .bind(email, name ?? null)
      .run();

    return c.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return c.json({ message: "Error subscribing to newsletter" }, 500);
  }
};

export const getSubscribers = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC",
    ).all();
    return c.json(results);
  } catch (error) {
    console.error("Error retrieving subscribers:", error);
    return c.json({ message: "Error retrieving subscribers" }, 500);
  }
};

export const unsubscribe = async (c) => {
  try {
    const id = c.req.param("id");

    const existing = await c.env.DB.prepare(
      "SELECT id FROM newsletter_subscribers WHERE id = ?",
    )
      .bind(id)
      .first();

    if (!existing) {
      return c.json({ message: "Subscriber not found" }, 404);
    }

    await c.env.DB.prepare("DELETE FROM newsletter_subscribers WHERE id = ?")
      .bind(id)
      .run();

    return c.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return c.json({ message: "Error unsubscribing" }, 500);
  }
};
