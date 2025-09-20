import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { useData } from '@/src/contexts/DataContext';
import {
  Plus,
  CheckSquare,
  Square,
  Filter,
  X,
  Edit3,
  Trash2,
  AlertCircle,
  LogIn,
  Save,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { TodoItem } from '../src/types';

export default function TodoListScreen() {
  const { user } = useAuth();
  const { getVisibleTodos, canEditTodo, addTodo, updateTodo, deleteTodo, toggleTodoComplete, workers, managers, getUserTaskCount, tools, attendance } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: undefined as string | undefined,
    visibleToWorkers: true,
    editableByWorkers: false,
  });

  // Get visible todos for current user
  const visibleTodos = getVisibleTodos();
  const taskData = getUserTaskCount();
  
  // Todo permissions based on role matrix
  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  
  const canAccessTodoList = isManager || isAdmin || isWorker; // All roles can access, but see different content
  const canCreateTodos = isManager || isAdmin; // Managers and admins can create todos

  useEffect(() => {
    if (!canAccessTodoList) {
      router.replace('/');
      return;
    }
    // Todos are now loaded automatically via DataContext
  }, [canAccessTodoList]);

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the todo');
      return;
    }

    try {
      await addTodo({
        title: newTodo.title,
        description: newTodo.description,
        completed: false,
        priority: newTodo.priority,
        assignedTo: newTodo.assignedTo,
        createdBy: user?.id || '',
        visibleToWorkers: newTodo.visibleToWorkers,
        editableByWorkers: newTodo.editableByWorkers,
        visibleToRoles: newTodo.visibleToWorkers ? ['manager', 'admin', 'worker'] : ['manager', 'admin'],
        editableByRoles: newTodo.editableByWorkers ? ['manager', 'admin', 'worker'] : ['manager', 'admin'],
        updatedAt: new Date().toISOString()
      });

      setNewTodo({ 
        title: '', 
        description: '', 
        priority: 'medium',
        assignedTo: undefined,
        visibleToWorkers: true,
        editableByWorkers: false
      });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const handleToggleTodo = async (id: string) => {
    // Use the proper permission check instead of blanket worker restriction
    if (!canEditTodo(id)) {
      return;
    }
    
    try {
      await toggleTodoComplete(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleDeleteTodo = (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  const startEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      assignedTo: todo.assignedTo,
      visibleToWorkers: todo.visibleToWorkers,
      editableByWorkers: todo.editableByWorkers,
    });
    setShowAddModal(true);
  };

  const handleSaveEdit = async () => {
    if (!newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the todo');
      return;
    }

    if (editingTodo) {
      try {
        await updateTodo(editingTodo.id, {
          title: newTodo.title,
          description: newTodo.description,
          priority: newTodo.priority,
          visibleToWorkers: newTodo.visibleToWorkers,
          editableByWorkers: newTodo.editableByWorkers,
          visibleToRoles: newTodo.visibleToWorkers ? ['manager', 'admin', 'worker'] : ['manager', 'admin'],
          editableByRoles: newTodo.editableByWorkers ? ['manager', 'admin', 'worker'] : ['manager', 'admin']
        });

        setEditingTodo(null);
        setNewTodo({ 
          title: '', 
          description: '', 
          priority: 'medium',
          assignedTo: undefined,
          visibleToWorkers: true,
          editableByWorkers: false
        });
        setShowAddModal(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to update todo');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCreatorRole = (createdBy: string): string => {
    // Check if creator is current user (for admin/manager)
    if (user?.id === createdBy) {
      return user.role.toUpperCase();
    }
    
    // Check in managers list
    const manager = managers.find(m => m.id === createdBy);
    if (manager) {
      return manager.role.toUpperCase();
    }
    
    // Check in workers list (though workers shouldn't create todos)
    const worker = workers.find(w => w.id === createdBy);
    if (worker) {
      return 'WORKER';
    }
    
    // Default fallback
    return 'ADMIN';
  };

  const completedTodos = visibleTodos.filter(todo => todo.completed);
  const pendingTodos = visibleTodos.filter(todo => !todo.completed);

  // Get additional task types for workers
  const getRentedToolsDue = () => {
    if (!isWorker || !user) return [];
    const today = new Date().toISOString().split('T')[0];
    return tools.filter(t => 
      t.ownershipType === 'Rented' && 
      t.expectedReturnDate?.split('T')[0] === today &&
      t.status === 'Assigned'
    );
  };

  const needsClockIn = () => {
    if (!isWorker || !user) return false;
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => 
      a.workerId === user.id && 
      a.dateTime.split('T')[0] === today
    );
    const lastAction = todayAttendance
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0]?.action;
    
    return !lastAction || lastAction === 'Clock Out';
  };

  const rentedToolsDue = getRentedToolsDue();
  const showClockInReminder = needsClockIn();

  if (!canAccessTodoList) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isAdmin ? 'Team Todo List' : 'My Todo List'}</Text>
        {canCreateTodos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{taskData.totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{taskData.dueToday}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingTodos.length}</Text>
          <Text style={styles.statLabel}>Todos</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Clock-in reminder for workers */}
        {showClockInReminder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Tasks</Text>
            <View style={[styles.todoCard, styles.systemTaskCard]}>
              <View style={styles.todoContent}>
                <View style={styles.todoLeft}>
                  <LogIn size={20} color="#f59e0b" />
                  <View style={styles.todoText}>
                    <Text style={styles.todoTitle}>Clock In for Today</Text>
                    <Text style={styles.todoDescription}>
                      Remember to clock in to start your workday
                    </Text>
                    <View style={styles.todoMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: '#f59e0b' }]}>
                        <Text style={styles.priorityText}>DAILY</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Rented tools due today for workers */}
        {rentedToolsDue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tools to Return Today</Text>
            {rentedToolsDue.map(tool => (
              <View key={tool.id} style={[styles.todoCard, styles.systemTaskCard]}>
                <View style={styles.todoContent}>
                  <View style={styles.todoLeft}>
                    <AlertCircle size={20} color="#dc2626" />
                    <View style={styles.todoText}>
                      <Text style={styles.todoTitle}>Return {tool.name}</Text>
                      <Text style={styles.todoDescription}>
                        Rented tool due for return today
                      </Text>
                      <View style={styles.todoMeta}>
                        <View style={[styles.priorityBadge, { backgroundColor: '#dc2626' }]}>
                          <Text style={styles.priorityText}>DUE TODAY</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Regular todos */}
        {pendingTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todo Tasks</Text>
            {pendingTodos.map(todo => (
              <View key={todo.id} style={styles.todoCard}>
                <TouchableOpacity
                  style={styles.todoContent}
                  onPress={() => handleToggleTodo(todo.id)}
                >
                  <View style={styles.todoLeft}>
                    <Square size={20} color="#6b7280" />
                    <View style={styles.todoText}>
                      <Text style={styles.todoTitle}>{todo.title}</Text>
                      {todo.description ? (
                        <Text style={styles.todoDescription}>{todo.description}</Text>
                      ) : null}
                      <View style={styles.todoMeta}>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(todo.priority) }]}>
                          <Text style={styles.priorityText}>{todo.priority.toUpperCase()}</Text>
                        </View>
                        {isWorker && (
                          <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{getCreatorRole(todo.createdBy)}</Text>
                          </View>
                        )}
                        {isWorker && !canEditTodo(todo.id) && (
                          <View style={styles.readOnlyBadge}>
                            <Text style={styles.readOnlyText}>READ ONLY</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.todoActions}>
                  {canEditTodo(todo.id) && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => startEdit(todo)}
                    >
                      <Edit3 size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                  {canEditTodo(todo.id) && (
                    <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteTodo(todo.id)}
                        >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {completedTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            {completedTodos.map(todo => (
              <View key={todo.id} style={[styles.todoCard, styles.completedCard]}>
                <TouchableOpacity
                  style={styles.todoContent}
                  onPress={() => handleToggleTodo(todo.id)}
                >
                  <View style={styles.todoLeft}>
                    <CheckSquare size={20} color="#10b981" />
                    <View style={styles.todoText}>
                      <Text style={[styles.todoTitle, styles.completedText]}>{todo.title}</Text>
                      {todo.description ? (
                        <Text style={[styles.todoDescription, styles.completedText]}>
                          {todo.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
                {canEditTodo(todo.id) && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTodo(todo.id)}
                      >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {visibleTodos.length === 0 && rentedToolsDue.length === 0 && !showClockInReminder && (
          <View style={styles.emptyState}>
            <CheckSquare size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyDescription}>
              {canCreateTodos ? 'Create your first todo to get started' : 'No tasks available for you to view'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingTodo(null);
                setNewTodo({ 
                  title: '', 
                  description: '', 
                  priority: 'medium',
                  assignedTo: undefined,
                  visibleToWorkers: true,
                  editableByWorkers: false
                });
              }}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTodo ? 'Edit Todo' : 'Add New Todo'}
            </Text>
            <TouchableOpacity
              onPress={editingTodo ? handleSaveEdit : handleAddTodo}
              style={styles.saveButton}
            >
              <Save size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newTodo.title}
                onChangeText={(text) => setNewTodo({ ...newTodo, title: text })}
                placeholder="Enter todo title"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newTodo.description}
                onChangeText={(text) => setNewTodo({ ...newTodo, description: text })}
                placeholder="Enter description (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newTodo.priority === priority && styles.prioritySelected,
                      { borderColor: getPriorityColor(priority) },
                      newTodo.priority === priority && { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNewTodo({ ...newTodo, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        newTodo.priority === priority && { 
                          color: '#ffffff',
                          fontWeight: '700'
                        }
                      ]}
                    >
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Permission Controls - Only for Managers/Admins */}
            {(isManager || isAdmin) && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Visibility Settings</Text>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setNewTodo({ ...newTodo, visibleToWorkers: !newTodo.visibleToWorkers })}
                  >
                    <View style={[styles.checkbox, newTodo.visibleToWorkers && styles.checkboxChecked]}>
                      {newTodo.visibleToWorkers && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Workers</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Edit Permissions</Text>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setNewTodo({ ...newTodo, editableByWorkers: !newTodo.editableByWorkers })}
                  >
                    <View style={[styles.checkbox, newTodo.editableByWorkers && styles.checkboxChecked]}>
                      {newTodo.editableByWorkers && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Workers</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  todoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCard: {
    opacity: 0.7,
  },
  todoContent: {
    flex: 1,
    padding: 16,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  todoText: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  readOnlyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  readOnlyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  todoActions: {
    flexDirection: 'row',
    paddingRight: 16,
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  prioritySelected: {
    borderWidth: 2,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  systemTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
});