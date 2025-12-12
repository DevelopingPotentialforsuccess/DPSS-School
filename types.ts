export type Section = 'hall_study' | 'office_study' | 'class_levels';

export interface Student {
  id: string;
  fullName: string;
  behavior: string;
  level: string;
  teachers: string; // Comma separated for simplicity in UI, parsed for logic
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  contactParent: boolean;
  headTeacher: boolean;
  assistant: string;
  time: string;
  section: Section;
  isDeleted?: boolean;
}

export interface AttendanceRecord {
  id: string; // UUID
  studentId: string;
  date: string; // YYYY-MM-DD
  timeShift: string;
  status: 0 | 0.25 | 1; // 0=Present, 0.25=Permission, 1=Absent
}

export interface AppState {
  students: Student[];
  attendance: AttendanceRecord[];
  classLevels: string[];
  currentTab: Section | 'attendance';
  zoomLevel: number;
  fontSize: number;
  isFullScreen: boolean;
}

export interface AIParseResult {
  students: Partial<Student>[];
}
