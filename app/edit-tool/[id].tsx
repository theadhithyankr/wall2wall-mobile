import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/src/contexts/DataContext';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { ArrowLeft, Check, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { TOOL_CATEGORIES, TOOL_CONDITIONS, OWNERSHIP_TYPES } from '@/src/utils/categories';
import * as ImagePicker from 'expo-image-picker';

export default function EditToolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tools, updateTool } = useData();
  
  const tool = tools.find(t => t.id === id);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ownershipType: 'In-House' as 'In-House' | 'Rented',
    condition: 'Good' as 'Good' | 'Needs Service' | 'Damaged',
    notes: '',
    image: '',
    vendorName: '',
    vendorContact: '',
    rentalCost: '',
    rentalStartDate: '',
    expectedReturnDate: ''
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name || '',
        category: tool.category || '',
        ownershipType: tool.ownershipType || 'In-House',
        condition: tool.condition || 'Good',
        notes: tool.notes || '',
        image: tool.image || '',
        vendorName: tool.vendorName || '',
        vendorContact: tool.vendorContact || '',
        rentalCost: tool.rentalCost?.toString() || '',
        rentalStartDate: tool.rentalStartDate || '',
        expectedReturnDate: tool.expectedReturnDate || ''
      });
    }
  }, [tool]);

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
      Alert.alert('Error', 'Please enter a tool name');
      return;
    }

    try {
      const updateData: any = {
        name: formData.name.trim(),
        category: formData.category,
        ownershipType: formData.ownershipType,
        condition: formData.condition,
        notes: formData.notes.trim(),
        image: formData.image
      };

      if (formData.ownershipType === 'Rented') {
        updateData.vendorName = formData.vendorName.trim();
        updateData.vendorContact = formData.vendorContact.trim();
        updateData.rentalCost = formData.rentalCost ? parseFloat(formData.rentalCost) : undefined;
        updateData.rentalStartDate = formData.rentalStartDate;
        updateData.expectedReturnDate = formData.expectedReturnDate;
      }

      await updateTool(tool.id, updateData);
      Alert.alert('Success', 'Tool updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update tool');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Tool',
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
        {/* Tool Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Tool Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter tool name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {TOOL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ownership Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Ownership Type</Text>
          <View style={styles.ownershipGrid}>
            {OWNERSHIP_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.ownershipButton,
                  formData.ownershipType === type && styles.ownershipButtonActive
                ]}
                onPress={() => setFormData({ ...formData, ownershipType: type as any })}
              >
                <Text style={[
                  styles.ownershipButtonText,
                  formData.ownershipType === type && styles.ownershipButtonTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rental Details (only if Rented) */}
        {formData.ownershipType === 'Rented' && (
          <View style={styles.section}>
            <Text style={styles.label}>Rental Details</Text>
            <TextInput
              style={styles.input}
              value={formData.vendorName}
              onChangeText={(text) => setFormData({ ...formData, vendorName: text })}
              placeholder="Vendor name"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={styles.input}
              value={formData.vendorContact}
              onChangeText={(text) => setFormData({ ...formData, vendorContact: text })}
              placeholder="Vendor contact"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={styles.input}
              value={formData.rentalCost}
              onChangeText={(text) => setFormData({ ...formData, rentalCost: text })}
              placeholder="Rental cost"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.conditionGrid}>
            {TOOL_CONDITIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.conditionButton,
                  formData.condition === condition && styles.conditionButtonActive
                ]}
                onPress={() => setFormData({ ...formData, condition: condition as any })}
              >
                <Text style={[
                  styles.conditionButtonText,
                  formData.condition === condition && styles.conditionButtonTextActive
                ]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Tool Image</Text>
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  ownershipGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  ownershipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  ownershipButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  ownershipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  ownershipButtonTextActive: {
    color: '#ffffff',
  },
  conditionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  conditionButtonTextActive: {
    color: '#ffffff',
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