import { useState } from "react";
import { UserContext } from "./UserContext";
import { registerRequest, loginRequest } from "../../api/auth";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signUp = async (formData) => {
    try {
      const res = await registerRequest(formData);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      
      console.error("Error en signUp:", error);
      throw error;
    }
  };

  const login = async (formData) => {
    try{
      const res = await loginRequest(formData);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error){
      console.error("Error en login:", error);
      throw error;
    }

  }

  return (
    <UserContext.Provider value={{ signUp, user, isAuthenticated,login }}>
      {children}
    </UserContext.Provider>
  );
};
