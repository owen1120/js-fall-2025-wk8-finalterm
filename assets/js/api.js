import axios from 'axios';
import { apiUrl, apiPath } from './config.js';

const customerApi = axios.create({
  baseURL: `${apiUrl}/customer/${apiPath}`,
});

export const getProducts = () => customerApi.get('/products');

export const getCart = () => customerApi.get('/carts');

export const addToCart = (productId, qty = 1) => {
    const data = {
        data: {
            productId: productId,
            quantity: qty,
        },
    };
    return customerApi.post('/carts', data);
}

export const deleteCartItem = (cardId) => {
    return customerApi.delete(`/carts/${cardId}`);
}

export const deleteAllCartItems = () => {
    return customerApi.delete('/carts');
}

export const postOrder = (orderData) => {
    const data = {
        data: orderData,
    };
    return customerApi.post('/orders', data);
}