import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Clock, User, Calendar, LogIn, LogOut, MapPin } from 'lucide-react-native';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TabType = 'today' | 'all';

interface WorkerStats {
  firstIn?: string;
  lastOut?: string;
  location: string;
}

interface LocationPermissions {
  canViewAllAttendance: boolean;
  canViewOwnAttendance: boolean;
  canMarkAttendance: boolean;
}

interface UserTodayStatus {
  isClockedIn: boolean;
  lastAction?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOCATION_CONFIG = {
  ACCURACY: Location.Accuracy.High,
  TIMEOUT: 10000,
  EARTH_RADIUS_KM: 6371,
  WORK_LOCATION_RADIUS_KM: 0.5,
} as const;

const DATE_FORMATS = {
  TIME: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: true,
  },
  DATE: {
    month: 'short' as const,
    day: 'numeric' as const,
    year: 'numeric' as const,
  },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AttendanceScreen() {
  // ========================================
  // HOOKS & STATE
  // ========================================
  
  const { attendance, workers, locations, recordAttendance } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [nearestWorkLocation, setNearestWorkLocation] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================
  
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isWorker = user?.role === 'Worker';
  
  const permissions: LocationPermissions = {
    canViewAllAttendance: isAdmin || isManager,
    canViewOwnAttendance: true,
    canMarkAttendance: isWorker || isManager,
  };

  const today = new Date().toISOString().split('T')[0];
  
  const filteredAttendance = permissions.canViewAllAttendance 
    ? attendance 
    : attendance.filter(record => record.workerId === user?.id);
  
  const todayAttendance = filteredAttendance.filter(record => 
    record.dateTime.split('T')[0] === today
  );

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  const getWorkerName = (workerId: string): string => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown Worker';
  };

  const getLocationName = (locationId?: string): string => {
    if (!locationId) return 'No location';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString('en-US', DATE_FORMATS.TIME);
  };

  const formatDate = (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString('en-US', DATE_FORMATS.DATE);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = LOCATION_CONFIG.EARTH_RADIUS_KM;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ========================================
  // LOCATION SERVICES
  // ========================================
  
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      if (!locationPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: LOCATION_CONFIG.ACCURACY,
        // Removed timeout as it's not a valid LocationOptions property
      });
      
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const findNearestWorkLocation = (userLocation: Location.LocationObject): string | null => {
    let nearestLocation = null;
    let minDistance = Infinity;

    for (const location of locations) {
      if (location.latitude && location.longitude) {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          location.latitude,
          location.longitude
        );

        if (distance < LOCATION_CONFIG.WORK_LOCATION_RADIUS_KM && distance < minDistance) {
          minDistance = distance;
          nearestLocation = location.id;
        }
      }
    }

    return nearestLocation;
  };

  // ========================================
  // ATTENDANCE LOGIC
  // ========================================
  
  const handleClockIn = async (): Promise<void> => {
    const location = await getCurrentLocation();
    const detectedLocationId = location ? findNearestWorkLocation(location) : null;
    
    if (!detectedLocationId) {
      Alert.alert(
        'Location Required',
        'You must be at a registered work location to clock in.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Clock In',
      `Clock in at ${getLocationName(detectedLocationId)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock In',
          onPress: async () => {
            try {
              await recordAttendance({
                workerId: user!.id,
                action: 'Clock In',
                dateTime: new Date().toISOString(),
                workLocationId: detectedLocationId || undefined,
                notes: '',
                address: currentLocation ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}` : undefined
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clock in. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleClockOut = async (): Promise<void> => {
    const location = await getCurrentLocation();
    const detectedLocationId = location ? findNearestWorkLocation(location) : null;
    
    Alert.alert(
      'Clock Out',
      detectedLocationId 
        ? `Clock out from ${getLocationName(detectedLocationId)}?`
        : 'Clock out from current location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: async () => {
            try {
              await recordAttendance({
                workerId: user!.id,
                action: 'Clock Out',
                dateTime: new Date().toISOString(),
                workLocationId: detectedLocationId || undefined,
                notes: '',
                address: currentLocation ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}` : undefined
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clock out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getUserTodayStatus = (): UserTodayStatus => {
    const userTodayRecords = todayAttendance
      .filter(record => record.workerId === user?.id)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    const lastAction = userTodayRecords[0]?.action;
    return {
      isClockedIn: lastAction === 'Clock In',
      lastAction
    };
  };

  const getTodayWorkerStats = () => {
    const clockedInWorkers = new Set<string>();
    const workerStats: Record<string, WorkerStats> = {};

    todayAttendance.forEach(record => {
      if (!workerStats[record.workerId]) {
        workerStats[record.workerId] = {
          location: record.workLocationId || '',
        };
      }

      if (record.action === 'Clock In') {
        clockedInWorkers.add(record.workerId);
        if (!workerStats[record.workerId].firstIn) {
          workerStats[record.workerId].firstIn = record.dateTime;
        }
      } else if (record.action === 'Clock Out') {
        clockedInWorkers.delete(record.workerId);
        workerStats[record.workerId] = {
          ...workerStats[record.workerId],
          lastOut: record.dateTime
        };
      }
    });

    return { clockedInWorkers: Array.from(clockedInWorkers), workerStats };
  };

  // ========================================
  // RENDER COMPONENTS
  // ========================================
  
  const renderWorkerClockInterface = () => {
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
  };

  const renderWorkerAttendanceCard = (workerId: string, stats: WorkerStats) => {
    const isStillClocked = !stats.lastOut;
    
    return (
      <View key={workerId} style={styles.attendanceCard}>
        <View style={styles.attendanceHeader}>
          <View style={styles.workerInfo}>
            <View style={styles.workerIcon}>
              <User size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.workerName}>{getWorkerName(workerId)}</Text>
              <View style={styles.locationContainer}>
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
  };

  const renderTodayView = () => {
    if (isWorker || isManager) {
      return renderWorkerClockInterface();
    }

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
        {clockedInWorkers.map((workerId: string) => 
          renderWorkerAttendanceCard(workerId, workerStats[workerId])
        )}
      </View>
    );
  };

  const renderAttendanceRecord = (record: any) => (
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
  );

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
        {sortedAttendance.map(renderAttendanceRecord)}
      </View>
    );
  };

  // ========================================
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    const initializeLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const location = await getCurrentLocation();
        if (location) {
          const nearest = findNearestWorkLocation(location);
          setNearestWorkLocation(nearest);
        }
      }
    };

    initializeLocation();
  }, []);

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
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

      <View style={styles.contentContainer}>
        {activeTab === 'today' ? renderTodayView() : renderAllView()}
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Layout Styles
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // Typography Styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  // Clock Interface Styles
  workerClockInterface: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  clockCard: {
    backgroundColor: 'transparent',
    alignItems: 'center',
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

  // Button Styles
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

  // Tab Styles
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

  // List Styles
  attendanceList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  // Card Styles
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // Header Styles
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Worker Info Styles
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  // Badge Styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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

  // Time Info Styles
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

  // Record Styles
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
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

  // Empty State Styles
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
});