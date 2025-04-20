import axios from "axios";

export const axiosApi = axios.create({
    baseURL: "https://api.cloudinary.com/v1_1/dckwbkqjv/image/upload",
    timeout: 10000, // 10 second timeout
    maxContentLength: 20 * 1024 * 1024, // Max 20MB upload
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

axiosApi.interceptors.request.use(
    (req) => {
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosApi.interceptors.response.use(
    (res) => {
        return res;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out - please try again');
        }
        if (!error.response) {
            throw new Error('Network error - please check your connection');
        }
        throw error;
    }
);