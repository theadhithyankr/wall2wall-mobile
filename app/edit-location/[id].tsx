import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { ArrowLeft, Check, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locations, updateLocation } = useData();
  
  const location = locations.find(l => l.id === id);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    notes: '',
    image: ''
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        contactPerson: location.contactPerson || '',
        contactPhone: location.contactPhone || '',
        notes: location.notes || '',
        image: location.image || ''
      });
    }
  }, [location]);

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Location Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location not found</Text>
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter a location address');
      return;
    }

    try {
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        contactPhone: formData.contactPhone.trim(),
        notes: formData.notes.trim(),
        image: formData.image
      };

      await updateLocation(location.id, updateData);
      Alert.alert('Success', 'Location updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Location',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Check size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Location Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter location name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter location address"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Contact Person */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPerson}
            onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
            placeholder="Enter contact person name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Contact Phone */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPhone}
            onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
            placeholder="Enter contact phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Location Image</Text>
          {formData.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity style={styles.imageUploadButton} onPress={takePhoto}>
                <Camera size={24} color="#2563eb" />
                <Text style={styles.imageUploadText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                <ImageIcon size={24} color="#2563eb" />
                <Text style={styles.imageUploadText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter any additional notes"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
  section: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageUploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
});