export const TIME_SHIFTS = [
  "5:20-6:20",
  "6:40-7:40",
  "9:00-10:00",
  "10:20-11:20",
  "13:00-14:00",
  "14:20-15:20",
  "15:40-16:40",
  "17:00-18:00",
  "18:20-19:20"
];

export const INITIAL_LEVELS = [
  "Pre2All",
  "Pre2Aii",
  "1A",
  "1B",
  "2A",
  "2B",
  "3A",
  "3B",
  "4A",
  "4B",
  "5A",
  "5B"
];

export const DEFAULT_STUDENT: any = {
  fullName: "",
  behavior: "",
  level: INITIAL_LEVELS[0],
  teachers: "",
  startDate: new Date().toISOString().split('T')[0],
  deadline: "",
  contactParent: false,
  headTeacher: false,
  assistant: "",
  time: "5:20-6:20",
  section: "hall_study"
};
