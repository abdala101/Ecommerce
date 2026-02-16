const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;


async function createAdmin() {
  const exists = await Admin.findOne({ email: "admin@test.com" });
  if (exists) return;

  const hashed = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "admin@test.com",
    password: hashed,
  });

  console.log("Admin created");
}

createAdmin();


// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin)
    return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid)
    return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id },
    SECRET_KEY,          // ✅ use environment variable
    { expiresIn: "1d" }
  );

  res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, SECRET_KEY);   // ✅ use environment variable
    next();
  } catch {
    res.sendStatus(403);
  }
}



// Connect to MongoDB
// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// --- Product Routes using DB ---

// Get all products
app.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// Get all products
app.post("/products", auth, async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const product = new Product({
      name,
      price,
      stock: stock || 0
    });

    await product.save();
    res.json(product);
  } catch {
    res.status(500).json({ error: "Failed to add product" });
  }
});


// Update a product
app.put("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete a product
app.delete("/products/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});



app.get("/analytics", auth, async (req, res) => {
  const products = await Product.find();
  const orders = await Order.find();

  const revenue = orders.reduce(
    (sum, o) => sum + o.total,
    0
  );

  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    revenue,
  });
});


// GET /orders
app.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }); // 🔥 newest first

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});



app.post("/orders", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ error: "Product not found" });

    if (product.stock < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    // ✅ Reduce stock
    product.stock -= quantity;
    await product.save();

    const total = product.price * quantity;

    const order = new Order({
      product: productId,
      productName: product.name,
      productPrice: product.price,
      quantity,
      total,
    });

    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});





app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
