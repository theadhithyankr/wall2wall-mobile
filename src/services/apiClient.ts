// API Client for Wall2Wall Application
// This file will contain HTTP client configuration and API endpoints

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // TODO: Implement API methods for:
  // - Authentication (login, logout, refresh token)
  // - Workers management
  // - Tools management
  // - Locations management
  // - Attendance tracking
  // - Reports generation
}

export const apiClient = new ApiClient();