import axios from "axios";
const API = import.meta.env.VITE_BACKEND_URL;
import client from "./client.js";

//Usuarios
export const registerRequest = (user) => axios.post(`${API}/register`,user)
export const loginRequest = (user) => client.post("/login",user,{})
export const verifyRequest = () => client.get("/verify-user",{})
export const updateRequest = (user) => client.put("/update",user,{})
export const logoutRequest = () => client.post("/logout",{})

//Productos y servicios
export const getServiceProducts= (products) => axios.get(`${API}/service-products/readall`,products)
export const updateServiceProduct= (id, changes) => client.put(`/user/service-product/update/${id}`, changes);
export const deleteServiceProduct= (id) => client.delete(`/user/service-product/delete/${id}`);
export const createServiceProduct= (formData) =>
  client.post("/user/service-product/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

//eventos
export const getEvents = (events) => axios.get(`${API}/events/readall`, events);
export const createEvent= (event) => client.post(`/user/event/create`, event);
export const updateEvent= (id, changes) => client.put(`/user/event/update/${id}`, changes);
export const deleteEvent= (id) => client.delete(`/user/event/delete/${id}`);

//eventos privados
export const getPrivateEvent = () => client.get(`/user/events/readall`);
export const getPrivateEventById = (id) => client.get(`/user/event/read/${id}`);

//Admin 
export const createServiceProductRequest = (formData) =>
  client.post("/user/service-product/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });


export const apiGetAllUsersAdmin = (params={}) => client.get("/admin/users", { params });
export const apiPromoteToSuperuser = (id) => client.post(`/admin/user/promote/${id}`,{ role: "superuser" });