import User from "../models/User.model.js";
import bcrypt from "bcryptjs";


export const register = async(req, res) => {
    const {email, password, username,role}= req.body

    try{
        let foundUser = await User.findOne({email});
        if(foundUser) {return res.status(400).json({message: "El usuario ya existe"});}
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
    
    }
    
    


export const login = (req, res) => res.send("Login exitoso");
