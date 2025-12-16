import apiClient from '../lib/apiClient';

class WarehouseInventoryService {
  async getInventoryByWarehouse(warehouseId: string) {
    try {
      const response = await apiClient.get(`/api/warehouses/inventory/${warehouseId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching warehouse inventory:", error);
      throw error?.response?.data || "Error occurred";
    }
  }
}

export default new WarehouseInventoryService();
