import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { User } from '@/src/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendOTP: (phone: string) => Promise<boolean>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      // Simulate OTP sending
      console.log('Sending OTP to:', phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  };

  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Simulate OTP verification and role assignment
      if (otp.length === 6) {
        // Demo: Assign roles based on phone number prefix
        // 9900* -> Admin, 9911* -> Manager, others -> Worker
        const rolePrefix = phone.slice(-2);
        let role: 'admin' | 'manager' | 'worker' = 'worker';
        let name = 'Worker';

        if (rolePrefix === '00') {
          role = 'admin';
          name = 'Admin';
        } else if (rolePrefix === '11') {
          role = 'manager';
          name = 'Manager';
        }

        const newUser: User = {
          id: `${role.toLowerCase()}-${Date.now()}`,
          phone,
          name,
          role,
          email: `${role.toLowerCase()}@wall2wall.com`,
          createdAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    sendOTP
  } as AuthState;
});