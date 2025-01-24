import api from './axios';

const categoryAPI = {
    // Barcha kategoriyalarni olish
    getAll: async () => {
        try {
            const response = await api.get('/categories');
            return response.data.data; // response.data.data qaytarish
        } catch (error) {
            console.error('Category API - getAll error:', error);
            throw error.response?.data || error;
        }
    },

    // Kategoriyani ID bo'yicha olish
    getById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Category API - getById error:', error);
            throw error.response?.data || error;
        }
    },

    // Yangi kategoriya qo'shish
    create: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.post('/categories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.data;
        } catch (error) {
            console.error('Category API - create error:', error);
            throw error.response?.data || error;
        }
    },

    // Kategoriyani yangilash
    update: async (id, data) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.put(`/categories/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Category API - update error:', error);
            throw error.response?.data || error;
        }
    },

    // Kategoriyani o'chirish
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.delete(`/categories/${id}`);
            
            if (response.status === 200) {
                return response.data;
            } else {
                throw response.data;
            }
        } catch (error) {
            console.error('Category API - delete error:', error);
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kategoriyani o\'chirishda xatolik'
                };
            }
            throw error;
        }
    },

    // Subkategoriya qo'shish
    addSubcategory: async (categoryId, subcategoryData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.post(`/categories/${categoryId}/subcategories`, subcategoryData);
            return response.data.data;
        } catch (error) {
            console.error('Category API - addSubcategory error:', error);
            throw error.response?.data || error;
        }
    },

    // Subkategoriyani yangilash
    updateSubcategory: async (categoryId, subcategoryId, subcategoryData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.put(`/categories/${categoryId}/subcategories/${subcategoryId}`, subcategoryData);
            return response.data.data;
        } catch (error) {
            console.error('Category API - updateSubcategory error:', error);
            throw error.response?.data || error;
        }
    },

    // Subkategoriyani o'chirish
    deleteSubcategory: async (categoryId, subcategoryId) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_categories') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kategoriya boshqarish huquqi yo\'q' };
            }

            const response = await api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            console.error('Category API - deleteSubcategory error:', error);
            throw error.response?.data || error;
        }
    }
};

export default categoryAPI;
