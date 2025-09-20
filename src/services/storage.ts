// Local Storage and Caching Services
// This file will contain methods for local data persistence and caching

import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  // Generic storage methods
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  // TODO: Implement specific storage methods for:
  // - User session data
  // - Cached API responses
  // - Offline data synchronization
  // - App preferences and settings
}

export const storage = new StorageService();