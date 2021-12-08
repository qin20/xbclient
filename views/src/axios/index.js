import axios from 'axios';
import { dispatch } from '../store';

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

    if (data.code === -2 && response.request.responseURL.indexOf('logout') < 0) {
        dispatch({ type: 'SHOW_LOGIN_MODEL' });
        return Promise.reject(new Error(data.message));
    }

    return data;
}, function (error) {
    return Promise.reject(error);
});

instance.CancelToken = axios.CancelToken;
export default instance;
