const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: String,
    salonName: String,
    services: Array,
    totalAmount: Number,
    date: String,
    time: String
});

module.exports = mongoose.model("Booking", bookingSchema);
