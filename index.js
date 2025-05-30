const express = require('express');
const app = express();
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');
const cors = require('cors');
const Jwt = require('jsonwebtoken');
const jwtKey ='e-comm'; 
app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).send({ error: "Email already registered" });
        }
    
        let data = new User(req.body);
        let result = await data.save();
        result = result.toObject();
        delete result.password;
        Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
                res.send({ result: "something went wrong,please try again later"});
            }
            res.send({result,auth:token});
        })
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) {
        const user = await User.findOne(req.body).select('-password');
        if (user) {
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
               if(err){
                    res.send({ result: "something went wrong,please try again later"});
               }
                res.send({user,auth:token});
            })
        } else {
            res.send({ result: "No user found" });
        }
    } else {
        res.send({ result: "No user found" });
    }
});

app.post('/add-product',verifyToken,async (req,res)=>{
    let data = new Product(req.body);
    let result = await data.save();
    res.send(result);
})
// app.get('/products', verifyToken, async (req, res) => {
//     try {
//         const products = await Product.find();
//         if (products.length > 0) {
//             res.send(products);
//         } else {
//             res.send({ result: "No product found" });
//         }
//     } catch (err) {
//         console.error("Fetch products error:", err);
//         res.status(500).send({ error: "Internal server error" });
//     }
// });

app.get('/products', verifyToken,async (req, res) => {
    try {
        const userId = req.headers['authorisation']; // or 'authorization' if you prefer
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const products = await Product.find({ userId });
        if (products.length > 0) {
            res.send(products);
        } else {
            res.send({ result: "No products found" });
        }
    } catch (err) {
        res.status(500).send({ error: "Server error", details: err.message });
    }
});

app.delete('/product/:id',verifyToken, async (req, res) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        res.send(result);
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});
// PUT API to update a product by ID
app.put('/product/:id', verifyToken,async (req, res) => {
    try {
        const result = await Product.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.send(result);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.send(product);
        } else {
            res.status(404).send({ result: 'Product not found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Server error', details: error.message });
    }
});
// Search products by name (or partial match)
app.get('/search/:key',verifyToken, async (req, res) => {
    try {
        const result = await Product.find({
            "$or": [
                { name: { $regex: req.params.key, $options: "i" } },
                { company: { $regex: req.params.key, $options: "i" } },
                { category: { $regex: req.params.key, $options: "i" } }
            ]
        });
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: "Server error", details: error.message });
    }
});
//middleware
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1]; 
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please provide valid token" });
            } else {
                next();
            }
        });
    } else {
        res.status(403).send({ result: "Please add token in the header" });
    }
}



app.listen(5002);
