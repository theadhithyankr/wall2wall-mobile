import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { MapPin, Phone, Wrench, Users, Edit, ArrowLeft } from 'lucide-react-native';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locations, tools, attendance } = useData();
  
  const location = locations.find(l => l.id === id);
  
  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Location Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const assignedTools = tools.filter(tool => tool.currentWorkLocationId === id);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => 
    record.workLocationId === id && 
    record.dateTime.split('T')[0] === today &&
    record.action === 'Clock In'
  );
  const activeWorkers = new Set(todayAttendance.map(record => record.workerId)).size;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: location.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => {}}>
              <Edit size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.locationIcon}>
            <MapPin size={32} color="#2563eb" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}, {location.city}</Text>
          </View>
        </View>

        {location.contactPerson && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactPerson}>{location.contactPerson}</Text>
              {location.contactPhone && (
                <View style={styles.phoneContainer}>
                  <Phone size={16} color="#64748b" />
                  <Text style={styles.contactPhone}>{location.contactPhone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Wrench size={24} color="#2563eb" />
              <Text style={styles.statNumber}>{assignedTools.length}</Text>
              <Text style={styles.statLabel}>Tools Assigned</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color="#10b981" />
              <Text style={styles.statNumber}>{activeWorkers}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Assigned Tools</Text>
          {assignedTools.length === 0 ? (
            <View style={styles.emptyState}>
              <Wrench size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>No tools assigned to this location</Text>
            </View>
          ) : (
            <View style={styles.toolsList}>
              {assignedTools.map(tool => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  onPress={() => router.push(`/tool-detail/${tool.id}` as any)}
                >
                  <Text style={styles.toolName}>{tool.name}</Text>
                  <Text style={styles.toolCategory}>{tool.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {location.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{location.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 16,
  },
  locationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  contactSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactPerson: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  toolsSection: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  toolsList: {
    gap: 8,
  },
  toolCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  toolCategory: {
    fontSize: 12,
    color: '#64748b',
  },
  notesSection: {
    padding: 20,
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});