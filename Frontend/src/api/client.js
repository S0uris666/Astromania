import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

const client = axios.create({
  baseURL: API,
  withCredentials: true, 
});

export default client;