export const authRol = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acceso denegado: rol no autorizado" });
        }
        next();
    }
}
