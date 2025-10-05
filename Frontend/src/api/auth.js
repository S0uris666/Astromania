import { config } from "@fullcalendar/core/internal";
import axios from "axios";
const API = import.meta.env.VITE_BACKEND_URL;

//Usuarios
export const registerRequest = (user) => axios.post(`${API}/register`,user,config)
export const loginRequest = (user) => axios.post(`${API}/login`,user,config)
export const verifyRequest = () => axios.get(`${API}/verify-user`,config)
export const updateRequest = (user) => axios.put(`${API}/update`,user,config)
export const logoutRequest = () => axios.post(`${API}/logout`,config)

//Productos y servicios

export const getServiceProducts= (products) => axios.get(`${API}/service-products/readall`,products)

//eventos

export const getEvents = (events) => axios.get(`${API}/events/readall`, events);