const { check } = require("express-validator");

const validateContact = [
  check("name").notEmpty().withMessage("Name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  check("phone").notEmpty().withMessage("Phone number is required"),
  check("message").notEmpty().withMessage("Message is required"),
];

module.exports = validateContact;
