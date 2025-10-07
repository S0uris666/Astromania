import axios from "axios";
const API = import.meta.env.VITE_BACKEND_URL;
import client from "./client.js";

//Usuarios
export const registerRequest = (user) => axios.post("/register",user)
export const loginRequest = (user) => client.post("/login",user,{})
export const verifyRequest = () => client.get("/verify-user",{})
export const updateRequest = (user) => client.put("/update",user,{})
export const logoutRequest = () => client.post("/logout",{})

//Productos y servicios
export const getServiceProducts= (products) => axios.get(`${API}/service-products/readall`,products)

//eventos
export const getEvents = (events) => axios.get(`${API}/events/readall`, events);
export const createEvent= (event) => client.post(`/user/event/create`, event);

//Admin 
export const createServiceProductRequest = (formData) =>
  client.post("/user/service-product/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });