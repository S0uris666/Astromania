const UserReducer = (globalState, action) => {
  switch (action.type) {
    case "REGISTRO_EXITOSO":
      return {
        ...globalState,
        mensaje: "Usuario creado exitosamente",
      };

    case "LOGIN_EXITOSO":
      return {
        ...globalState,
        authState: true,
        currentUser: action.payload,
      };

    case "GET_USER_DATA":
      return {
        ...globalState,
        authState: true,
        currentUser: action.payload,
      };

    case "LOGOUT_EXITOSO":
      return {
        ...globalState,
        currentUser: null,
        authState: false,
        msg: action.payload,
        cart: [], // limpiamos carrito al salir
      };

    /* ------------ CARRITO ------------ */
    case "CART_HYDRATE":
      return {
        ...globalState,
        cart: action.payload || [],
      };

    case "CART_ADD": {
      const item = action.payload;
      const list = globalState.cart || [];
      const idx = list.findIndex((p) => p._id === item._id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = {
          ...copy[idx],
          quantity: copy[idx].quantity + (item.quantity || 1),
        };
        return { ...globalState, cart: copy };
      }
      return {
        ...globalState,
        cart: [...list, { ...item, quantity: item.quantity || 1 }],
      };
    }

    case "CART_REMOVE":
      return {
        ...globalState,
        cart: (globalState.cart || []).filter((p) => p._id !== action.payload),
      };

    case "CART_SET_QTY": {
      const { id, qty } = action.payload;
      const q = Math.max(1, Number(qty) || 1);
      return {
        ...globalState,
        cart: (globalState.cart || []).map((p) =>
          p._id === id ? { ...p, quantity: q } : p
        ),
      };
    }

    case "CART_CLEAR":
      return {
        ...globalState,
        cart: [],
      };

    default:
      return globalState;

    /* ------------ ADMIN USERS ------------ */
    case "ADMIN_USERS_SET":
      return {
        ...globalState,
        adminUsers: {
          list: action.payload.users || [],
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          pages: action.payload.pages || 1,
        },
      };

      case "ADMIN_USER_PROMOTED": {
  const updated = (globalState.adminUsers.list || []).map(u =>
    u._id === action.payload._id ? { ...u, role: "superuser" } : u
  );
  return {
    ...globalState,
    adminUsers: {
      ...globalState.adminUsers,
      list: updated,
    },
  };
}

      



  }
};




export default UserReducer;