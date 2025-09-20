import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { Download, Filter, Package, ArrowLeft } from 'lucide-react-native';

export default function ToolReportScreen() {
  const { tools, locations } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const filteredTools = tools.filter(tool => {
    const matchesOwnership = selectedOwnership === 'All' || tool.ownershipType === selectedOwnership;
    const matchesLocation = selectedLocation === 'All' || tool.currentWorkLocationId === selectedLocation;
    
    return matchesOwnership && matchesLocation;
  });

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Unassigned';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const handleExport = () => {
    Alert.alert(
      'Export Report',
      'Tool utilization report will be exported as CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting tool report...') }
      ]
    );
  };

  const getUtilizationStats = () => {
    const totalTools = filteredTools.length;
    const assignedTools = filteredTools.filter(t => t.status === 'Assigned').length;
    const availableTools = filteredTools.filter(t => t.status === 'Available').length;
    const maintenanceTools = filteredTools.filter(t => t.status === 'Under Maintenance').length;
    const rentedTools = filteredTools.filter(t => t.ownershipType === 'Rented').length;
    
    return {
      totalTools,
      assignedTools,
      availableTools,
      maintenanceTools,
      rentedTools,
      utilizationRate: totalTools > 0 ? Math.round((assignedTools / totalTools) * 100) : 0
    };
  };

  const stats = getUtilizationStats();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tool Utilization Report',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleExport}>
              <Download size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          <View style={styles.dateFilters}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                testID="start-date-input"
              />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                testID="end-date-input"
              />
            </View>
          </View>

          <View style={styles.dropdownFilters}>
            <View style={styles.filterGroup}>
              <Text style={styles.inputLabel}>Ownership</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedOwnership}</Text>
                <Filter size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedLocation}</Text>
                <Filter size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Utilization Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{stats.totalTools}</Text>
              <Text style={styles.summaryLabel}>Total Tools</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{stats.assignedTools}</Text>
              <Text style={styles.summaryLabel}>Assigned</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{stats.utilizationRate}%</Text>
              <Text style={styles.summaryLabel}>Utilization</Text>
            </View>
          </View>
          
          <View style={styles.detailStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Available Tools:</Text>
              <Text style={styles.statValue}>{stats.availableTools}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Under Maintenance:</Text>
              <Text style={styles.statValue}>{stats.maintenanceTools}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Rented Tools:</Text>
              <Text style={styles.statValue}>{stats.rentedTools}</Text>
            </View>
          </View>
        </View>

        <View style={styles.toolsSection}>
          <View style={styles.toolsHeader}>
            <Text style={styles.sectionTitle}>Tool Details</Text>
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Download size={16} color="#2563eb" />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </TouchableOpacity>
          </View>

          {filteredTools.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No tools found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters to see tool data
              </Text>
            </View>
          ) : (
            <View style={styles.toolsList}>
              {filteredTools.map((tool) => (
                <View key={tool.id} style={styles.toolCard}>
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
                    </View>
                  </View>
                  
                  <View style={styles.toolDetails}>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: tool.status === 'Available' ? '#10b981' : 
                                          tool.status === 'Assigned' ? '#3b82f6' : 
                                          tool.status === 'Under Maintenance' ? '#f59e0b' : '#6b7280' }
                      ]} />
                      <Text style={styles.statusText}>{tool.status}</Text>
                    </View>
                    
                    <Text style={styles.locationText}>
                      📍 {getLocationName(tool.currentWorkLocationId)}
                    </Text>
                  </View>

                  {tool.ownershipType === 'Rented' && tool.expectedReturnDate && (
                    <View style={styles.rentalInfo}>
                      <Text style={styles.rentalLabel}>Expected Return:</Text>
                      <Text style={[
                        styles.rentalDate,
                        new Date(tool.expectedReturnDate) < new Date() && styles.overdueDate
                      ]}>
                        {new Date(tool.expectedReturnDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
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
  filtersSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  dropdownFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  summarySection: {
    padding: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  detailStats: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  toolsSection: {
    padding: 20,
  },
  toolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  toolsList: {
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
  toolDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 12,
    color: '#64748b',
  },
  rentalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rentalLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  rentalDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  overdueDate: {
    color: '#dc2626',
  },
});