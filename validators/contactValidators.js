const { check } = require("express-validator");

const validateContact = [
  check("name").notEmpty().withMessage("Name is required"),
  check("phone").notEmpty().withMessage("Phone number is required"),
  check("intervention").optional(),
  check("message").optional(),
];

module.exports = validateContact;
