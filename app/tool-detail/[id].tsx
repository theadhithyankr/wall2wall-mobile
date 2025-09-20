import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { Package, MapPin, Calendar, AlertCircle, Edit, ArrowLeft, UserMinus } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tools, locations, unassignTool } = useData();
  
  const tool = tools.find(t => t.id === id);
  
  if (!tool) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Tool Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tool not found</Text>
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

  const location = tool.currentWorkLocationId 
    ? locations.find(l => l.id === tool.currentWorkLocationId)
    : null;

  const isOverdue = tool.ownershipType === 'Rented' && tool.expectedReturnDate 
    ? new Date(tool.expectedReturnDate) < new Date()
    : false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return '#10b981';
      case 'Assigned': return '#3b82f6';
      case 'Under Maintenance': return '#f59e0b';
      case 'Returned': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignTool(tool.id);
      console.log('Tool unassigned successfully');
    } catch (error) {
      console.error('Error unassigning tool:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: tool.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push(`/edit-tool/${tool.id}` as any)}>
              <Edit size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.toolIcon}>
            <Package size={32} color="#2563eb" />
          </View>
          <View style={styles.toolInfo}>
            <Text style={styles.toolName}>{tool.name}</Text>
            <Text style={styles.toolCategory}>{tool.category}</Text>
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
              {isOverdue && (
                <View style={styles.overdueBadge}>
                  <AlertCircle size={12} color="#dc2626" />
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(tool.status) }
              ]} />
              <Text style={styles.statusText}>{tool.status}</Text>
            </View>
            {tool.status === 'Available' && (
              <TouchableOpacity 
                style={styles.assignButton}
                onPress={() => router.push('/assign-tool')}
              >
                <Text style={styles.assignButtonText}>Assign to Location</Text>
              </TouchableOpacity>
            )}
            {tool.status === 'Assigned' && (
              <TouchableOpacity 
                style={styles.unassignButton}
                onPress={() => handleUnassign()}
              >
                <UserMinus size={16} color="#dc2626" />
                <Text style={styles.unassignButtonText}>Unassign</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationCard}>
            {location ? (
              <View style={styles.locationInfo}>
                <MapPin size={20} color="#2563eb" />
                <View>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.city}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.unassignedText}>Not assigned to any location</Text>
            )}
          </View>
        </View>

        {tool.ownershipType === 'Rented' && (
          <View style={styles.rentalSection}>
            <Text style={styles.sectionTitle}>Rental Information</Text>
            <View style={styles.rentalCard}>
              {tool.vendorName && (
                <View style={styles.rentalRow}>
                  <Text style={styles.rentalLabel}>Vendor:</Text>
                  <Text style={styles.rentalValue}>{tool.vendorName}</Text>
                </View>
              )}
              {tool.vendorContact && (
                <View style={styles.rentalRow}>
                  <Text style={styles.rentalLabel}>Contact:</Text>
                  <Text style={styles.rentalValue}>{tool.vendorContact}</Text>
                </View>
              )}
              {tool.rentalStartDate && (
                <View style={styles.rentalRow}>
                  <Text style={styles.rentalLabel}>Start Date:</Text>
                  <Text style={styles.rentalValue}>
                    {new Date(tool.rentalStartDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {tool.expectedReturnDate && (
                <View style={styles.rentalRow}>
                  <Text style={styles.rentalLabel}>Expected Return:</Text>
                  <Text style={[
                    styles.rentalValue,
                    isOverdue && styles.overdueDate
                  ]}>
                    {new Date(tool.expectedReturnDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {tool.rentalCost && (
                <View style={styles.rentalRow}>
                  <Text style={styles.rentalLabel}>Cost:</Text>
                  <Text style={styles.rentalValue}>₹{tool.rentalCost}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.conditionSection}>
          <Text style={styles.sectionTitle}>Condition</Text>
          <View style={styles.conditionCard}>
            <Text style={[
              styles.conditionText,
              { color: tool.condition === 'Good' ? '#10b981' : 
                       tool.condition === 'Needs Service' ? '#f59e0b' : '#dc2626' }
            ]}>
              {tool.condition}
            </Text>
          </View>
        </View>

        {tool.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{tool.notes}</Text>
            </View>
          </View>
        )}

        {tool.image && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Tool Image</Text>
            <View style={styles.imageCard}>
              <Image 
                source={{ uri: tool.image }} 
                style={styles.toolImage}
                contentFit="cover"
              />
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Report Maintenance Issue</Text>
          </TouchableOpacity>
          {tool.ownershipType === 'Rented' && tool.status !== 'Returned' && (
            <TouchableOpacity style={[styles.actionButton, styles.returnButton]}>
              <Text style={[styles.actionButtonText, styles.returnButtonText]}>Mark as Returned</Text>
            </TouchableOpacity>
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
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  toolCategory: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
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
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  assignButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  unassignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  unassignButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  locationSection: {
    padding: 20,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
  },
  unassignedText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
  },
  rentalSection: {
    padding: 20,
  },
  rentalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  rentalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  rentalValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#dc2626',
  },
  conditionSection: {
    padding: 20,
  },
  conditionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '600',
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
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  returnButton: {
    backgroundColor: '#10b981',
  },
  returnButtonText: {
    color: '#ffffff',
  },
  imageSection: {
    padding: 20,
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});