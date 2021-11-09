import axios from "axios";

const instance = axios.create({
    baseURL: '/v1',
});

instance.CancelToken = axios.CancelToken;
export default instance;
