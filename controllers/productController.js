const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
    const product = new Product(req.body);
    const result = await product.save();
    res.send(result);
};

exports.getProducts = async (req, res) => {
    const userId = req.user._id; // Access user ID from token

    try {
        const products = await Product.find({ userId }); // Replace with actual logic
        res.send(products.length ? products : { result: "No products found" });
    } catch (error) {
        res.status(500).send({ error: "Server error while fetching products" });
    }
};

exports.deleteProduct = async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id });
    res.send(result);
};

exports.updateProduct = async (req, res) => {
    const result = await Product.updateOne({ _id: req.params.id }, { $set: req.body });
    res.send(result);
};

exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.send(product || { result: "Product not found" });
};

exports.searchProducts = async (req, res) => {
    const result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key, $options: "i" } },
            { company: { $regex: req.params.key, $options: "i" } },
            { category: { $regex: req.params.key, $options: "i" } }
        ]
    });
    res.send(result);
};
