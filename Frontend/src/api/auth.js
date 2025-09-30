import axios from "axios";
const API = import.meta.env.VITE_BACKEND_URL;


export const registerRequest = (user) => axios.post(`${API}/register`,user)
export const loginRequest = (user) => axios.post(`${API}/login`,user)





//Productos y servicios

export const getServiceProducts= (products) => axios.get(`${API}/service-products/readall`,products)


//eventos

export const getEvents = (events) => axios.get(`${API}/events/readall`, events);