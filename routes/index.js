const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const product = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');

// Auth
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password/:token', auth.resetPassword);

// Product
router.post('/add-product', verifyToken, product.addProduct);
router.get('/products', verifyToken, product.getProducts);
router.delete('/product/:id', verifyToken, product.deleteProduct);
router.put('/product/:id', verifyToken, product.updateProduct);
router.get('/product/:id', verifyToken, product.getProductById);
router.get('/search/:key', verifyToken, product.searchProducts);

module.exports = router;
