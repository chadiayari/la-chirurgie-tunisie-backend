const Newsletter = require("../Models/newsletter.Model");
const { validationResult } = require("express-validator");

const subscribeNewsletter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name } = req.body;

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email is already subscribed" });
    }

    const newSubscriber = new Newsletter({ email, name });
    await newSubscriber.save();

    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Error subscribing to newsletter" });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find(); // Ensure this returns an array
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error retrieving subscribers:", error);
    res.status(500).json({ message: "Error retrieving subscribers" });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubscriber = await Newsletter.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Error unsubscribing" });
  }
};

module.exports = { subscribeNewsletter, getSubscribers, unsubscribe };