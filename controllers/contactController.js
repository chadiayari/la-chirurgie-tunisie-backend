import { sendEmailNotification } from "../utils/emailService.js";

export const addContact = async (c) => {
  try {
    const { name, phone, email, intervention, message } = await c.req.json();

    const result = await c.env.DB.prepare(
      `INSERT INTO contacts (name, phone, intervention, email, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
    )
      .bind(name, phone, intervention ?? null, email, message ?? null)
      .run();

    const contact = await c.env.DB.prepare(
      "SELECT * FROM contacts WHERE id = ?",
    )
      .bind(result.meta.last_row_id)
      .first();

    try {
      await sendEmailNotification(
        { name, phone, email, intervention, message },
        c.env,
      );
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return c.json(
      {
        success: true,
        message: "Contact créé avec succès",
        data: contact,
      },
      201,
    );
  } catch (error) {
    console.error("Error saving contact form data:", error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
};

export const getContacts = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    ).all();
    return c.json(results);
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    return c.text("Error retrieving contacts", 500);
  }
};

export const updateContact = async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    if (!["new", "read", "replied"].includes(status)) {
      return c.json({ success: false, message: "Statut invalide" }, 400);
    }

    const existing = await c.env.DB.prepare(
      "SELECT id FROM contacts WHERE id = ?",
    )
      .bind(id)
      .first();

    if (!existing) {
      return c.json({ success: false, message: "Contact non trouvé" }, 404);
    }

    await c.env.DB.prepare(
      "UPDATE contacts SET status = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(status, id)
      .run();

    const contact = await c.env.DB.prepare(
      "SELECT * FROM contacts WHERE id = ?",
    )
      .bind(id)
      .first();

    return c.json({
      success: true,
      message: "Contact mis à jour",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
};

export const deleteContact = async (c) => {
  try {
    const id = c.req.param("id");

    if (!/^\d+$/.test(id)) {
      return c.json({ message: "Invalid contact ID format" }, 400);
    }

    const existing = await c.env.DB.prepare(
      "SELECT id FROM contacts WHERE id = ?",
    )
      .bind(id)
      .first();

    if (!existing) {
      return c.json({ message: "Contact not found" }, 404);
    }

    await c.env.DB.prepare("DELETE FROM contacts WHERE id = ?")
      .bind(id)
      .run();

    return c.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return c.json({ message: "Error deleting contact" }, 500);
  }
};
