require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Booking = require("./models/Booking");

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT MONGO ATLAS
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));


// ======================= SIGNUP =========================
app.post("/signup", async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        email,
        phone,
        password: hashedPass
    });

    await user.save();
    res.json({ message: "Signup successful", userId: user._id });
});


// ======================= LOGIN =========================
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    res.json({
        message: "Login success",
        userId: user._id
    });
});


// ======================= PROFILE =========================
app.get("/profile/:id", async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
        username: user.username,
        phone: user.phone,
        email: user.email
    });
});


// ======================= BOOKING =========================
app.post("/booking", async (req, res) => {
    const { userId, salonName, services, totalAmount, date, time } = req.body;

    const booking = new Booking({
        userId,
        salonName,
        services,
        totalAmount,
        date,
        time
    });

    await booking.save();
    res.json({ message: "Booking saved", bookingId: booking._id });
});


// ======================= RECEIPT =========================
app.get("/receipt/:id", async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const user = await User.findById(booking.userId);

    res.json({
        salonName: booking.salonName,
        customerName: user.username,
        phone: user.phone,
        date: booking.date,
        time: booking.time,
        amount: booking.totalAmount
    });
});


// PORT (REQUIRED FOR RENDER)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on:", PORT));
