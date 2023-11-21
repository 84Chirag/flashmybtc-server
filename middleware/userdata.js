require('dotenv').config(); // (dotenv) pakage use for secrecy
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.NODE_EXPRESS_PASS_SECRET_KEY;

const userdata = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error: "please authenticate valid token"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "please authenticate valid token"})
    }
}

module.exports = userdata;