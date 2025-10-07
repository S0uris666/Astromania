import { useContext, useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import {UserContext} from "../context/user/UserContext";

export default function PrivateRoute({ component: Component }) {
  const userCtx = useContext(UserContext);

  const { authState, verifyUser } = userCtx;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      await verifyUser();
      setLoading(false);
    };

    verifyToken();
  }, [authState]);

  if (loading) return null;

  return (
    <>
      {authState ? <Component /> : <Navigate replace to="/login" />}
    </>
  );
}
