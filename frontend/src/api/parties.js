import client from './client';
export const getParties = () => client.get('/parties');
export const getActiveParties = () => client.get('/parties/active');
export const createParty = (data) => client.post('/parties', data);
export const updateParty = (id, data) => client.put(`/parties/${id}`, data);
export const deleteParty = (id) => client.delete(`/parties/${id}`);
