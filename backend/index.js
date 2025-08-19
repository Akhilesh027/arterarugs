const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const SECRET_KEY = "MY_SECRET_KEY"; // you can put in .env
const Product = require('./models/Product.js');
const User = require("./models/User");
const Cart = require('./models/Cart.js');
const Wishlist = require('./models/Wishlist.js');
const Order = require('./models/Order.js');
const Contact = require("./models/Contact.js");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require('multer');
const { storage } = require('./utils/cloudinaryConfig.js'); // adjust path
const app = express();


// No need for diskStorage or fileFilter
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); 
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const razorpay = new Razorpay({
  key_id: "rzp_live_R6u450nVIrAeZt",       // Razorpay Sample Test Key ID
  key_secret: "DcrMDwQJRrfo7hIF3zWUg5TY"        // Razorpay Sample Test Secret
});

app.post("/api/payment/orders", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,    // in paise
      currency: "INR",
      receipt: `receipt_${Math.floor(Math.random() * 10000)}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong in Razorpay Order Creation"
    });
  }
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({ name, phone, email, password: hashedPass });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Token
    const token = jwt.sign({ id: user._id }, SECRET_KEY);

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.delete('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Example protected route
app.get("/api/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});


app.post('/api/addproduct', upload.array('images', 10), async (req, res) => {
  try {
    console.log('req.files:', req.files); // <-- check here

    const images = req.files.map((file) => file.path);
 // Cloudinary URLs

    const product = new Product({
      ...req.body,
      images: images,
      price: Number(req.body.price),
      originalPrice: Number(req.body.originalPrice),
      stock: Number(req.body.stock),
      isCustomizable: req.body.isCustomizable === 'true',
      sizesAvailable: req.body.sizesAvailable
        ? JSON.parse(req.body.sizesAvailable)
        : [],
      colors: req.body.colors ? JSON.parse(req.body.colors) : [],
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
  console.error("Upload Error:", error);
  res.status(500).json({ message: error.message });
}

});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get('/api/Order', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updatedData, 
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// ---------- DELETE PRODUCT ---------- //
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, quantity, customization, customPrice } = req.body;
    const newItem = new Cart({ userId, productId, quantity, customization, customPrice });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  await Cart.findByIdAndUpdate(req.params.id, { quantity: req.body.quantity });
  res.json({ message: 'Quantity updated' });
});

// Get cart items
app.get('/api/cart/:userId', async (req, res) => {
    const cartItems = await Cart.find({ userId: req.params.userId });
    res.json(cartItems);
});

// Remove from cart
app.delete('/api/cart/:id', async (req, res) => {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Removed from cart' });
});

/* --------- WISHLIST ROUTES ----------- */

// Add to wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const item = new Wishlist({ userId, productId });
    await item.save();
    res.json({ message: 'Added to wishlist', item });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get('/api/wishlist/:userId', async (req, res) => {
  const items = await Wishlist.find({ userId: req.params.userId })
     .populate('productId', 'name price images');
  res.json(items); 
});


// Delete wishlist item
app.delete('/api/wishlist/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    await Wishlist.findOneAndDelete({ userId, productId });
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/orders/create', async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      shippingInfo,
      deliveryMethod,
      paymentInfo,
      subtotal,
      shipping,
      tax,
      total
    } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'User ID and cart items are required.' });
    }

    const newOrder = new Order({
      userId,
      cartItems,
      shippingInfo,
      deliveryMethod,
      paymentInfo,
      subtotal,
      shipping,
      tax,
      total
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET /api/orders/:userId
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('cartItems.productId'); // Populate product details

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('cartItems.productId', 'name price'); // add this
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, requirement, bestTime } = req.body;

    // Basic validation
    if (!name || !email || !phone || !requirement) {
      return res.status(400).json({ message: "Please fill all required fields!" });
    }

    // Save to database
    const newContact = await Contact.create({ name, email, phone, requirement, bestTime });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "arterarugs@gmail.com", // your admin email
        pass: "bdnh tlli gplh eovd"    // Gmail App password
      }
    });

    // Email content
    const mailOptions = {
      from: email,
      to: "arterarugs@gmail.com",
      subject: "New Contact Request",
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Requirement:</strong> ${requirement}</p>
        <p><strong>Best Time to Contact:</strong> ${bestTime || "Not specified"}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Contact submitted successfully!" });
  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

// GET /api/admin/dashboard => returns overall stats
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments();
    
    // Sum of all order amounts
    const orders = await Order.find({});
    const totalSales = orders.reduce((sum, ord) => sum + ord.total, 0);

    // You can calculate popular design or other metrics as you like

    res.status(200).json({
      totalSales,
      totalOrders,
      totalCustomers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET /api/admin/recent-orders => returns last 5 orders
app.get('/api/admin/recent-orders', async (req, res) => {
  try {
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(recentOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
