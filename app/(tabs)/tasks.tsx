import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <Text style={styles.text}>Tasks Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#0f172a',
  },
});