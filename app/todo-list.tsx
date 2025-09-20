import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { useData } from '@/src/contexts/DataContext';
import {
  Plus,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  X,
  Save,
  Calendar,
  Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { TodoItem } from '../src/types';

export default function TodoListScreen() {
  const { user } = useAuth();
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodoComplete } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Todo permissions based on role matrix
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';
  const isWorker = user?.role === 'Worker';
  
  const canAccessTodoList = isManager || isAdmin; // Manager CRUD, Admin oversight
  const canCreateTodos = isManager || isAdmin; // Managers and admins can create todos
  const canEditTodos = isManager || isAdmin; // Managers and admins can edit todos
  const canDeleteTodos = isManager || isAdmin; // Managers and admins can delete todos
  const canViewTodos = isManager || isAdmin; // Both can view todos

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
        assignedTo: user?.id,
        createdBy: user?.id
      });

      setNewTodo({ title: '', description: '', priority: 'medium' });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const handleToggleTodo = async (id: string) => {
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
        });

        setEditingTodo(null);
        setNewTodo({ title: '', description: '', priority: 'medium' });
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

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

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
          <Text style={styles.statNumber}>{pendingTodos.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedTodos.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todos.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {pendingTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
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
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.todoActions}>
                  {canEditTodos && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => startEdit(todo)}
                    >
                      <Edit3 size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                  {canDeleteTodos && (
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
                {canDeleteTodos && (
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

        {todos.length === 0 && (
          <View style={styles.emptyState}>
            <CheckSquare size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No todos yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first todo to get started
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
                setNewTodo({ title: '', description: '', priority: 'medium' });
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
    transition: 'all 0.2s ease',
  },
  prioritySelected: {
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});