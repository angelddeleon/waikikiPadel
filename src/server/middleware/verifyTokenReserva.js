const jwt = require('jsonwebtoken');

const verifyTokenReserva = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json({
            success: false,
            data: [],
            message: 'No se encontró token de autenticación'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secreto', (err, decoded) => {
        if (err) {
            return res.status(200).json({
                success: false,
                data: [],
                message: 'Token inválido o expirado'
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyTokenReserva;