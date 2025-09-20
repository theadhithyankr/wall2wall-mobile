import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, MapPin, Phone, Wrench, Users, Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';

export default function LocationsScreen() {
  const { locations, tools, attendance } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Location management permissions based on role matrix
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';
  const isWorker = user?.role === 'Worker';
  
  const canAddLocations = isManager || isAdmin; // Managers and admins can add locations
  const canEditLocations = isManager || isAdmin; // Managers and admins can edit locations
  const canDeleteLocations = isManager || isAdmin; // Managers and admins can delete locations
  const canViewLocations = true; // All roles can view locations

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocationStats = (locationId: string) => {
    const assignedTools = tools.filter(tool => tool.currentWorkLocationId === locationId).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(record => 
      record.workLocationId === locationId && 
      record.dateTime.split('T')[0] === today &&
      record.action === 'Clock In'
    );
    const activeWorkers = new Set(todayAttendance.map(record => record.workerId)).size;

    return { assignedTools, activeWorkers };
  };

  const renderLocationCard = (location: any) => {
    const stats = getLocationStats(location.id);
    
    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationCard}
        onPress={() => router.push(`/location-detail/${location.id}` as any)}
        testID={`location-card-${location.id}`}
      >
        <View style={styles.locationHeader}>
          {location.image && (
          <Image 
            source={{ uri: location.image }} 
            style={styles.locationImage}
            contentFit="cover"
          />
        )}
          <View style={styles.locationIcon}>
            <MapPin size={20} color="#2563eb" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}, {location.city}</Text>
          </View>
          {canEditLocations && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/edit-location/${location.id}` as any);
              }}
            >
              <Edit size={16} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>

        {location.contactPerson && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactPerson}>{location.contactPerson}</Text>
            {location.contactPhone && (
              <View style={styles.phoneContainer}>
                <Phone size={14} color="#64748b" />
                <Text style={styles.contactPhone}>{location.contactPhone}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.locationStats}>
          <View style={styles.statItem}>
            <Wrench size={16} color="#64748b" />
            <Text style={styles.statText}>{stats.assignedTools} tools</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={16} color="#64748b" />
            <Text style={styles.statText}>{stats.activeWorkers} active today</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Locations</Text>
        {canAddLocations && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-location')}
            testID="add-location-button"
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredLocations.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No locations found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first work location to get started'}
            </Text>
            {!searchQuery && canAddLocations && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-location')}
                testID="empty-add-location"
              >
                <Text style={styles.emptyButtonText}>Add Location</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.locationsList}>
            {filteredLocations.map(renderLocationCard)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  locationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    marginLeft: 'auto',
  },
  locationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  contactInfo: {
    marginBottom: 12,
    paddingLeft: 52,
  },
  contactPerson: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 52,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#64748b',
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