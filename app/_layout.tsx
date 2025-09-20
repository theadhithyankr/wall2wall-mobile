import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ActivityIndicator, View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  // Role-based permissions according to the permission matrix
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  // User Management - Admin only
  const canManageUsers = isAdmin;
  const canAddWorkers = isAdmin;
  const canViewWorkers = isAdmin || isManager;
  const canManageManagers = isAdmin;
  
  // Tool Management - Manager only for CRUD, others view only
  const canManageTools = isManager;
  const canViewTools = true; // All roles can view
  const canAssignTools = isManager;
  
  // Location Management - Manager only for CRUD, others view only
  const canManageLocations = isManager;
  const canViewLocations = true; // All roles can view
  
  // Reports & Analytics
  const canViewReports = isAdmin || isManager;
  const canViewAllAttendance = isAdmin || isManager;
  const canExportData = isAdmin || isManager;
  
  // Todo List Management
  const canAccessTodoList = isAdmin || isManager || isWorker;
  const canManageTodoList = isManager; // Only manager can CRUD
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
      {canManageTools && <Stack.Screen name="add-tool" options={{ title: "Add Tool" }} />}
        {canManageLocations && <Stack.Screen name="add-location" options={{ title: "Add Location" }} />}
        {canAssignTools && <Stack.Screen name="assign-tool" options={{ title: "Assign Tool" }} />}
        {canAccessTodoList && <Stack.Screen name="todo-list" options={{ title: "Todo List" }} />}
        {canAddWorkers && <Stack.Screen name="add-worker" options={{ title: "Add Worker" }} />}
        {canViewWorkers && <Stack.Screen name="workers" options={{ title: "Workers" }} />}
        {canManageManagers && <Stack.Screen name="add-manager" options={{ title: "Add Manager" }} />}
        {canManageManagers && <Stack.Screen name="managers" options={{ title: "Managers" }} />}
      <Stack.Screen name="location-detail/[id]" options={{ title: "Location Details" }} />
      <Stack.Screen name="tool-detail/[id]" options={{ title: "Tool Details" }} />
      {canViewReports && <Stack.Screen name="attendance-report" options={{ title: "Attendance Report" }} />}
      {canViewReports && <Stack.Screen name="tool-report" options={{ title: "Tool Report" }} />}
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
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
