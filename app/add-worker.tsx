import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { WORKER_SKILLS } from '@/constants/categories';

export default function AddWorkerScreen() {
  const { addWorker, locations } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: WORKER_SKILLS[0] as string,
    defaultLocationId: '',
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Worker name and phone are required');
      return;
    }

    setIsLoading(true);
    try {
      const workerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        skill: formData.skill || undefined,
        defaultLocationId: formData.defaultLocationId || undefined,
        active: formData.active
      };

      await addWorker(workerData);
      Alert.alert('Success', 'Worker added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add worker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Worker</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          testID="save-button"
        >
          <Check size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Worker Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter worker name"
              testID="name-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              testID="phone-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Skill/Trade</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillScroll}>
              {WORKER_SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    formData.skill === skill && styles.skillChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, skill: skill as string })}
                  testID={`skill-${skill}`}
                >
                  <Text style={[
                    styles.skillText,
                    formData.skill === skill && styles.skillTextActive
                  ]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Default Location</Text>
            <View style={styles.locationOptions}>
              <TouchableOpacity
                style={[
                  styles.locationOption,
                  !formData.defaultLocationId && styles.locationOptionActive
                ]}
                onPress={() => setFormData({ ...formData, defaultLocationId: '' })}
                testID="no-default-location"
              >
                <Text style={[
                  styles.locationText,
                  !formData.defaultLocationId && styles.locationTextActive
                ]}>
                  No Default
                </Text>
              </TouchableOpacity>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationOption,
                    formData.defaultLocationId === location.id && styles.locationOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, defaultLocationId: location.id })}
                  testID={`location-${location.id}`}
                >
                  <Text style={[
                    styles.locationText,
                    formData.defaultLocationId === location.id && styles.locationTextActive
                  ]}>
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusGroup}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  formData.active && styles.statusOptionActive
                ]}
                onPress={() => setFormData({ ...formData, active: true })}
                testID="status-active"
              >
                <Text style={[
                  styles.statusText,
                  formData.active && styles.statusTextActive
                ]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  !formData.active && styles.statusOptionActive
                ]}
                onPress={() => setFormData({ ...formData, active: false })}
                testID="status-inactive"
              >
                <Text style={[
                  styles.statusText,
                  !formData.active && styles.statusTextActive
                ]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  skillScroll: {
    flexGrow: 0,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  skillChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  skillTextActive: {
    color: '#ffffff',
  },
  locationOptions: {
    gap: 8,
  },
  locationOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  locationOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  locationTextActive: {
    color: '#ffffff',
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  statusTextActive: {
    color: '#ffffff',
  },
});