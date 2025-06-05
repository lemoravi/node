const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

function verifyToken(req, res, next) {
    let token = req.headers['authorization'];

    if (token) {
        token = token.split(' ')[1]; // Remove 'Bearer' from token string

        Jwt.verify(token, jwtKey, (err, decoded) => {
            if (err) {
                return res.status(401).send({ result: "Please provide a valid token" });
            } else {
                req.user = decoded.user; // Attach user info to request object
                next();
            }
        });
    } else {
        res.status(403).send({ result: "Please add token in the header" });
    }
}

module.exports = verifyToken;
