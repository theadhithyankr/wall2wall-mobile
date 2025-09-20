import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Settings as SettingsIcon, Building, Clock, MapPin, ArrowLeft } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('Interior Design Ops');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [locationAccuracy, setLocationAccuracy] = useState(true);
  const [autoClockOut, setAutoClockOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Settings permissions based on role matrix
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  const canConfigureSystem = isAdmin; // Only admins can configure system settings
  const canConfigurePersonal = true; // All users can configure personal settings

  const handleSave = () => {
    console.log('Saving settings...');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {canConfigureSystem && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Building size={20} color="#2563eb" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Company Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Enter company name"
                    testID="company-name-input"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {canConfigureSystem && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time & Location</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Clock size={20} color="#2563eb" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Timezone</Text>
                  <TouchableOpacity style={styles.dropdown}>
                    <Text style={styles.dropdownText}>{timezone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <MapPin size={20} color="#2563eb" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>High Accuracy GPS</Text>
                  <Text style={styles.settingDescription}>
                    Use high accuracy GPS for attendance tracking
                  </Text>
                </View>
                <Switch
                  value={locationAccuracy}
                  onValueChange={setLocationAccuracy}
                  trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                  thumbColor={locationAccuracy ? '#2563eb' : '#64748b'}
                  testID="location-accuracy-switch"
                />
              </View>
            </View>
          </View>
        )}

        {canConfigureSystem && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance Settings</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Clock size={20} color="#2563eb" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Auto Clock Out</Text>
                  <Text style={styles.settingDescription}>
                    Automatically clock out workers after 12 hours
                  </Text>
                </View>
                <Switch
                  value={autoClockOut}
                  onValueChange={setAutoClockOut}
                  trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                  thumbColor={autoClockOut ? '#2563eb' : '#64748b'}
                  testID="auto-clock-out-switch"
                />
              </View>
            </View>
          </View>
        )}

        {canConfigurePersonal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <SettingsIcon size={20} color="#2563eb" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications for overdue tools and attendance alerts
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                  thumbColor={notificationsEnabled ? '#2563eb' : '#64748b'}
                  testID="notifications-switch"
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Consent</Text>
          <View style={styles.consentCard}>
            <Text style={styles.consentTitle}>Location Data Usage</Text>
            <Text style={styles.consentText}>
              This app collects location data to enable attendance tracking and work location verification. 
              Location data is used to:
              {'\n\n'}• Record clock in/out locations for workers
              {'\n'}• Verify attendance at assigned work sites
              {'\n'}• Generate location-based reports
              {'\n\n'}
              Location data is stored securely and is only accessible to authorized personnel. 
              Workers must consent to location tracking for attendance purposes.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01.15</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>January 15, 2024</Text>
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
  scrollView: {
    flex: 1,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginTop: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
  },
  consentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  consentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
});