import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params) => {
    try {
      const response = await productsAPI.getAll(params);
      console.log('API Response:', response); // Debug uchun
      console.log('API Response data:', response.data); // Debug uchun
      return {
        products: response.data.products || [],
        total: response.data.pagination.total || 0,
        page: response.data.pagination.page || 1,
        pages: response.data.pagination.pages || 1
      };
    } catch (error) {
      console.error('API Error:', error); // Debug uchun
      throw error;
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id) => {
    try {
      const response = await productsAPI.getById(id);
      console.log('API Response:', response); // Debug uchun
      return response.data.product;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  selectedProduct: null,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error('Redux Error:', action.error); // Debug uchun
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
