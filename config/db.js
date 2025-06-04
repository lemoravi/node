const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ravi:ravi@cluster0.ueclukp.mongodb.net/e-comm?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection failed:", err));
