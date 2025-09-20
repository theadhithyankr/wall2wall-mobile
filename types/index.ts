export interface Tool {
  id: string;
  name: string;
  category: string;
  ownershipType: 'In-House' | 'Rented';
  status: 'Available' | 'Assigned' | 'Under Maintenance' | 'Returned';
  currentWorkLocationId?: string;
  condition: 'Good' | 'Needs Service' | 'Damaged';
  notes?: string;
  photos?: string[];
  
  // Rental specific fields
  vendorName?: string;
  vendorContact?: string;
  rentalStartDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  rentalCost?: number;
  rentalAgreementPhoto?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  skill?: string;
  defaultLocationId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  toolId: string;
  workLocationId: string;
  assignedBy: string;
  assignedOn: string;
  expectedReturnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  action: 'Clock In' | 'Clock Out';
  dateTime: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  workLocationId?: string;
  photo?: string;
  notes?: string;
  accuracy?: number;
  createdAt: string;
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  role: 'Manager';
  createdAt: string;
}

export interface DashboardStats {
  toolsAvailable: number;
  toolsAssigned: number;
  rentedToolsDueToday: number;
  rentedToolsOverdue: number;
  activeLocations: number;
  workersClocked: number;
}

export type ToolFilter = {
  ownership?: 'All' | 'In-House' | 'Rented';
  status?: 'All' | 'Available' | 'Assigned' | 'Under Maintenance' | 'Returned';
  category?: string;
  location?: string;
  search?: string;
};

export type AttendanceFilter = {
  date?: string;
  workerId?: string;
  locationId?: string;
};