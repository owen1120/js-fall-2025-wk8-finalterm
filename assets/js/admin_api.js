import axios from "axios";

import { adminApiUrl, apiPath, token } from "./admin_config.js";

const adminApi = axios.create({
    baseURL: `${adminApiUrl}/${apiPath}`,
    headers: {
        'Authorization': token
    }
});

export const getOrders = () => adminApi.get(`/orders`);

export const updateOrderStatus = (order) => {
    const data ={
        data: {
            id: order.id,
            paid: order.paid
        }
    };
    return adminApi.put(`/orders`, data);
};

export const deleteOrderItem = (orderId) => {
    return adminApi.delete(`/orders/${orderId}`);
};

export const deleteAllOrders = () => {
    return adminApi.delete(`/orders`);
};