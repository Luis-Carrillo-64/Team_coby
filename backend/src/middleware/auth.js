const jwt = require('jsonwebtoken');

// Middleware para proteger rutas (requiere token válido)
exports.protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Si no hay token en el header, buscar en la cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log('protect: No token provided');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('protect: Token verificado para usuario:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('protect: Token inválido o expirado:', err.message);
    // Si el token es inválido o expirado, se manejará en el interceptor del frontend
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para restringir acceso por rol
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Acceso denegado - Permisos insuficientes' });
    }
    next();
  };
}; 