const Contact = require("../Models/contact.Model");
const { validationResult } = require("express-validator");

const addcontact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const data = req.body;

    const contact = new Contact({
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });
    await contact.save();

    res.status(200).send("Contact form data saved successfully");
  } catch (error) {
    console.error("Error saving contact form data:", error);
    res.status(500).send("Error saving contact form data");
  }
};

module.exports = { addcontact };
