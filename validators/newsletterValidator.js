const { body } = require("express-validator");

const newsletterValidationRules = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address"),
    body("name")
        .optional()
        .isString()
        .withMessage("Name must be a string"),
];

module.exports = newsletterValidationRules;