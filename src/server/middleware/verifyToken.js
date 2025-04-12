const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Token " + token)

    if (!token) {
        return res.status(401).json({ error: 'No hay token. Inicia sesión' });
    }

    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                path: '/'
            });
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;