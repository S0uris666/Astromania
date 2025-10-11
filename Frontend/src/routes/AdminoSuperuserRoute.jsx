import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/user/UserContext";

export function AdminoSuperuserRoute({ component: Component }) {
  const { authState, currentUser, verifyUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await verifyUser();
      setLoading(false);
    })();
  }, []); // no dependas de authState

  if (loading) return null;

  if (!authState) return <Navigate replace to="/login" />;

  const role = String(currentUser?.role || "").toLowerCase().trim();
  const allowed = role === "superuser" || role === "admin";
  if (!allowed) return <Navigate replace to="/perfil" />;

  return Component ? <Component /> : null;
}