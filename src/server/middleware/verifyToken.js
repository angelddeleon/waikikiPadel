const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'No hay token. Inicia sesión' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secreto', (err, decoded) => {
        if (err) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                domain: process.env.NODE_ENV === 'production' ? '.waikikipadel.com' : undefined,
                path: '/'
            });
            return res.status(401).json({ 
                success: false,
                error: 'Token inválido o expirado' 
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;