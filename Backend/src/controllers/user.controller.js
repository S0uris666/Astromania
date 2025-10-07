
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//

export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Check if user already exists
    let foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* const newCart= await Cart.create({}); */

    //create user
    const newUser = await User.create({
      username,
      email,
      role,
      password: hashedPassword,
      /* cart: newCart */
    });
    
    if (!newUser) {
      return res.status(400).json({ message: "Invalid user data" });
    }
    return res.status(201).json({ datos: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
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





