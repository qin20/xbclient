import axios from "axios";

const baseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:32222'
    : 'https://xb.server.com';

const instance = axios.create({
    baseURL,
});

instance.interceptors.response.use(function (response) {
    const { data } = response;
    if (data.code === -1) {
        return Promise.reject(new Error(data.message));
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

instance.CancelToken = axios.CancelToken;
export default instance;
