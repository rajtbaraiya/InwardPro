import client from './client';
export const getMaterials = () => client.get('/materials');
export const getActiveMaterials = () => client.get('/materials/active');
export const createMaterial = (data) => client.post('/materials', data);
export const updateMaterial = (id, data) => client.put(`/materials/${id}`, data);
export const deleteMaterial = (id) => client.delete(`/materials/${id}`);
