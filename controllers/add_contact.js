const Contact = require("../Models/contact.Model");
const { validationResult } = require("express-validator");

const addcontact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: "Tous les champs requis doivent être remplis",
      errors: errors.array() 
    });
  }

  try {
    const { name, phone, intervention, message } = req.body;

    const contact = new Contact({
      name,
      phone,
      intervention,
      message,
      status: "new",
    });
    
    await contact.save();

    res.status(201).json({ 
      success: true, 
      message: "Contact créé avec succès",
      data: contact 
    });
  } catch (error) {
    console.error("Error saving contact form data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

module.exports = { addcontact };
