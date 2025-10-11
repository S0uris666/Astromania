import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/user/UserContext";

export function SuperUserRoute({ component: Component }) {
  const { authState, currentUser, verifyUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { 
      await verifyUser(); 
      setLoading(false); 
    })();
  }, []); 

  if (loading) return null;

  if (!authState) return <Navigate replace to="/login" />;

  const role = String(currentUser?.role || "").toLowerCase().trim();
  if (role !== "superuser") {
    // si es admin, mejor mándalo a /admin; si es user normal, a /perfil
    return <Navigate replace to={role === "admin" ? "/admin" : "/perfil"} />;
  }

  return Component ? <Component /> : null;
}