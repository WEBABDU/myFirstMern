const { Router } = require("express");
const bcrypt = require("bcryptjs");
const config = require("../config/default.json");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

// api/auth/register
router.post(
  "/register",
  [
    check("email", "incorecct email").isEmail(),
    check(
      "password",
      "minimum characters in password has been 6 symbols"
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {

      // console.log("Body:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect data",
        });
      }
      const { email, password } = req.body;

      const condidate = await User.findOne({ email });

      if (condidate) {
        return res
          .status(400)
          .json({ message: "User with this email already exist" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({ massage: "user created" });
    } catch (error) {
      res.status(500).json({ message: "Some error try again" });
    }
  }
);

// api/auth/login
router.post(
  "/login",
  [
    check("email", "print correct email").normalizeEmail().isEmail(),
    check("password", "print password").exists(),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect data",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ massage: "user not defined" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(500).json({ message: "Invalid password try again" });
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: "1h",
      });
     
      res.json({ token, userId: user.id });
    } catch (error) {
      res.status(500).json({ message: "Some error try again" });
    }
  }
);

module.exports = router;
