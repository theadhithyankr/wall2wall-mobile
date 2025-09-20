import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Package, AlertCircle, MapPin } from 'lucide-react-native';
import { Tool, ToolFilter } from '@/types';
import { router } from 'expo-router';

export default function ToolsScreen() {
  const { tools, locations } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ToolFilter>({
    ownership: 'All',
    status: 'All',
    search: ''
  });

  // Tool management permissions based on role matrix
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';
  const isWorker = user?.role === 'Worker';
  
  const canAddTools = isManager; // Only managers can add tools
  const canEditTools = isManager; // Only managers can edit tools
  const canDeleteTools = isManager; // Only managers can delete tools
  const canViewTools = true; // All roles can view tools
  const canAssignTools = isManager; // Only managers can assign tools

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwnership = filters.ownership === 'All' || tool.ownershipType === filters.ownership;
    const matchesStatus = filters.status === 'All' || tool.status === filters.status;
    
    return matchesSearch && matchesOwnership && matchesStatus;
  });

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Unassigned';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return '#10b981';
      case 'Assigned': return '#3b82f6';
      case 'Under Maintenance': return '#f59e0b';
      case 'Returned': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const isOverdue = (tool: Tool) => {
    if (tool.ownershipType === 'Rented' && tool.expectedReturnDate) {
      return new Date(tool.expectedReturnDate) < new Date();
    }
    return false;
  };

  const renderToolCard = (tool: Tool) => (
    <TouchableOpacity
      key={tool.id}
      style={styles.toolCard}
      onPress={() => router.push(`/tool-detail/${tool.id}` as any)}
      testID={`tool-card-${tool.id}`}
    >
      <View style={styles.toolHeader}>
        <View style={styles.toolInfo}>
          <Text style={styles.toolName}>{tool.name}</Text>
          <Text style={styles.toolCategory}>{tool.category}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[
            styles.ownershipBadge,
            { backgroundColor: tool.ownershipType === 'Rented' ? '#fef3c7' : '#dbeafe' }
          ]}>
            <Text style={[
              styles.ownershipText,
              { color: tool.ownershipType === 'Rented' ? '#92400e' : '#1e40af' }
            ]}>
              {tool.ownershipType}
            </Text>
          </View>
          {isOverdue(tool) && (
            <View style={styles.overdueBadge}>
              <AlertCircle size={12} color="#dc2626" />
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.toolDetails}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(tool.status) }
          ]} />
          <Text style={styles.statusText}>{tool.status}</Text>
        </View>
        
        {tool.currentWorkLocationId && (
          <View style={styles.locationText}>
            <MapPin size={12} color="#64748b" />
            <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 4 }}>
              {getLocationName(tool.currentWorkLocationId)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
        {canAddTools && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-tool')}
            testID="add-tool-button"
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
            placeholder="Search tools..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} testID="filter-button">
          <Filter size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        {['All', 'Available', 'Assigned', 'Under Maintenance'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filters.status === status && styles.filterTabActive
            ]}
            onPress={() => setFilters({ ...filters, status: status as any })}
            testID={`filter-${status.toLowerCase()}`}
          >
            <Text style={[
              styles.filterTabText,
              filters.status === status && styles.filterTabTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredTools.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No tools found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first tool to get started'}
            </Text>
            {!searchQuery && canAddTools && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-tool')}
                testID="empty-add-tool"
              >
                <Text style={styles.emptyButtonText}>Add Tool</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.toolsList}>
            {filteredTools.map(renderToolCard)}
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  toolsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  toolCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    gap: 8,
  },
  ownershipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownershipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    gap: 4,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  toolDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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