import axiosInstance from '../axios';

export const marketingApi = {
  // ==============================
  // COMBOS
  // ==============================
  getCombos: async () => {
    const { data } = await axiosInstance.get('/marketing/combos');
    return data;
  },

  createCombo: async (comboData: any) => {
    const { data } = await axiosInstance.post('/marketing/combos', comboData);
    return data;
  },

  updateCombo: async (id: number, comboData: any) => {
    const { data } = await axiosInstance.put(`/marketing/combos/${id}`, comboData);
    return data;
  },

  deleteCombo: async (id: number) => {
    const { data } = await axiosInstance.delete(`/marketing/combos/${id}`);
    return data;
  },

  // ==============================
  // PROMOCIONES
  // ==============================
  getPromociones: async () => {
    const { data } = await axiosInstance.get('/marketing/promociones');
    return data;
  },

  createPromocion: async (promoData: any) => {
    const { data } = await axiosInstance.post('/marketing/promociones', promoData);
    return data;
  },

  updatePromocion: async (id: number, promoData: any) => {
    const { data } = await axiosInstance.put(`/marketing/promociones/${id}`, promoData);
    return data;
  },

  deletePromocion: async (id: number) => {
    const { data } = await axiosInstance.delete(`/marketing/promociones/${id}`);
    return data;
  },
};
