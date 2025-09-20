// TYPES & INTERFACES
export type ToolCategory = typeof TOOL_CATEGORIES[number];
export type WorkerSkill = typeof WORKER_SKILLS[number];
export type ToolCondition = typeof TOOL_CONDITIONS[number];
export type ToolStatus = typeof TOOL_STATUSES[number];
export type OwnershipType = typeof OWNERSHIP_TYPES[number];

// CONSTANTS
export const TOOL_CATEGORIES = [
  'Drill',
  'Saw',
  'Mixer',
  'Hammer',
  'Screwdriver',
  'Measuring Tools',
  'Safety Equipment',
  'Electrical Tools',
  'Plumbing Tools',
  'Painting Tools',
  'Other'
] as const;

export const WORKER_SKILLS = [
  'Carpenter',
  'Electrician',
  'Plumber',
  'Painter',
  'Mason',
  'Welder',
  'General Labor',
  'Supervisor',
  'Other'
] as const;

export const TOOL_CONDITIONS = [
  'Good',
  'Needs Service',
  'Damaged'
] as const;

export const TOOL_STATUSES = [
  'Available',
  'Assigned',
  'Under Maintenance',
  'Returned'
] as const;

export const OWNERSHIP_TYPES = [
  'In-House',
  'Rented'
] as const;