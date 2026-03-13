require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const Product = require("../models/Product");
const User = require("../models/User");


const sampleProducts = [
  {
    name: "Lumen Wireless Earbuds",
    description: "Noise-isolating earbuds with 24-hour battery life and fast charging case.",
    price: 89.99,
    category: "Audio",
    images: [
      "https://images.unsplash.com/photo-1518441984420-1aace3c5ab0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 42
  },
  {
    name: "Drift City Backpack",
    description: "Weatherproof 22L backpack with padded laptop sleeve and quick-access pockets.",
    price: 74.5,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 30
  },
  {
    name: "Kora Ceramic Mug Set",
    description: "Set of 4 hand-glazed ceramic mugs with matte finish.",
    price: 48,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1509401935681-96f4285e0b31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 100
  },
  {
    name: "Summit Fitness Watch",
    description: "Track workouts, sleep, and heart rate with 7-day battery life.",
    price: 129.0,
    category: "Wearables",
    images: [
      "https://images.unsplash.com/photo-1516571748831-5d81767b788d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 18
  },
  {
    name: "Nova Desk Lamp",
    description: "Dimmable LED lamp with USB-C power and soft ambient glow.",
    price: 39.99,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 55
  },
  {
    name: "Trailblazer Water Bottle",
    description: "Insulated stainless bottle keeps drinks cold for 24 hours.",
    price: 28.5,
    category: "Outdoor",
    images: [
      "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 75
  }
];

const run = async () => {
  await connectDb();
  await Product.replaceAll(sampleProducts);
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const existing = await User.findByEmail(process.env.ADMIN_EMAIL);
    if (!existing) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await User.createUser({
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        passwordHash,
        isAdmin: true
      });
      console.log("Admin user created:", process.env.ADMIN_EMAIL);
    }
  }
  console.log("Seeded products:", sampleProducts.length);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
