const Contact = require("../Models/contact.Model");
const { validationResult } = require("express-validator");

const addcontact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const data = req.body;

    const contact = new Contact({
      name: data.name,
      phone: data.phone,
      intervention: data.intervention,
      message: data.message,
    });
    await contact.save();

    res.status(200).json({ success: true, message: "Contact form data saved successfully" });
  } catch (error) {
    console.error("Error saving contact form data:", error);
    res.status(500).json({ success: false, message: "Error saving contact form data" });
  }
};

module.exports = { addcontact };
