import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/user/UserContext";

export default function AuthRoute({ component: Component }) {
  const { authState, currentUser, verifyUser } = useContext(UserContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try { await verifyUser(); } finally { setChecking(false); }
    })();
  }, []);

  if (checking) return null; 

  if (authState && currentUser) {
    const role = (currentUser.role || "").toLowerCase();
    return <Navigate replace to={role === "admin" ? "/admin" : "/perfil"} />;
  }

  return <Component />;
}