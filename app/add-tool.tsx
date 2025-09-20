import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { TOOL_CATEGORIES, TOOL_CONDITIONS, OWNERSHIP_TYPES } from '@/constants/categories';

export default function AddToolScreen() {
  const { addTool } = useData();
  const [formData, setFormData] = useState({
    name: '',
    category: TOOL_CATEGORIES[0] as string,
    ownershipType: OWNERSHIP_TYPES[0] as 'In-House' | 'Rented',
    condition: TOOL_CONDITIONS[0] as 'Good' | 'Needs Service' | 'Damaged',
    notes: '',
    vendorName: '',
    vendorContact: '',
    rentalStartDate: '',
    expectedReturnDate: '',
    rentalCost: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Tool name is required');
      return;
    }

    if (formData.ownershipType === 'Rented') {
      if (!formData.vendorName.trim() || !formData.expectedReturnDate) {
        Alert.alert('Error', 'Vendor name and expected return date are required for rented tools');
        return;
      }
    }

    setIsLoading(true);
    try {
      const toolData = {
        name: formData.name.trim(),
        category: formData.category,
        ownershipType: formData.ownershipType,
        status: 'Available' as const,
        condition: formData.condition,
        notes: formData.notes.trim() || undefined,
        ...(formData.ownershipType === 'Rented' && {
          vendorName: formData.vendorName.trim(),
          vendorContact: formData.vendorContact.trim() || undefined,
          rentalStartDate: formData.rentalStartDate || new Date().toISOString(),
          expectedReturnDate: formData.expectedReturnDate,
          rentalCost: formData.rentalCost ? parseFloat(formData.rentalCost) : undefined
        })
      };

      await addTool(toolData);
      Alert.alert('Success', 'Tool added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add tool. Please try again.');
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
        <Text style={styles.title}>Add Tool</Text>
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
            <Text style={styles.label}>Tool Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter tool name"
              testID="name-input"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {TOOL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.categoryChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: category as string })}
                  testID={`category-${category}`}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.categoryTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ownership Type</Text>
            <View style={styles.radioGroup}>
              {OWNERSHIP_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.radioOption,
                    formData.ownershipType === type && styles.radioOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, ownershipType: type as any })}
                  testID={`ownership-${type}`}
                >
                  <Text style={[
                    styles.radioText,
                    formData.ownershipType === type && styles.radioTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.ownershipType === 'Rented' && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vendor Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vendorName}
                  onChangeText={(text) => setFormData({ ...formData, vendorName: text })}
                  placeholder="Enter vendor name"
                  testID="vendor-name-input"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Vendor Contact</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vendorContact}
                  onChangeText={(text) => setFormData({ ...formData, vendorContact: text })}
                  placeholder="Enter vendor phone number"
                  keyboardType="phone-pad"
                  testID="vendor-contact-input"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Expected Return Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.expectedReturnDate}
                  onChangeText={(text) => setFormData({ ...formData, expectedReturnDate: text })}
                  placeholder="YYYY-MM-DD"
                  testID="return-date-input"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rental Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rentalCost}
                  onChangeText={(text) => setFormData({ ...formData, rentalCost: text })}
                  placeholder="Enter rental cost"
                  keyboardType="numeric"
                  testID="rental-cost-input"
                />
              </View>
            </>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.radioGroup}>
              {TOOL_CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.radioOption,
                    formData.condition === condition && styles.radioOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, condition: condition as any })}
                  testID={`condition-${condition}`}
                >
                  <Text style={[
                    styles.radioText,
                    formData.condition === condition && styles.radioTextActive
                  ]}>
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  radioOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  radioTextActive: {
    color: '#ffffff',
  },
});