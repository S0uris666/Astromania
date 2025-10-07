// routes/AdminRoute.jsx
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/user/UserContext";

export default function AdminRoute({ component: Component }) {
  const { authState, currentUser, verifyUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { await verifyUser(); setLoading(false); })();
  }, [authState]);

  if (loading) return null;

  if (!authState) return <Navigate replace to="/login" />;
  if (currentUser?.role !== "admin") return <Navigate replace to="/perfil" />;

  return <Component />;
}
