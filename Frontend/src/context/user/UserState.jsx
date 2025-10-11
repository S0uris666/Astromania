import { useReducer, useEffect } from "react";
import UserReducer from "./UserReducer";
import { UserContext } from "./UserContext";
import {getHttpErrorMessage} from "../../utils/httpError.js";

import {
  registerRequest,
  loginRequest,
  verifyRequest,
  updateRequest,
  logoutRequest,
  apiGetAllUsersAdmin,
  apiPromoteToSuperuser,
} from "../../api/auth";

const STORAGE_KEY = "astromania_cart";

const UserState = (props) => {
  const initialState = {
    currentUser: {
      username: "",
      email: "",
      country: "",
      address: "",
      zipcode: 0,
    },
    cart: [],
    authState: false,
    adminUsers: {
    list: [],
    total: 0,
    page: 1,
    pages: 1,
  },
  };

  const [globalState, dispatch] = useReducer(UserReducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: "CART_HYDRATE", payload: parsed });
        }
      }
    } catch {
      /* empty */
    }
  }, []);

  // -------- persistir carrito
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState.cart || []));
    } catch {
      /* empty */
    }
  }, [globalState.cart]);

  // -------- acciones

  const registerUser = async (form) => {
    try {
      const response = await registerRequest(form);
      

      dispatch({
        type: "REGISTRO_EXITOSO",
        payload: response.data,
      });

      return response.data;
    } catch (error) {
  const msg = getHttpErrorMessage(error, "Error al registrarse, intenta de nuevo", {
    fieldLabels: { password: "Contraseña", email: "Correo", username: "Nombre de usuario" },
    maxIssues: 2, // si quieres mostrar hasta 2 mensajes
  });
  throw new Error(msg);
}}

  const loginUser = async (form) => {
    try {
      await loginRequest(form);
      const verifyRes = await verifyRequest();
      const user = verifyRes.data.user;
      if (!user) throw new Error("No se pudo obtener el usuario tras el login");
      dispatch({ type: "LOGIN_EXITOSO", payload: user });
      return user;
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      throw error;
    }
  };

  const verifyUser = async () => {
    try {
      const response = await verifyRequest();
      console.log(response);
      const userData = response.data.user;
      dispatch({
        type: "GET_USER_DATA",
        payload: userData,
      });
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const updateUser = async (form) => {
    await updateRequest(form, {
      withCredentials: true,
    });
  };

  const logoutUser = async (navigate) => {
    try {
      await logoutRequest();
      dispatch({
        type: "LOGOUT_EXITOSO",
        payload: "Sesion cerrada correctamente",
      });
      navigate("iniciar-sesion");
    } catch (error) {
      console.error("Error al cerrar la sesion", error);
    }
  };

  // ================== CART ==================
  const addToCart = (product) => {
    const safe = {
      _id: product._id || product.id || crypto.randomUUID(),
      title: String(product.title),
      price: Number(product.price) || 0,
      description:
        product.description || product.shortDescription || product.title,
      image: product.images?.[0] || product.image || null,
      quantity: Number(product.quantity) || 1,
      type: product.type || "product",
      stock: typeof product.stock === "number" ? product.stock : undefined,
    };
    dispatch({ type: "CART_ADD", payload: safe });
  };

  const removeFromCart = (id) => dispatch({ type: "CART_REMOVE", payload: id });

  const setQty = (id, qty) =>
    dispatch({ type: "CART_SET_QTY", payload: { id, qty } });

  const clearCart = () => dispatch({ type: "CART_CLEAR" });


  // ================== ADMIN USERS ==================
  const getAllUsersAdmin = async (params = {}) => {
  const res = await apiGetAllUsersAdmin(params);
  // res esperado: { data, page, limit, total, pages }
  dispatch({ type: "ADMIN_USERS_SET", payload: res.data || res });
  return res.data || res;
};

const promoteUserToSuperuser = async (id) => {
  const res = await apiPromoteToSuperuser(id);
  // si tu backend devuelve { user: {...} }, dispara la acción local
  const updatedUser = res.user || res.data?.user || null;
  if (updatedUser) {
    dispatch({ type: "ADMIN_USER_PROMOTED", payload: updatedUser });
  }
  return res;
};

  return (
    <UserContext.Provider
      value={{
        currentUser: globalState.currentUser,
        cart: globalState.cart,
        authState: globalState.authState,
        registerUser,
        loginUser,
        verifyUser,
        updateUser,
        logoutUser,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        // Admin Users
        adminUsers: globalState.adminUsers,
        getAllUsersAdmin,
        promoteUserToSuperuser,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
