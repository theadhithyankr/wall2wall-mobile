import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Calendar, Download, Filter, FileText, ArrowLeft, MapPin } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AttendanceReportScreen() {
  const { attendance, workers, locations } = useData();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  // Report permissions based on role matrix
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  const canViewAllReports = isAdmin || isManager; // Admin and Manager can view all reports
  const canExportReports = isAdmin || isManager; // Admin and Manager can export reports
  
  // Filter attendance based on user permissions
  const baseAttendance = canViewAllReports 
    ? attendance 
    : attendance.filter(record => record.workerId === user?.id);

  const filteredAttendance = baseAttendance.filter(record => {
    const recordDate = record.dateTime.split('T')[0];
    const matchesDateRange = (!startDate || recordDate >= startDate) && 
                            (!endDate || recordDate <= endDate);
    const matchesWorker = selectedWorker === 'All' || record.workerId === selectedWorker;
    const matchesLocation = selectedLocation === 'All' || record.workLocationId === selectedLocation;
    
    return matchesDateRange && matchesWorker && matchesLocation;
  });

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown Worker';
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'No Location';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const handleExport = () => {
    Alert.alert(
      'Export Report',
      'Attendance report will be exported as CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting attendance report...') }
      ]
    );
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateObj(selectedDate);
      setStartDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDateObj(selectedDate);
      setEndDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Attendance Report',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleExport}>
              <Download size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          <View style={styles.dateFilters}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Calendar size={16} color="#64748b" />
                <Text style={styles.datePickerText}>
                  {startDate || 'Select start date'}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDateObj}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                />
              )}
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Calendar size={16} color="#64748b" />
                <Text style={styles.datePickerText}>
                  {endDate || 'Select end date'}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDateObj}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                />
              )}
            </View>
          </View>

          <View style={styles.dropdownFilters}>
            {canViewAllReports && (
              <View style={styles.filterGroup}>
                <Text style={styles.inputLabel}>Worker</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{selectedWorker}</Text>
                  <Filter size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.filterGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedLocation}</Text>
                <Filter size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{filteredAttendance.length}</Text>
              <Text style={styles.summaryLabel}>Total Records</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {new Set(filteredAttendance.map(r => r.workerId)).size}
              </Text>
              <Text style={styles.summaryLabel}>Unique Workers</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {new Set(filteredAttendance.map(r => r.dateTime.split('T')[0])).size}
              </Text>
              <Text style={styles.summaryLabel}>Days Covered</Text>
            </View>
          </View>
        </View>

        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionTitle}>Records</Text>
            {canExportReports && (
              <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                <Download size={16} color="#2563eb" />
                <Text style={styles.exportButtonText}>Export CSV</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredAttendance.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters to see attendance records
              </Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {filteredAttendance.map((record, index) => (
                <View key={index} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.workerName}>{getWorkerName(record.workerId)}</Text>
                    <View style={[
                      styles.actionBadge,
                      { backgroundColor: record.action === 'Clock In' ? '#dcfce7' : '#fef3c7' }
                    ]}>
                      <Text style={[
                        styles.actionText,
                        { color: record.action === 'Clock In' ? '#166534' : '#92400e' }
                      ]}>
                        {record.action}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recordDateTime}>{formatDateTime(record.dateTime)}</Text>
                  <View style={styles.recordLocation}>
                    <MapPin size={12} color="#64748b" />
                    <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
                      {getLocationName(record.workLocationId)}
                    </Text>
                  </View>
                  {record.notes && (
                    <Text style={styles.recordNotes}>{record.notes}</Text>
                  )}
                </View>
              ))}
            </View>
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
  filtersSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  dropdownFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  summarySection: {
    padding: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  recordsSection: {
    padding: 20,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDateTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  recordLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
});