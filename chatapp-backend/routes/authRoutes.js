const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authmiddleware");
const User = require("../models/user");
const { check } = require("express-validator");
router.post(
  "/signup",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  signup
);
router.post("/login", login);
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        lastSignedIn: user.lastSignedIn,
      },
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("name email _id"); 
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;


