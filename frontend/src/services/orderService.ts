import { api } from './api';

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  createOrder: async (data: { customer_name: string, amount: number, status: string }) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  getRandomCustomer: async () => {
    const response = await api.get('/orders/random-customer');
    return response.data;
  }
};
