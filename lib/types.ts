export type Priority = 'A' | 'B';
export type TaskStatus = 'active' | 'completed' | 'delegated' | 'deleted';
export type TriageDecision = 'do' | 'date' | 'delegate' | 'delete';
export type GoalType = 'annual' | 'monthly';

export interface Settings {
  userName: string;
  workdayStart: string;
  workdayEnd: string;
  biologicalPeakStart: string;
  biologicalPeakEnd: string;
  monthlyFocus: string;
  topPriorities: string[];
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  priority: Priority;
  status: TaskStatus;
  sourceType?: 'manual' | 'triage' | 'communication' | 'goal' | 'someday';
  sourceId?: string;
  linkedGoalId?: string;
  timeBlockStart?: string;
  timeBlockEnd?: string;
  delegatedTo?: string;
  followUpDate?: string;
  completedAt?: string;
}

export interface TriageItem {
  id: string;
  text: string;
  capturedAt: string;
  decision: TriageDecision;
  resultingTaskId?: string;
  activationDate?: string;
  delegatedTo?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface CommunicationEntry {
  id: string;
  contactId: string;
  happenedAt: string;
  iSaid: string;
  theySaid: string;
  agreement?: string;
  followUpDate?: string;
  linkedTaskId?: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  specific: string;
  measurable: string;
  attainable: string;
  relevant: string;
  trackable: string;
  active: boolean;
}

export interface SomedayItem {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  activatedTaskId?: string;
  activatedGoalId?: string;
}

export interface Scorecard {
  date: string;
  wins: [string, string, string];
  notes?: string;
}

export interface PlannerState {
  settings: Settings;
  appointments: Appointment[];
  tasks: Task[];
  triageItems: TriageItem[];
  contacts: Contact[];
  communicationEntries: CommunicationEntry[];
  goals: Goal[];
  somedayItems: SomedayItem[];
  scorecards: Scorecard[];
}
