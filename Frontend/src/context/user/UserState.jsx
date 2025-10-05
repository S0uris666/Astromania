import { useReducer } from "react";
import UserReducer from "./UserReducer";
import {UserContext} from './UserContext';
import { registerRequest, loginRequest, verifyRequest, updateRequest, logoutRequest } from "../../api/auth";

const UserState = (props) => {
    const initialState = {
        currentUser: {
            username: '',
            email: '',
            country: '',
            address: '',
            zipcode: 0
        },
        cart: [],
        authState: false
    };

    const [globalState, dispatch] = useReducer(UserReducer, initialState);

    const registerUser = async (form) => {
        try {
            const response = await registerRequest(form);
            console.log(response);

            dispatch({
                type: 'REGISTRO_EXITOSO',
                payload: response.data
            })

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const loginUser = async (form) => {
        try {
            const response = await loginRequest(form, {
                withCredentials: true
            })
            console.log(response);
            dispatch({
                type: 'LOGIN_EXITOSO'
            })
            return;
        } catch (error) {
            return error.response.data.message;
        }
    }

    const verifyUser = async () => {
        try {
            const response = await verifyRequest( {
                withCredentials: true
            })
            console.log(response);
            const userData = response.data.usuario;
            dispatch({
                type: 'GET_USER_DATA',
                payload: userData
            })
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const updateUser = async (form) => {
        await updateRequest(form, {
            withCredentials: true
        })
    };

    const logoutUser = async (navigate) => {
        try {
            await logoutRequest({ withCredentials: true })
            dispatch({
                type: 'LOGOUT_EXITOSO',
                payload: 'Sesion cerrada correctamente'
            })
            navigate('iniciar-sesion');
        } catch (error) {
            console.error('Error al cerrar la sesion', error);
        }
    }

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
                logoutUser
            }}
        >
            {props.children}
        </UserContext.Provider>
    )
}

export default UserState;