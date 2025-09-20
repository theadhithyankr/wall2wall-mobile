import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Tool, WorkLocation, Worker, Assignment, AttendanceRecord, DashboardStats, User } from '@/src/types';

interface DataState {
  // Data
  tools: Tool[];
  locations: WorkLocation[];
  workers: Worker[];
  managers: User[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  
  // Loading states
  isLoading: boolean;
  
  // Tools
  addTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  
  // Locations
  addLocation: (location: Omit<WorkLocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<WorkLocation>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  
  // Workers
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  
  // Managers
  addManager: (manager: Omit<User, 'id' | 'createdAt' | 'role'>) => Promise<void>;
  updateManager: (id: string, updates: Partial<User>) => Promise<void>;
  deleteManager: (id: string) => Promise<void>;
  
  // Assignments
  assignTool: (toolId: string, locationId: string, notes?: string, expectedReturn?: string) => Promise<void>;
  unassignTool: (toolId: string) => Promise<void>;
  
  // Attendance
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  
  // Stats
  getDashboardStats: () => DashboardStats;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const [DataProvider, useData] = createContextHook(() => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [toolsData, locationsData, workersData, managersData, assignmentsData, attendanceData] = await Promise.all([
        AsyncStorage.getItem('tools'),
        AsyncStorage.getItem('locations'),
        AsyncStorage.getItem('workers'),
        AsyncStorage.getItem('managers'),
        AsyncStorage.getItem('assignments'),
        AsyncStorage.getItem('attendance')
      ]);

      if (toolsData) setTools(JSON.parse(toolsData));
      if (locationsData) setLocations(JSON.parse(locationsData));
      if (workersData) setWorkers(JSON.parse(workersData));
      if (managersData) setManagers(JSON.parse(managersData));
      if (assignmentsData) setAssignments(JSON.parse(assignmentsData));
      if (attendanceData) setAttendance(JSON.parse(attendanceData));
      
      // Load sample data if empty
      if (!toolsData || !locationsData || !workersData) {
        await loadSampleData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = async () => {
    const sampleLocations: WorkLocation[] = [
      {
        id: 'loc-1',
        name: 'Downtown Office Renovation',
        address: '123 Business District, Mumbai',
        city: 'Mumbai',
        contactPerson: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        notes: 'High-end office renovation project',
        latitude: 19.0760,
        longitude: 72.8777,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'loc-2',
        name: 'Residential Villa Project',
        address: '456 Green Valley, Pune',
        city: 'Pune',
        contactPerson: 'Priya Sharma',
        contactPhone: '+91 87654 32109',
        notes: 'Luxury villa interior design',
        latitude: 18.5204,
        longitude: 73.8567,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const sampleTools: Tool[] = [
      {
        id: 'tool-1',
        name: 'Bosch Professional Drill',
        category: 'Drill',
        ownershipType: 'In-House',
        status: 'Available',
        condition: 'Good',
        notes: 'Recently serviced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tool-2',
        name: 'Concrete Mixer',
        category: 'Mixer',
        ownershipType: 'Rented',
        status: 'Assigned',
        condition: 'Good',
        currentWorkLocationId: 'loc-1',
        vendorName: 'Equipment Rentals Ltd',
        vendorContact: '+91 99887 76655',
        rentalStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        rentalCost: 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const sampleWorkers: Worker[] = [
      {
        id: 'worker-1',
        name: 'Amit Singh',
        phone: '+91 98765 11111',
        skill: 'Carpenter',
        defaultLocationId: 'loc-1',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'worker-2',
        name: 'Suresh Patel',
        phone: '+91 98765 22222',
        skill: 'Electrician',
        defaultLocationId: 'loc-2',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setLocations(sampleLocations);
    setTools(sampleTools);
    setWorkers(sampleWorkers);
    
    await Promise.all([
      AsyncStorage.setItem('locations', JSON.stringify(sampleLocations)),
      AsyncStorage.setItem('tools', JSON.stringify(sampleTools)),
      AsyncStorage.setItem('workers', JSON.stringify(sampleWorkers))
    ]);
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Tool operations
  const addTool = async (toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTool: Tool = {
      ...toolData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedTools = [...tools, newTool];
    setTools(updatedTools);
    await saveData('tools', updatedTools);
  };

  const updateTool = async (id: string, updates: Partial<Tool>) => {
    const updatedTools = tools.map(tool => 
      tool.id === id ? { ...tool, ...updates, updatedAt: new Date().toISOString() } : tool
    );
    setTools(updatedTools);
    await saveData('tools', updatedTools);
  };

  const deleteTool = async (id: string) => {
    const updatedTools = tools.filter(tool => tool.id !== id);
    setTools(updatedTools);
    await saveData('tools', updatedTools);
  };

  // Location operations
  const addLocation = async (locationData: Omit<WorkLocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLocation: WorkLocation = {
      ...locationData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    await saveData('locations', updatedLocations);
  };

  const updateLocation = async (id: string, updates: Partial<WorkLocation>) => {
    const updatedLocations = locations.map(location => 
      location.id === id ? { ...location, ...updates, updatedAt: new Date().toISOString() } : location
    );
    setLocations(updatedLocations);
    await saveData('locations', updatedLocations);
  };

  const deleteLocation = async (id: string) => {
    const updatedLocations = locations.filter(location => location.id !== id);
    setLocations(updatedLocations);
    await saveData('locations', updatedLocations);
  };

  // Worker operations
  const addWorker = async (workerData: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorker: Worker = {
      ...workerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedWorkers = [...workers, newWorker];
    setWorkers(updatedWorkers);
    await saveData('workers', updatedWorkers);
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    const updatedWorkers = workers.map(worker => 
      worker.id === id ? { ...worker, ...updates, updatedAt: new Date().toISOString() } : worker
    );
    setWorkers(updatedWorkers);
    await saveData('workers', updatedWorkers);
  };

  const deleteWorker = async (id: string) => {
    const updatedWorkers = workers.filter(worker => worker.id !== id);
    setWorkers(updatedWorkers);
    await saveData('workers', updatedWorkers);
  };

  // Manager operations
  const addManager = async (managerData: Omit<User, 'id' | 'createdAt' | 'role'>) => {
    const newManager: User = {
      ...managerData,
      id: generateId(),
      role: 'Manager',
      createdAt: new Date().toISOString()
    };
    const updatedManagers = [...managers, newManager];
    setManagers(updatedManagers);
    await saveData('managers', updatedManagers);
  };

  const updateManager = async (id: string, updates: Partial<User>) => {
    const updatedManagers = managers.map(manager => 
      manager.id === id ? { ...manager, ...updates } : manager
    );
    setManagers(updatedManagers);
    await saveData('managers', updatedManagers);
  };

  const deleteManager = async (id: string) => {
    const updatedManagers = managers.filter(manager => manager.id !== id);
    setManagers(updatedManagers);
    await saveData('managers', updatedManagers);
  };

  // Assignment operations
  const assignTool = async (toolId: string, locationId: string, notes?: string, expectedReturn?: string) => {
    const assignment: Assignment = {
      id: generateId(),
      toolId,
      workLocationId: locationId,
      assignedBy: 'manager-1',
      assignedOn: new Date().toISOString(),
      expectedReturnDate: expectedReturn,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedAssignments = [...assignments, assignment];
    setAssignments(updatedAssignments);
    await saveData('assignments', updatedAssignments);
    
    // Update tool status
    await updateTool(toolId, { 
      status: 'Assigned', 
      currentWorkLocationId: locationId 
    });
  };

  const unassignTool = async (toolId: string) => {
    const updatedAssignments = assignments.filter(a => a.toolId !== toolId);
    setAssignments(updatedAssignments);
    await saveData('assignments', updatedAssignments);
    
    // Update tool status
    await updateTool(toolId, { 
      status: 'Available', 
      currentWorkLocationId: undefined 
    });
  };

  // Attendance operations
  const recordAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    const updatedAttendance = [...attendance, newRecord];
    setAttendance(updatedAttendance);
    setAttendance(updatedAttendance);
    await saveData('attendance', updatedAttendance);
  };

  // Dashboard stats
  const getDashboardStats = (): DashboardStats => {
    const toolsAvailable = tools.filter(t => t.status === 'Available').length;
    const toolsAssigned = tools.filter(t => t.status === 'Assigned').length;
    
    const today = new Date().toISOString().split('T')[0];
    const rentedTools = tools.filter(t => t.ownershipType === 'Rented' && t.expectedReturnDate);
    const rentedToolsDueToday = rentedTools.filter(t => 
      t.expectedReturnDate?.split('T')[0] === today
    ).length;
    const rentedToolsOverdue = rentedTools.filter(t => 
      t.expectedReturnDate && new Date(t.expectedReturnDate) < new Date()
    ).length;
    
    const activeLocations = locations.length;
    
    const todayAttendance = attendance.filter(a => 
      a.dateTime.split('T')[0] === today && a.action === 'Clock In'
    );
    const workersClocked = new Set(todayAttendance.map(a => a.workerId)).size;
    
    return {
      toolsAvailable,
      toolsAssigned,
      rentedToolsDueToday,
      rentedToolsOverdue,
      activeLocations,
      workersClocked
    };
  };

  return {
    tools,
    locations,
    workers,
    managers,
    assignments,
    attendance,
    isLoading,
    addTool,
    updateTool,
    deleteTool,
    addLocation,
    updateLocation,
    deleteLocation,
    addWorker,
    updateWorker,
    deleteWorker,
    addManager,
    updateManager,
    deleteManager,
    assignTool,
    unassignTool,
    recordAttendance,
    getDashboardStats
  } as DataState;
});