const User = require('../models/User');
const Jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const jwtKey = 'e-comm';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'jada.abshire52@ethereal.email',
        pass: 'RPHX9f5ZNTEs3Wpnyw'
    }
});

exports.register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).send({ error: "Email already registered" });
        }

        let user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;

        Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) return res.send({ result: "Something went wrong" });
            res.send({ result, auth: token });
        });
    } catch (err) {
        res.status(500).send({ error: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    if (req.body.email && req.body.password) {
        const user = await User.findOne(req.body).select('-password');
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) return res.send({ result: "Something went wrong" });
                res.send({ user, auth: token });
            });
        } else {
            res.send({ result: "No user found" });
        }
    } else {
        res.send({ result: "No user found" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `https://react-50bm.onrender.com/reset-password/${token}`;

    await transporter.sendMail({
        from: '"Support" <support@example.com>',
        to: user.email,
        subject: "Password Reset",
        html: `
            <p>You requested for password reset</p>
            <p>Click this <a href="${resetLink}">link</a> to reset your password</p>
            <p>If you didn’t request this, you can ignore this email.</p>
        `
    });

    res.send({ message: "Password reset link sent to your email" });
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });

    if (!user) return res.status(400).send({ message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.send({ message: "Password has been reset successfully" });
};
