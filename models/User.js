const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    resetToken: String,
    tokenExpiry: Date
});

module.exports = mongoose.model("users", userSchema);
