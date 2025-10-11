
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
//

export const createUser = async (req, res) => {
  try {
    const { username = "", email = "", password = "" } = req.body;

    // Validaciones simples
    if (!username.trim() || !email.trim() || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    if (password.length < 6) {
      return res.status(422).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Usuario existente
    const foundUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (foundUser) {
      return res.status(409).json({ error: "El usuario ya existe con ese correo" });
    }

    // Hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      role: "user", // <- no aceptamos rol del cliente por seguridad
      password: hashedPassword,
    });

    
    const safe = newUser.toObject();
    delete safe.password;
    delete safe.__v;

    return res.status(201).json({ user: safe });
  } catch (err) {
    console.error("Error creating user:", err);

    
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    return res.status(500).json({ error: "Error del servidor" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    let foundUser = await User.findOne({ email }); //le pregunto directo a la base de datos que usuario tiene ese email
    if (!foundUser) {
      return res.status(400).json({ message: "No se encontro el usuario" });
    }
    //compare passwords
    const correctPassword = await bcrypt.compare(password, foundUser.password);
    if (!correctPassword) {
      return res
        .status(400)
        .json({ message: "email o contraseña no corresponde" });
    }

    const payload = {
      id: foundUser._id,
       role: foundUser.role
    };
    //sign token
    jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.cookie("token",token)
      res.json({ message: "Login exitoso", token  });
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.json({ message: "Logout successful" });

}

export const updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Construir objeto con los campos a actualizar
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // Actualizar el usuario logueado
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: "-password" } // excluir password en la respuesta
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyUser = async (req, res) => {
    
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    
  }
}


export const adminGetAllUsers = async (req, res) => {
  try {
    // Seguridad adicional por si la ruta no tiene el middleware
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const q = (req.query.q || "").trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password -__v") // no exponer campos sensibles
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.json({
      data: users,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("adminGetAllUsers error:", err);
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
};



export const adminPromoteUserToSuperuser = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Solo se acepta role=superuser explícitamente
    const { role } = req.body || {};
    if ((role || "").toLowerCase() !== "superuser") {
      return res.status(400).json({
        error: "Solo se permite actualizar el rol a 'superuser'",
      });
    }

    // Evitar que el admin se cambie a sí mismo (opcional pero recomendable)
    if (String(req.user.id) === String(id)) {
      return res
        .status(409)
        .json({ error: "No puedes modificar tu propio rol" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Regla de negocio: solo de 'user' => 'superuser'
    if ((user.role || "").toLowerCase() !== "user") {
      return res.status(409).json({
        error:
          "Solo puedes promover cuentas con rol 'user' al rol 'superuser'",
      });
    }

    user.role = "superuser";
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.__v;

    return res.json({
      message: "Rol actualizado a 'superuser'",
      user: safeUser,
    });
  } catch (err) {
    console.error("adminPromoteUserToSuperuser error:", err);
    return res.status(500).json({ error: "Error al actualizar el rol" });
  }
};
