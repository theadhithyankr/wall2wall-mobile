import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, Check, MapPin, Navigation, Map } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import MapSelector from '@/components/MapSelector';

export default function AddLocationScreen() {
  const { addLocation } = useData();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contactPerson: '',
    contactPhone: '',
    notes: '',
    latitude: '',
    longitude: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get current coordinates');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setFormData({
        ...formData,
        latitude: location.coords.latitude.toFixed(6),
        longitude: location.coords.longitude.toFixed(6)
      });

      Alert.alert('Success', 'Current location coordinates captured successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapLocationSelect = (latitude: number, longitude: number) => {
    setFormData({
      ...formData,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6)
    });
    setShowMapSelector(false);
    Alert.alert('Success', 'Location selected from map successfully');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.city.trim()) {
      Alert.alert('Error', 'Location name and city are required');
      return;
    }

    setIsLoading(true);
    try {
      const locationData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      };

      await addLocation(locationData);
      Alert.alert('Success', 'Location added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add location. Please try again.');
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
        <Text style={styles.title}>Add Location</Text>
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
            <Text style={styles.label}>Location Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter location name"
              testID="name-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter full address"
              multiline
              numberOfLines={2}
              testID="address-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Enter city name"
              testID="city-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPerson}
              onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
              placeholder="Enter contact person name"
              testID="contact-person-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              testID="contact-phone-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Enter any additional notes"
              multiline
              numberOfLines={3}
              testID="notes-input"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>GPS Coordinates</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.locationButton, styles.mapButton]}
                  onPress={() => setShowMapSelector(true)}
                  testID="map-selector-button"
                >
                  <Map size={16} color="#ffffff" />
                  <Text style={styles.locationButtonText}>Select on Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.locationButton, isGettingLocation && styles.locationButtonDisabled]}
                  onPress={getCurrentLocation}
                  disabled={isGettingLocation}
                  testID="get-location-button"
                >
                  <Navigation size={16} color="#ffffff" />
                  <Text style={styles.locationButtonText}>
                    {isGettingLocation ? 'Getting...' : 'Get Current'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.coordinateRow}>
              <View style={styles.coordinateInput}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  placeholder="19.0760"
                  keyboardType="numeric"
                  testID="latitude-input"
                />
              </View>
              
              <View style={styles.coordinateInput}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  placeholder="72.8777"
                  keyboardType="numeric"
                  testID="longitude-input"
                />
              </View>
            </View>
            
            <Text style={styles.coordinateHint}>
              GPS coordinates help workers automatically detect this location when clocking in/out
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showMapSelector}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <MapSelector
          onLocationSelect={handleMapLocationSelect}
          onCancel={() => setShowMapSelector(false)}
          initialLatitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
          initialLongitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
        />
      </Modal>
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
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  mapButton: {
    backgroundColor: '#10b981',
  },
  locationButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  coordinateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  coordinateInput: {
    flex: 1,
    gap: 4,
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  coordinateHint: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});