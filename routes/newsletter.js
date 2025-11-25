const express = require("express");
const router = express.Router();
const {
  subscribeNewsletter,
  getSubscribers,
  unsubscribe,
} = require("../controllers/newsletter_controller");

router.post("/", subscribeNewsletter);

router.get("/", getSubscribers);

router.delete("/:id", unsubscribe);

module.exports = router;
