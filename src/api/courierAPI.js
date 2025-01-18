import api from './axios';

// Courier API functions
const courierAPI = {
    // Barcha kuryerlarni olish
    getAll: async (search = '') => {
        try {
            const response = await api.get('/couriers', {
                params: { search }
            });
            return response.data;
        } catch (error) {
            console.error('Courier API - getAll error:', error);
            throw error;
        }
    },

    // Kuryer yaratish
    register: async (courierData) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);

            // Ruxsatlarni tekshirish
            if (!(admin.permissions?.includes('manage_couriers') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Courier management rights required' };
            }

            // Ma'lumotlarni validatsiya qilish
            const { firstName, lastName, phoneNumber, password, vehicle, vehicleNumber } = courierData;

            if (!firstName?.trim() || firstName.length < 2 || firstName.length > 50) {
                throw { status: 400, message: 'Ism 2-50 ta belgidan iborat bo\'lishi kerak' };
            }
            if (!lastName?.trim() || lastName.length < 2 || lastName.length > 50) {
                throw { status: 400, message: 'Familiya 2-50 ta belgidan iborat bo\'lishi kerak' };
            }
            if (!phoneNumber?.trim() || !/^\+998\d{9}$/.test(phoneNumber)) {
                throw { status: 400, message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' };
            }
            if (!password || password.length < 4 || password.length > 20) {
                throw { status: 400, message: 'Parol 4-20 ta belgidan iborat bo\'lishi kerak' };
            }
            if (!vehicle?.trim()) {
                throw { status: 400, message: 'Transport turi kiritilishi shart' };
            }
            if (!vehicleNumber?.trim()) {
                throw { status: 400, message: 'Transport raqami kiritilishi shart' };
            }

            const response = await api.post('/couriers/register', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                password,
                vehicle: vehicle.trim(),
                vehicleNumber: vehicleNumber.trim()
            });

            // 201 status - muvaffaqiyatli
            return {
                success: true,
                message: response.data?.message || 'Kuryer muvaffaqiyatli qo\'shildi'
            };

        } catch (error) {
            console.error('Courier API - register error:', error);
            
            // Backend xatoligi
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kuryer qo\'shishda xatolik'
                };
            }
            
            // Local xatolik
            throw {
                status: error.status || 500,
                message: error.message || 'Kuryer qo\'shishda xatolik'
            };
        }
    },

    // Kuryer ma'lumotlarini olish
    getById: async (id) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);

            // Ruxsatlarni tekshirish
            if (!(admin.permissions?.includes('manage_couriers') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Courier management rights required' };
            }

            const response = await api.get(`/couriers/${id}`);
            console.log('Get courier response:', response);
            return response.data;
        } catch (error) {
            console.error('Courier API - getById error:', error);
            
            // Backend xatoligi
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kuryer ma\'lumotlarini olishda xatolik'
                };
            }
            
            // Local xatolik
            throw {
                status: error.status || 500,
                message: error.message || 'Kuryer ma\'lumotlarini olishda xatolik'
            };
        }
    },

    // Kuryer ma'lumotlarini yangilash
    update: async (id, courierData) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_couriers') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kuryer boshqarish huquqi yo\'q' };
            }

            // Ma'lumotlarni tozalash
            const data = {};
            if (courierData.firstName) data.firstName = courierData.firstName.trim();
            if (courierData.lastName) data.lastName = courierData.lastName.trim();
            if (courierData.phoneNumber) data.phoneNumber = courierData.phoneNumber.trim();
            if (courierData.vehicle) data.vehicle = courierData.vehicle.trim();
            if (courierData.vehicleNumber) data.vehicleNumber = courierData.vehicleNumber.trim();
            if (courierData.status) {
                // Status validatsiyasi
                if (!['active', 'inactive', 'busy', 'offline'].includes(courierData.status)) {
                    throw { status: 400, message: 'Noto\'g\'ri status' };
                }
                data.status = courierData.status;
            }

            const response = await api.put(`/couriers/${id}`, data);
            console.log('Update courier response:', response.data);

            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            console.error('Courier API - update error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kuryer ma\'lumotlarini yangilashda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Kuryer ma\'lumotlarini yangilashda xatolik'
            };
        }
    },

    // Kuryer statusini o'zgartirish (faqat admin uchun)
    updateStatus: async (id, status) => {
        try {
            // Token va admin tekshirish
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_couriers') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kuryer boshqarish huquqi yo\'q' };
            }

            // Status validatsiyasi
            if (!['active', 'inactive', 'busy', 'offline'].includes(status)) {
                throw { status: 400, message: 'Noto\'g\'ri status' };
            }

            const response = await api.patch(`/couriers/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Courier API - updateStatus error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kuryer statusini yangilashda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Kuryer statusini yangilashda xatolik'
            };
        }
    },

    // Kuryerni o'chirish
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const adminStr = localStorage.getItem('admin');

            if (!token || !adminStr) {
                throw { status: 401, message: 'Authentication required' };
            }

            const admin = JSON.parse(adminStr);
            if (!(admin.permissions?.includes('manage_couriers') || admin.role === 'superadmin')) {
                throw { status: 403, message: 'Kuryer boshqarish huquqi yo\'q' };
            }

            const response = await api.delete(`/couriers/${id}`);
            console.log('Delete courier response:', response);

            return {
                success: response?.data?.success || false,
                message: response?.data?.message || "Kuryer muvaffaqiyatli o'chirildi",
                data: null
            };
        } catch (error) {
            console.error('Courier API - delete error:', error);
            
            if (error.response?.data) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Kuryerni o\'chirishda xatolik'
                };
            }
            
            throw {
                status: error.status || 500,
                message: error.message || 'Kuryerni o\'chirishda xatolik'
            };
        }
    }
};

export default courierAPI;
