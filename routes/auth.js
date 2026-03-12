const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, isAdmin: Boolean(user.isAdmin) },
    process.env.JWT_SECRET,
    {
    expiresIn: "7d"
    }
  );

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.createUser({ name, email, passwordHash });
  const token = createToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ user: null });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: payload });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

module.exports = router;
