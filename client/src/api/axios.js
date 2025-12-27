import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Server Port
});

export default api;
