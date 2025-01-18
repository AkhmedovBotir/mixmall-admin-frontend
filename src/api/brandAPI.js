import api from './axios';

// Brand API functions
const brandAPI = {
    // Barcha brandlarni olish
    getAll: async (search = '') => {
        try {
            const response = await api.get('/brands', {
                params: { search }
            });
            return response.data;
        } catch (error) {
            console.error('Brand API - getAll error:', error);
            throw error;
        }
    },

    // Brand yaratish
    create: async (name) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            console.log('Admin data:', admin);

            // Ruxsatlarni tekshirish
            if (!(admin.permissions?.includes('manage_brands') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Brand management rights required' };
            }

            const response = await api.post('/brands', { name });
            return response.data;
        } catch (error) {
            console.error('Brand API - create error:', error);
            throw {
                status: error.status || error.response?.status || 500,
                message: error.message || error.response?.data?.message || 'Brand yaratishda xatolik'
            };
        }
    },

    // Brand yangilash
    update: async (id, name) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            console.log('Admin data:', admin);

            // Ruxsatlarni tekshirish
            if (!(admin.permissions?.includes('manage_brands') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Brand management rights required' };
            }

            const response = await api.put(`/brands/${id}`, { name });
            console.log('Update response:', response);

            // Backend tomonidan {status: 'success', data: {...}} formatida javob qaytadi
            if (response.status === 'success' && response.data) {
                return response.data;
            } else if (response.data?.status === 'success' && response.data?.data) {
                return response.data.data;
            }
            
            throw {
                status: response.status || 500,
                message: response.data?.message || 'Brand yangilashda xatolik'
            };
        } catch (error) {
            console.error('Brand API - update error:', error);
            throw {
                status: error.status || error.response?.status || 500,
                message: error.message || error.response?.data?.message || 'Brand yangilashda xatolik'
            };
        }
    },

    // Brand o'chirish
    delete: async (id) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            console.log('Admin data:', admin);

            // Ruxsatlarni tekshirish
            if (!(admin.permissions?.includes('manage_brands') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Brand management rights required' };
            }

            const response = await api.delete(`/brands/${id}`);
            console.log('Delete response:', response);

            // Backend tomonidan {status: 'success', message: '...'} formatida javob qaytadi
            if (response.status === 'success' || response.data?.status === 'success') {
                return true;
            }
            
            throw {
                status: response.status || 500,
                message: response.data?.message || 'Brand o\'chirishda xatolik'
            };
        } catch (error) {
            console.error('Brand API - delete error:', error);
            throw {
                status: error.status || error.response?.status || 500,
                message: error.message || error.response?.data?.message || 'Brand o\'chirishda xatolik'
            };
        }
    }
};

export default brandAPI;
