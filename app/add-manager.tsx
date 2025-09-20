import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useData } from '@/src/contexts/DataContext';
import { User } from '@/src/types';
import { ArrowLeft, Check } from 'lucide-react-native';

export default function AddManagerScreen() {
  const { addManager } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as needed
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
    } else {
      return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange('phone', formatted);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter manager name');
      return false;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const managerData: Omit<User, 'id'> = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces from phone
        email: formData.email.trim(),
        role: 'manager',
      };

      await addManager(managerData);
      Alert.alert('Success', 'Manager added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add manager. Please try again.');
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
        >
          <ArrowLeft size={20} color="#64748b" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Add Manager</Text>
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || isLoading}
        >
          <Check size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Manager Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter manager's full name"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={formData.phone}
                onChangeText={handlePhoneChange}
                placeholder="XXX XXX XXXX"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={12} // Formatted length
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="manager@company.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.roleInfo}>
            <Text style={styles.roleLabel}>Role: Manager</Text>
            <Text style={styles.roleDescription}>
              Managers can manage tools, locations, and view reports
            </Text>
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#6b7280',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  roleInfo: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#3730a3',
  },
});