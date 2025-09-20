import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, User, Calendar, LogIn, LogOut, MapPin } from 'lucide-react-native';

export default function AttendanceScreen() {
  const { attendance, workers, locations, recordAttendance } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [nearestWorkLocation, setNearestWorkLocation] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Attendance permissions based on role matrix
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  const canViewAllAttendance = isAdmin || isManager; // Admin and Manager can view all attendance
  const canViewOwnAttendance = true; // All roles can view their own attendance
  const canMarkAttendance = isWorker; // Only workers can mark attendance

  const today = new Date().toISOString().split('T')[0];
  
  // Filter attendance based on user permissions
  const filteredAttendance = canViewAllAttendance 
    ? attendance 
    : attendance.filter(record => record.workerId === user?.id);
  
  const todayAttendance = filteredAttendance.filter(record => 
    record.dateTime.split('T')[0] === today
  );

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown Worker';
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'No location';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Location detection functions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!locationPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance * 1000; // Convert to meters
  };

  const findNearestWorkLocation = async () => {
    const location = await getCurrentLocation();
    if (!location || !locations.length) return null;

    let nearestLocation = null;
    let minDistance = Infinity;
    const PROXIMITY_THRESHOLD = 500; // 500 meters

    for (const workLocation of locations) {
      if (workLocation.latitude && workLocation.longitude) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          workLocation.latitude,
          workLocation.longitude
        );

        if (distance < minDistance && distance <= PROXIMITY_THRESHOLD) {
          minDistance = distance;
          nearestLocation = workLocation.id;
        }
      }
    }

    setNearestWorkLocation(nearestLocation);
    return nearestLocation;
  };

  // Initialize location detection
  useEffect(() => {
    if (isWorker) {
      requestLocationPermission();
    }
  }, [isWorker]);

  useEffect(() => {
    if (isWorker && locationPermission) {
      findNearestWorkLocation();
    }
  }, [locationPermission, locations, isWorker]);

  const handleClockIn = async () => {
    if (!user) return;
    
    // Get the nearest work location
    const detectedLocationId = await findNearestWorkLocation();
    const locationName = detectedLocationId ? getLocationName(detectedLocationId) : 'No nearby location detected';
    
    Alert.alert(
      'Clock In',
      `Are you sure you want to clock in?\n\nDetected Location: ${locationName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock In',
          onPress: async () => {
            try {
              await recordAttendance({
                workerId: user.id,
                action: 'Clock In',
                dateTime: new Date().toISOString(),
                workLocationId: detectedLocationId || undefined,
                latitude: currentLocation?.coords.latitude,
                longitude: currentLocation?.coords.longitude,
                address: currentLocation ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}` : undefined
              });
              Alert.alert('Success', `You have successfully clocked in${detectedLocationId ? ` at ${locationName}` : ''}!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to clock in. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleClockOut = async () => {
    if (!user) return;
    
    // Get the nearest work location
    const detectedLocationId = await findNearestWorkLocation();
    const locationName = detectedLocationId ? getLocationName(detectedLocationId) : 'No nearby location detected';
    
    Alert.alert(
      'Clock Out',
      `Are you sure you want to clock out?\n\nDetected Location: ${locationName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: async () => {
            try {
              await recordAttendance({
                workerId: user.id,
                action: 'Clock Out',
                dateTime: new Date().toISOString(),
                workLocationId: detectedLocationId || undefined,
                latitude: currentLocation?.coords.latitude,
                longitude: currentLocation?.coords.longitude,
                address: currentLocation ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}` : undefined
              });
              Alert.alert('Success', `You have successfully clocked out${detectedLocationId ? ` from ${locationName}` : ''}!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to clock out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getUserTodayStatus = () => {
    if (!user) return { isClockedIn: false, lastAction: null };
    
    const userTodayRecords = todayAttendance
      .filter(record => record.workerId === user.id)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    
    const lastAction = userTodayRecords[0]?.action;
    const isClockedIn = lastAction === 'Clock In';
    
    return { isClockedIn, lastAction };
  };

  const getTodayWorkerStats = () => {
    const clockedInWorkers = new Set();
    const workerStats: { [key: string]: { firstIn?: string; lastOut?: string; location?: string } } = {};

    todayAttendance.forEach(record => {
      if (record.action === 'Clock In') {
        clockedInWorkers.add(record.workerId);
        if (!workerStats[record.workerId]?.firstIn) {
          workerStats[record.workerId] = {
            ...workerStats[record.workerId],
            firstIn: record.dateTime,
            location: record.workLocationId
          };
        }
      } else if (record.action === 'Clock Out') {
        workerStats[record.workerId] = {
          ...workerStats[record.workerId],
          lastOut: record.dateTime
        };
      }
    });

    return { clockedInWorkers: Array.from(clockedInWorkers), workerStats };
  };

  const renderTodayView = () => {
    // For workers, show a simple clock in/out interface
    if (isWorker) {
      const { isClockedIn } = getUserTodayStatus();
      const detectedLocationName = nearestWorkLocation ? getLocationName(nearestWorkLocation) : null;
      
      return (
        <View style={styles.workerClockInterface}>
          <View style={styles.clockCard}>
            <Clock size={64} color="#2563eb" />
            <Text style={styles.clockTitle}>Time Tracking</Text>
            <Text style={styles.clockSubtitle}>
              {isClockedIn ? 'You are currently clocked in' : 'Ready to start your day?'}
            </Text>
            
            {/* Location Status */}
            <View style={styles.locationStatus}>
              <MapPin size={16} color={nearestWorkLocation ? "#10b981" : "#6b7280"} />
              <Text style={[styles.locationText, { color: nearestWorkLocation ? "#10b981" : "#6b7280" }]}>
                {locationPermission 
                  ? (detectedLocationName || 'No nearby work location') 
                  : 'Location permission required'
                }
              </Text>
            </View>
            
            <View style={styles.clockButtonsContainer}>
              <TouchableOpacity
                style={[styles.mainClockButton, styles.clockInButton, isClockedIn && styles.disabledButton]}
                onPress={handleClockIn}
                disabled={isClockedIn}
                testID="main-clock-in-button"
              >
                <LogIn size={24} color="#ffffff" />
                <Text style={styles.mainClockButtonText}>Clock In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mainClockButton, styles.clockOutButton, !isClockedIn && styles.disabledButton]}
                onPress={handleClockOut}
                disabled={!isClockedIn}
                testID="main-clock-out-button"
              >
                <LogOut size={24} color="#ffffff" />
                <Text style={styles.mainClockButtonText}>Clock Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // For managers and admins, show worker attendance overview
    const { clockedInWorkers, workerStats } = getTodayWorkerStats();

    if (clockedInWorkers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Clock size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No one clocked in yet</Text>
          <Text style={styles.emptySubtitle}>
            Worker attendance will appear here once they clock in
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.attendanceList}>
        {(clockedInWorkers as string[]).map((workerId: string) => {
          const stats = workerStats[workerId];
          const isStillClocked = !stats.lastOut;
          
          return (
            <View key={workerId} style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <View style={styles.workerInfo}>
                  <View style={styles.workerIcon}>
                    <User size={20} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.workerName}>{getWorkerName(workerId as string)}</Text>
                    <View style={styles.locationText}>
                      <MapPin size={12} color="#64748b" />
                      <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 4 }}>
                        {getLocationName(stats.location)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: isStillClocked ? '#dcfce7' : '#f3f4f6' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: isStillClocked ? '#166534' : '#6b7280' }
                  ]}>
                    {isStillClocked ? 'Active' : 'Clocked Out'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.timeInfo}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>First In</Text>
                  <Text style={styles.timeValue}>
                    {stats.firstIn ? formatTime(stats.firstIn) : '--'}
                  </Text>
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Last Out</Text>
                  <Text style={styles.timeValue}>
                    {stats.lastOut ? formatTime(stats.lastOut) : '--'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAllView = () => {
    const sortedAttendance = [...filteredAttendance].sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    if (sortedAttendance.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No attendance records</Text>
          <Text style={styles.emptySubtitle}>
            Attendance history will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.attendanceList}>
        {sortedAttendance.map(record => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.recordInfo}>
                <Text style={styles.workerName}>{getWorkerName(record.workerId)}</Text>
                <Text style={styles.recordDate}>{formatDate(record.dateTime)}</Text>
              </View>
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
            
            <View style={styles.recordDetails}>
              <Text style={styles.recordTime}>{formatTime(record.dateTime)}</Text>
              <View style={styles.recordLocation}>
                <MapPin size={12} color="#64748b" />
                <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 4 }}>
                  {getLocationName(record.workLocationId)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        {/* Remove clock buttons from header for workers since they're now in the main interface */}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.tabActive]}
          onPress={() => setActiveTab('today')}
          testID="today-tab"
        >
          <Text style={[
            styles.tabText,
            activeTab === 'today' && styles.tabTextActive
          ]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          testID="all-tab"
        >
          <Text style={[
            styles.tabText,
            activeTab === 'all' && styles.tabTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'today' ? renderTodayView() : renderAllView()}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  workerClockInterface: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  clockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 350,
  },
  clockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  clockSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  clockButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  mainClockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  mainClockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clockActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  clockInButton: {
    backgroundColor: '#10b981',
  },
  clockOutButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  clockButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  attendanceList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  locationText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  recordLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginVertical: 16,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});