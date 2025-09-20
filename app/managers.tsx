import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Trash2, Mail, Phone, UserCheck } from 'lucide-react-native';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { User } from '@/src/types';

export default function ManagersScreen() {
  const { managers, deleteManager } = useData();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // User management permissions based on role matrix
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  const canAddManagers = isAdmin; // Only admins can add managers
  const canViewManagers = isAdmin; // Only admins can view managers
  const canEditManagers = isAdmin; // Only admins can edit managers
  const canDeleteManagers = isAdmin; // Only admins can delete managers

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRemoveManager = (manager: User) => {
    Alert.alert(
      'Remove Manager',
      `Are you sure you want to remove ${manager.name} as a manager? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteManager(manager.id);
            } catch (error) {
              console.error('Error removing manager:', error);
              Alert.alert('Error', 'Failed to remove manager. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove +91 prefix and format
    const digits = phone.replace('+91', '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
  };

  const renderManagerItem = ({ item }: { item: User }) => (
    <View style={styles.managerCard}>
      <View style={styles.managerHeader}>
        <View style={styles.managerInfo}>
          <View style={styles.nameContainer}>
            <UserCheck size={20} color="#10b981" />
            <Text style={styles.managerName}>{item.name}</Text>
          </View>
          <Text style={styles.roleText}>Manager</Text>
        </View>
        
        {canDeleteManagers && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveManager(item)}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Phone size={16} color="#6b7280" />
          <Text style={styles.contactText}>{formatPhoneNumber(item.phone)}</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Mail size={16} color="#6b7280" />
          <Text style={styles.contactText}>{(item as any).email || 'No email provided'}</Text>
        </View>
      </View>

      {item.createdAt && (
        <Text style={styles.dateText}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UserCheck size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Managers Found</Text>
      <Text style={styles.emptyDescription}>
        Add your first manager to get started with team management.
      </Text>
      {canAddManagers && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/add-manager')}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.emptyButtonText}>Add First Manager</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Managers',
          headerRight: () => canAddManagers ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-manager')}
            >
              <Plus size={24} color="#2563eb" />
            </TouchableOpacity>
          ) : undefined,
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.title}>Team Managers</Text>
        <Text style={styles.subtitle}>
          {managers.length} {managers.length === 1 ? 'manager' : 'managers'} in your team
        </Text>
      </View>

      <FlatList
        data={managers}
        renderItem={renderManagerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          managers.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {managers.length > 0 && canAddManagers && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => router.push('/add-manager')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  managerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  managerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  managerInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  managerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});