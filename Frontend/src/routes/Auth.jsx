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
    const role = String(currentUser.role || "").toLowerCase().trim();
    return (
      <Navigate
        replace
        to={role === "admin" ? "/admin" : role === "superuser" ? "/perfilsuperuser" : "/perfil"}
      />
    );
  }

  return <Component />;
}