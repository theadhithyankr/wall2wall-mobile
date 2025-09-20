import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="otp" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-tool" options={{ title: "Add Tool" }} />
          <Stack.Screen name="add-location" options={{ title: "Add Location" }} />
          <Stack.Screen name="add-worker" options={{ title: "Add Worker" }} />
          <Stack.Screen name="assign-tool" options={{ title: "Assign Tool" }} />
          <Stack.Screen name="workers" options={{ title: "Workers" }} />
          <Stack.Screen name="location-detail/[id]" options={{ title: "Location Details" }} />
          <Stack.Screen name="tool-detail/[id]" options={{ title: "Tool Details" }} />
          <Stack.Screen name="attendance-report" options={{ title: "Attendance Report" }} />
          <Stack.Screen name="tool-report" options={{ title: "Tool Report" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </>
      )}
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
