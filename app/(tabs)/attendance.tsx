import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { Clock, User, Calendar } from 'lucide-react-native';

export default function AttendanceScreen() {
  const { attendance, workers, locations } = useData();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  const today = new Date().toISOString().split('T')[0];
  
  const todayAttendance = attendance.filter(record => 
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
                    <Text style={styles.locationText}>
                      📍 {getLocationName(stats.location)}
                    </Text>
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
    const sortedAttendance = [...attendance].sort((a, b) => 
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
              <Text style={styles.recordLocation}>
                📍 {getLocationName(record.workLocationId)}
              </Text>
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
    fontSize: 14,
    color: '#64748b',
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
    fontSize: 14,
    color: '#64748b',
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
});