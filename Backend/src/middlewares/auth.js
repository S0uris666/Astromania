//middleware entre la peticion  y la ruta
import jwt from "jsonwebtoken";
//middleware de autenticacion
export default function auth(req, res, next) { 
const {token} = req.cookies;
if (!token) return res.status(401).json({ message: "Acceso no autorizado" });

try {
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token no valido" });
        req.user = user;
        next();
    });

} catch (error) {
    return res.status(401).json({ message: "Acceso no autorizado" });
}

}
