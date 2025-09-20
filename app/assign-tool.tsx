import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/src/contexts/DataContext';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';

export default function AssignToolScreen() {
  const { tools, locations, assignTool } = useData();
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const availableTools = tools.filter(tool => tool.status === 'Available');

  const handleAssign = async () => {
    if (!selectedTool || !selectedLocation) {
      Alert.alert('Error', 'Please select both a tool and location');
      return;
    }

    setIsLoading(true);
    try {
      await assignTool(selectedTool, selectedLocation);
      Alert.alert('Success', 'Tool assigned successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to assign tool. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assign Tool</Text>
        <TouchableOpacity
          style={[styles.assignButton, isLoading && styles.assignButtonDisabled]}
          onPress={handleAssign}
          disabled={isLoading}
          testID="assign-button"
        >
          <Check size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Tool</Text>
            {availableTools.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No available tools</Text>
              </View>
            ) : (
              <View style={styles.optionsList}>
                {availableTools.map((tool) => (
                  <TouchableOpacity
                    key={tool.id}
                    style={[
                      styles.optionCard,
                      selectedTool === tool.id && styles.optionCardSelected
                    ]}
                    onPress={() => setSelectedTool(tool.id)}
                    testID={`tool-${tool.id}`}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionTitle,
                        selectedTool === tool.id && styles.optionTitleSelected
                      ]}>
                        {tool.name}
                      </Text>
                      <Text style={[
                        styles.optionSubtitle,
                        selectedTool === tool.id && styles.optionSubtitleSelected
                      ]}>
                        {tool.category} • {tool.ownershipType}
                      </Text>
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedTool === tool.id && styles.radioButtonSelected
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Location</Text>
            {locations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No locations available</Text>
              </View>
            ) : (
              <View style={styles.optionsList}>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={[
                      styles.optionCard,
                      selectedLocation === location.id && styles.optionCardSelected
                    ]}
                    onPress={() => setSelectedLocation(location.id)}
                    testID={`location-${location.id}`}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionTitle,
                        selectedLocation === location.id && styles.optionTitleSelected
                      ]}>
                        {location.name}
                      </Text>
                      <Text style={[
                        styles.optionSubtitle,
                        selectedLocation === location.id && styles.optionSubtitleSelected
                      ]}>
                        {location.city}
                      </Text>
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedLocation === location.id && styles.radioButtonSelected
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
  assignButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#1e40af',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  optionSubtitleSelected: {
    color: '#3b82f6',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  radioButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});