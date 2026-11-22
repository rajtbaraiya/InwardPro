import client from './client';
export const getEntries = (params) => client.get('/entries', { params });
export const createEntry = (data) => client.post('/entries', data);
export const updateEntry = (id, data) => client.put(`/entries/${id}`, data);
export const deleteEntry = (id) => client.delete(`/entries/${id}`);
export const getEntry = (id) => client.get(`/entries/${id}`);
