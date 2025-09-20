import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MapPin, Check, X } from 'lucide-react-native';

interface MapSelectorProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  onCancel: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function MapSelector({ 
  onLocationSelect, 
  onCancel, 
  initialLatitude = 19.0760, // Mumbai default
  initialLongitude = 72.8777 
}: MapSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLatitude && initialLongitude 
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  const [manualCoords, setManualCoords] = useState({
    latitude: initialLatitude?.toString() || '',
    longitude: initialLongitude?.toString() || ''
  });

  const handleManualLocationSet = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90 degrees.');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180 degrees.');
      return;
    }
    
    setSelectedLocation({ latitude: lat, longitude: lng });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.latitude, selectedLocation.longitude);
    } else {
      Alert.alert('No Location Selected', 'Please enter coordinates to select a location.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <Check size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#64748b" />
          <Text style={styles.placeholderText}>
            Maps are not available on web platform.{'\n'}
            Please enter coordinates manually below.
          </Text>
        </View>

        <View style={styles.coordinatesSection}>
          <Text style={styles.sectionTitle}>Enter Coordinates</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={manualCoords.latitude}
              onChangeText={(text) => setManualCoords(prev => ({ ...prev, latitude: text }))}
              placeholder="e.g., 19.0760"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={manualCoords.longitude}
              onChangeText={(text) => setManualCoords(prev => ({ ...prev, longitude: text }))}
              placeholder="e.g., 72.8777"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={styles.setLocationButton}
            onPress={handleManualLocationSet}
          >
            <MapPin size={20} color="#ffffff" />
            <Text style={styles.setLocationButtonText}>Set Location</Text>
          </TouchableOpacity>
        </View>

        {selectedLocation && (
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.selectedLocationTitle}>Selected Location:</Text>
            <Text style={styles.coordinates}>
              Lat: {selectedLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinates}>
              Lng: {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 50,
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 24,
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  coordinatesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  setLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  setLocationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLocationInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#0369a1',
    fontFamily: 'monospace',
  },
});