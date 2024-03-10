const express = require("express");
const mongorouter = express.Router();
const mongoose = require("mongoose");

// MongoDB User model
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
  })
);

mongorouter.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

mongorouter.post("/", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const newUser = new User({ name, email, age });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

mongorouter.put("/", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.set({ name, age });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
mongorouter.delete("/", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.deleteOne({ email });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// User.createIndex({ name: 1, age: 1 });

mongorouter.get("/age-group", async (req, res) => {
  try {
    const result = await User.aggregate([
      { $group: { _id: "$age", count: { $sum: 1 } } },
    ]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
mongorouter.get("/older30", async (req, res) => {
  try {
    const result = await User.find({ age: { $gt: 30 } }).sort({ name: 1 });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = mongorouter;
