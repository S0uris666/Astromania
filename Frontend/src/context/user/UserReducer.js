const UserReducer = (globalState, action) => {
    switch (action.type) {
        case "REGISTRO_EXITOSO":
            return {
                ...globalState,
                mensaje: "Usuario creado exitosamente"
            }

        case "LOGIN_EXITOSO":
            return {
                ...globalState,
                authState: true
            }
        
        case "GET_USER_DATA":
            return {
                ...globalState,
                authState: true,
                currentUser: action.payload
            }
            
        case "LOGOUT_EXITOSO":
            return {
                ...globalState,
                currentUser: null,
                authState: false,
                msg: action.payload
            }    

        default:
            return globalState
    }
}

export default UserReducer;