import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Plus, Wrench, MapPin, Users, AlertTriangle, Clock, CheckSquare, UserCheck, FileText } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { getDashboardStats, isLoading, getUserTaskCount } = useData();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const stats = getDashboardStats();
  const taskData = getUserTaskCount();
  const isWorker = user?.role === 'Worker';
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';

  const quickActions = isWorker ? [
    // Worker Quick Actions - Limited to their own tasks and attendance
    {
      title: 'Clock In/Out',
      icon: Clock,
      color: '#059669',
      route: '/(tabs)/attendance',
      testId: 'quick-attendance'
    },
    {
      title: 'My Tools',
      icon: Wrench,
      color: '#2563eb',
      route: '/(tabs)/tools',
      testId: 'quick-my-tools'
    },
    {
      title: 'Assign Tool',
      icon: Plus,
      color: '#dc2626',
      route: '/assign-tool',
      testId: 'quick-assign-tool'
    },
    {
      title: 'Todo List',
      icon: CheckSquare,
      color: '#f59e0b',
      route: '/todo-list',
      testId: 'quick-todo-list'
    },
    {
      title: 'Locations',
      icon: MapPin,
      color: '#7c3aed',
      route: '/(tabs)/locations',
      testId: 'quick-locations'
    }
  ] : isManager ? [
    // Manager Quick Actions - Full management capabilities
    {
      title: 'Add Tool',
      icon: Wrench,
      color: '#2563eb',
      route: '/add-tool',
      testId: 'quick-add-tool'
    },
    {
      title: 'Add Location',
      icon: MapPin,
      color: '#059669',
      route: '/add-location',
      testId: 'quick-add-location'
    },
    {
      title: 'Add Worker',
      icon: Users,
      color: '#7c3aed',
      route: '/add-worker',
      testId: 'quick-add-worker'
    },
    {
      title: 'Assign Tool',
      icon: Plus,
      color: '#dc2626',
      route: '/assign-tool',
      testId: 'quick-assign-tool'
    },
    {
      title: 'Todo List',
      icon: CheckSquare,
      color: '#f59e0b',
      route: '/todo-list',
      testId: 'quick-todo-list'
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: '#059669',
      route: '/(tabs)/attendance',
      testId: 'quick-attendance'
    },
    {
      title: 'Workers',
      icon: Users,
      color: '#6366f1',
      route: '/workers',
      testId: 'quick-workers'
    },
    {
      title: 'Reports',
      icon: FileText,
      color: '#8b5cf6',
      route: '/attendance-report',
      testId: 'quick-reports'
    }
  ] : [
    // Admin Quick Actions - Complete system access
    {
      title: 'Add Tool',
      icon: Wrench,
      color: '#2563eb',
      route: '/add-tool',
      testId: 'quick-add-tool'
    },
    {
      title: 'Add Location',
      icon: MapPin,
      color: '#059669',
      route: '/add-location',
      testId: 'quick-add-location'
    },
    {
      title: 'Add Worker',
      icon: Users,
      color: '#7c3aed',
      route: '/add-worker',
      testId: 'quick-add-worker'
    },
    {
      title: 'Add Manager',
      icon: UserCheck,
      color: '#f59e0b',
      route: '/add-manager',
      testId: 'quick-add-manager'
    },
    {
      title: 'Assign Tool',
      icon: Plus,
      color: '#dc2626',
      route: '/assign-tool',
      testId: 'quick-assign-tool'
    },
    {
      title: 'Todo List',
      icon: CheckSquare,
      color: '#f59e0b',
      route: '/todo-list',
      testId: 'quick-todo-list'
    },
    {
      title: 'Workers',
      icon: Users,
      color: '#6366f1',
      route: '/workers',
      testId: 'quick-workers'
    },
    {
      title: 'Managers',
      icon: UserCheck,
      color: '#8b5cf6',
      route: '/managers',
      testId: 'quick-managers'
    },
    {
      title: 'Reports',
      icon: FileText,
      color: '#10b981',
      route: '/attendance-report',
      testId: 'quick-reports'
    }
  ];

  const alerts = [];
  if (stats.rentedToolsOverdue > 0) {
    alerts.push({
      type: 'error',
      title: 'Overdue Tools',
      message: `${stats.rentedToolsOverdue} rented tool${stats.rentedToolsOverdue > 1 ? 's' : ''} overdue`,
      icon: AlertTriangle
    });
  }
  if (stats.rentedToolsDueToday > 0) {
    alerts.push({
      type: 'warning',
      title: 'Due Today',
      message: `${stats.rentedToolsDueToday} rented tool${stats.rentedToolsDueToday > 1 ? 's' : ''} due today`,
      icon: Clock
    });
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>{isWorker ? 'My Dashboard' : 'Dashboard'}</Text>
        <Text style={styles.subtitle}>
          {isWorker ? 'Your Tasks and Attendance' : 'Interior Design Operations'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.kpiGrid}>
            {isWorker ? (
              <>
                <TouchableOpacity 
                  style={styles.kpiCard}
                  onPress={() => router.push('/todo-list')}
                  testID="tasks-card"
                >
                  <View style={styles.kpiHeader}>
                    <CheckSquare size={20} color="#2563eb" />
                    <Text style={styles.kpiLabel}>Tasks</Text>
                  </View>
                  <Text style={styles.kpiValue}>{taskData.totalTasks}</Text>
                  <Text style={styles.kpiSubtext}>Assigned</Text>
                  <Text style={styles.kpiSecondary}>{taskData.dueToday} Due Today</Text>
                </TouchableOpacity>

                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <Clock size={20} color="#059669" />
                    <Text style={styles.kpiLabel}>Hours</Text>
                  </View>
                  <Text style={styles.kpiValue}>8.5</Text>
                  <Text style={styles.kpiSubtext}>Today</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <Wrench size={20} color="#2563eb" />
                    <Text style={styles.kpiLabel}>Tools</Text>
                  </View>
                  <Text style={styles.kpiValue}>{stats.toolsAvailable}</Text>
                  <Text style={styles.kpiSubtext}>Available</Text>
                  <Text style={styles.kpiSecondary}>{stats.toolsAssigned} Assigned</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <MapPin size={20} color="#059669" />
                    <Text style={styles.kpiLabel}>Locations</Text>
                  </View>
                  <Text style={styles.kpiValue}>{stats.activeLocations}</Text>
                  <Text style={styles.kpiSubtext}>Active</Text>
                </View>

                {isAdmin && (
                  <View style={styles.kpiCard}>
                    <View style={styles.kpiHeader}>
                      <Users size={20} color="#7c3aed" />
                      <Text style={styles.kpiLabel}>Workers</Text>
                    </View>
                    <Text style={styles.kpiValue}>{stats.workersClocked}</Text>
                    <Text style={styles.kpiSubtext}>Clocked In</Text>
                  </View>
                )}

                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <Clock size={20} color="#dc2626" />
                    <Text style={styles.kpiLabel}>Rentals</Text>
                  </View>
                  <Text style={styles.kpiValue}>{stats.rentedToolsDueToday}</Text>
                  <Text style={styles.kpiSubtext}>Due Today</Text>
                  {stats.rentedToolsOverdue > 0 && (
                    <Text style={styles.kpiOverdue}>{stats.rentedToolsOverdue} Overdue</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            <View style={styles.alertsList}>
              {alerts.map((alert, index) => {
                const IconComponent = alert.icon;
                return (
                  <View
                    key={`alert-${alert.type}-${index}`}
                    style={[
                      styles.alertCard,
                      alert.type === 'error' ? styles.alertError : styles.alertWarning
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={alert.type === 'error' ? '#dc2626' : '#d97706'}
                    />
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={`action-${action.testId}`}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                  testID={action.testId}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                    <IconComponent size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiSecondary: {
    fontSize: 12,
    color: '#9ca3af',
  },
  kpiOverdue: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  alertError: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  alertWarning: {
    borderColor: '#fed7aa',
    backgroundColor: '#fffbeb',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748b',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
