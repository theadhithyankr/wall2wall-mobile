export type ToolOwnership = 'In-House' | 'Rented';
export type ToolStatus = 'Available' | 'Assigned' | 'Under Maintenance' | 'Returned';

export interface Tool {
  id: string;
  name: string;
  category: string;
  ownership: ToolOwnership;
  status: ToolStatus;
  condition: string;
  location?: string;
  assignedTo?: string;
  photos?: string[];
  lastMaintenance?: Date;
  maintenanceHistory?: {
    date: Date;
    description: string;
    performedBy: string;
  }[];
  rental?: {
    vendor: string;
    startDate: Date;
    endDate: Date;
    cost: number;
    agreementUrl?: string;
  };
  assignmentHistory: {
    date: Date;
    location: string;
    assignedTo: string;
    returnDate?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolFilter {
  search?: string;
  status?: ToolStatus;
  ownership?: ToolOwnership;
  location?: string;
  category?: string;
}