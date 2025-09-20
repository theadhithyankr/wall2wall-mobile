import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Plus, User, Phone, Clock, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

export default function WorkersScreen() {
  const { workers, locations } = useData();
  const { user } = useAuth();

  // User management permissions based on role matrix
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isWorker = user?.role === 'worker';
  
  const canAddWorkers = isAdmin; // Only admins can add workers
  const canViewWorkers = isAdmin || isManager; // Admins and managers can view workers
  const canEditWorkers = isAdmin; // Only admins can edit workers
  const canDeleteWorkers = isAdmin; // Only admins can delete workers

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'No default location';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const renderWorkerCard = (worker: any) => (
    <TouchableOpacity
      key={worker.id}
      style={styles.workerCard}
      testID={`worker-card-${worker.id}`}
    >
      <View style={styles.workerHeader}>
        <View style={styles.workerIcon}>
          <User size={20} color="#2563eb" />
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker.name}</Text>
          <View style={styles.phoneContainer}>
            <Phone size={14} color="#64748b" />
            <Text style={styles.workerPhone}>{worker.phone}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: worker.active ? '#dcfce7' : '#f3f4f6' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: worker.active ? '#166534' : '#6b7280' }
          ]}>
            {worker.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.workerDetails}>
        {worker.skill && (
          <Text style={styles.skillText}>🔧 {worker.skill}</Text>
        )}
        <View style={styles.locationText}>
          <MapPin size={12} color="#64748b" />
          <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 4 }}>
            {getLocationName(worker.defaultLocationId)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => router.push('/(tabs)/attendance')}
            testID="quick-attendance-button"
          >
            <Clock size={20} color="#ffffff" />
            <Text style={styles.attendanceButtonText}>Attendance</Text>
          </TouchableOpacity>
          {canAddWorkers && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-worker')}
              testID="add-worker-button"
            >
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {workers.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No workers found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first worker to get started
            </Text>
            {canAddWorkers && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-worker')}
                testID="empty-add-worker"
              >
                <Text style={styles.emptyButtonText}>Add Worker</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.workersList}>
            {workers.map(renderWorkerCard)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  attendanceButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  workersList: {
    padding: 20,
    gap: 12,
  },
  workerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  workerDetails: {
    paddingLeft: 52,
    gap: 4,
  },
  skillText: {
    fontSize: 14,
    color: '#64748b',
  },
  locationText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});