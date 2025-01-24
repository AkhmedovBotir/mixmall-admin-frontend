import api from './axios';

const adminAPI = {
    // Adminlar ro'yxatini olish (faqat superadmin uchun)
    getAll: async (params = {}) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (admin.role !== 'superadmin') {
                throw { status: 403, message: 'Faqat superadmin uchun' };
            }

            const response = await api.get('/admins/list', { params });
            return response.data;
        } catch (error) {
            console.error('Admin API - getAll error:', error);
            
            // Backend xatoligi
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Adminlarni yuklashda xatolik'
                };
            }
            
            // Local xatolik
            throw {
                status: error.status || 500,
                message: error.message || 'Adminlarni yuklashda xatolik'
            };
        }
    },

    // Admin qo'shish (faqat superadmin uchun)
    create: async (adminData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (admin.role !== 'superadmin') {
                throw { status: 403, message: 'Faqat superadmin uchun' };
            }

            // Validatsiya
            if (!adminData.email || !adminData.password || !adminData.firstName || !adminData.lastName) {
                throw { status: 400, message: 'Barcha maydonlar to\'ldirilishi shart' };
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
                throw { status: 400, message: 'Email noto\'g\'ri formatda' };
            }

            if (adminData.password.length < 6) {
                throw { status: 400, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' };
            }

            // Ma'lumotlarni tozalash
            const data = {
                email: adminData.email.trim(),
                password: adminData.password.trim(),
                firstName: adminData.firstName.trim(),
                lastName: adminData.lastName.trim(),
                role: adminData.role || 'admin',
                permissions: adminData.permissions || []
            };

            const response = await api.post('/admins/register', data);
            return response.data;
        } catch (error) {
            console.error('Admin API - create error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Admin qo\'shishda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Admin qo\'shishda xatolik'
            };
        }
    },

    // Admin ma'lumotlarini yangilash (faqat superadmin uchun)
    update: async (id, adminData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (admin.role !== 'superadmin') {
                throw { status: 403, message: 'Faqat superadmin uchun' };
            }

            // Ma'lumotlarni tozalash
            const data = {};
            if (adminData.firstName) data.firstName = adminData.firstName.trim();
            if (adminData.lastName) data.lastName = adminData.lastName.trim();
            if (adminData.permissions) data.permissions = adminData.permissions;
            if (adminData.status) data.status = adminData.status;

            const response = await api.put(`/admins/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Admin API - update error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Admin ma\'lumotlarini yangilashda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Admin ma\'lumotlarini yangilashda xatolik'
            };
        }
    },

    // Admin o'chirish (faqat superadmin uchun)
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (admin.role !== 'superadmin') {
                throw { status: 403, message: 'Faqat superadmin uchun' };
            }

            const response = await api.delete(`/admins/${id}`);
            console.log('Delete API response:', response);
            
            return {
                success: true,
                message: response?.data?.message || 'Admin muvaffaqiyatli o\'chirildi'
            };
        } catch (error) {
            console.error('Admin API - delete error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Adminni o\'chirishda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Adminni o\'chirishda xatolik'
            };
        }
    }
};

export default adminAPI;
