const jwt = require('jsonwebtoken');

const verifyTokenReserva = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json([]);
    }

    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(200).json([]);
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyTokenReserva;