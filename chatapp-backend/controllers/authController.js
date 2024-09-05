const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "User already exists" });
    }
    if (await User.findOne({ name }))
      return res.status(400).json({ msg: "Username already taken" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            lastSignedIn: user.lastSignedIn,
          },
        });
      }
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { credential, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: credential }, { name: credential }],
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    user.lastSignedIn = new Date();
    user.online = true;
    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            lastSignedIn: user.lastSignedIn,
            online: user.online,
          },
        });
      }
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
};
exports.signout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log(user);
    if (user) {
      user.online = false;
      await user.save();
      socket.emit("statusUpdate", { userId: user.id, online: false });
    }
    res.json({ msg: "User signed out successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
