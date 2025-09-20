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
  const canManageUsers = user?.role === 'Admin';
  const canManageTools = user?.role === 'Manager'; // Only managers can manage tools, not admins
  const canViewReports = ['Admin', 'Manager'].includes(user?.role || '');
  const canAccessTodoList = ['Admin', 'Manager'].includes(user?.role || ''); // Both admin and manager can access todo list

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
        {canManageTools && <Stack.Screen name="add-location" options={{ title: "Add Location" }} />}
        {canManageTools && <Stack.Screen name="assign-tool" options={{ title: "Assign Tool" }} />}
        {canAccessTodoList && <Stack.Screen name="todo-list" options={{ title: "Todo List" }} />}
      {canManageUsers && <Stack.Screen name="workers" options={{ title: "Workers" }} />}
      {canManageUsers && <Stack.Screen name="add-manager" options={{ title: "Add Manager" }} />}
      {canManageUsers && <Stack.Screen name="managers" options={{ title: "Managers" }} />}
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
