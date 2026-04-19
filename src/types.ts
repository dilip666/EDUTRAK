export type UserRole = 'teacher' | 'principal';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface DailyReport {
  id?: string;
  teacherId: string;
  teacherName: string;
  date: string;
  week: number;
  className: string;
  syllabusStatus: string;
  dailyPlanReview: string;
  notebookCorrection: boolean;
  proxyPeriods: number;
  cwCompletion: number; // Percentage
  hwCompletion: number; // Percentage
  classTask: string;
  followUp: string;
  remedialPlan: string;
  remedialReview: string;
  studentAnecdote: string;
  disciplineIssues: string;
  assemblyRecord: string;
  principalSupport: string;
  createdAt: string;
}

export type ObservationType = 'lesson' | 'peer' | 'micro';

export interface Observation {
  id?: string;
  type: ObservationType;
  observerId: string;
  observerName: string;
  targetTeacherId: string;
  targetTeacherName: string;
  date: string;
  data: any;
  createdAt: string;
}

export interface LessonObservationData {
  subject: string;
  topic: string;
  className: string;
  section: string;
  period: string;
  criteria: {
    subjectKnowledge: number;
    languageQuality: number;
    studentEngagement: number;
    learningOutcomes: number;
    classroomCulture: number;
  };
  totalMarks: number;
  average: number;
  rating: 1 | 2 | 3 | 4; // Map to NSI-1, Fair-2, Good-3, Outstanding-4
  strengths?: string;
  areasForImprovement?: string;
  actionPlan?: string;
  feedback?: string;
}

export interface PeerObservationData {
  formType: 'A' | 'B';
  subject: string;
  topic: string;
  feedback: string;
  learningPoints: string;
}

export interface MicroTeachingData {
  skill: string;
  beforeNotes: string;
  duringNotes: string;
  afterNotes: string;
}

export interface TopicPlan {
  id?: string;
  teacherId: string;
  teacherName: string;
  className: string;
  subject: string;
  topicName: string;
  startDate: string;
  endDate: string;
  plannedPeriods: number;
  completedPeriods: number;
  createdAt: string;
}
