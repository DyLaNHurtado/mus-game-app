import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Cambia esto según el entorno de tu backend
  timeout: 1000,
});

export default instance;
