import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { DataProvider } from "@/src/contexts/DataContext";
import { ActivityIndicator, View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  // Role-based permissions according to the permission matrix
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isWorker = user?.role === 'worker';
  
  // User Management - Admin only
  const canManageUsers = isAdmin;
  const canAddWorkers = isAdmin;
  const canViewWorkers = isAdmin || isManager;
  const canManageManagers = isAdmin;
  
  // Tool Management - Manager and Admin can CRUD, others view only
  const canManageTools = isManager || isAdmin;
  const canViewTools = true; // All roles can view
  const canAssignTools = isManager || isAdmin;

  // Location Management - Manager and Admin can CRUD, others view only
  const canManageLocations = isManager || isAdmin;
  const canViewLocations = true; // All roles can view
  
  // Reports & Analytics
  const canViewReports = isAdmin || isManager;
  const canViewAllAttendance = isAdmin || isManager;
  const canExportData = isAdmin || isManager;
  
  // Todo List Management
  const canAccessTodoList = isAdmin || isManager || isWorker;
  const canManageTodoList = isManager || isAdmin; // Manager and Admin can CRUD
  const canOversightTodoList = isAdmin; // Admin can view for oversight
  
  // Settings
  const canAccessSettings = true; // All roles
  const canManageSystemConfig = isAdmin;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-tool" options={{ headerShown: false }} />
      <Stack.Screen name="add-location" options={{ headerShown: false }} />
      <Stack.Screen name="assign-tool" options={{ headerShown: false }} />
      <Stack.Screen name="todo-list" options={{ headerShown: false }} />
      <Stack.Screen name="add-worker" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="workers" options={{ headerShown: false }} />
      <Stack.Screen name="add-manager" options={{ headerShown: false }} />
      <Stack.Screen name="managers" options={{ headerShown: false }} />
      <Stack.Screen name="location-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tool-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="attendance-report" options={{ headerShown: false }} />
      <Stack.Screen name="tool-report" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <DataProvider>
            <RootLayoutNav />
          </DataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
