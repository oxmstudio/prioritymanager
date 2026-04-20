export type Priority = 'A' | 'B';
export type TaskStatus = 'active' | 'completed' | 'delegated' | 'deleted';
export type TriageDecision = 'do' | 'date' | 'delegate' | 'delete';
export type GoalType = 'annual' | 'monthly';
export type WorkType = 'operational' | 'project';
export type DependencyType = 'independent' | 'dependent' | 'blocks';
export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type WorkflowStage = 'deciding' | 'doing' | 'delivering';
export type DelegationStatus = 'waiting' | 'in_progress' | 'returned' | 'complete';

export interface Settings {
  userName: string;
  workdayStart: string;
  workdayEnd: string;
  biologicalPeakStart: string;
  biologicalPeakEnd: string;
  monthlyFocus: string;
  topPriorities: string[];
}

export interface RoleProfile {
  id: string;
  name: string;
  mission?: string;
  values?: string;
  priorityTheme?: string;
}

export interface PlanningProfile {
  mission: string;
  purpose: string;
  values: string;
  priorityThemes: string[];
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
  sourceType?: 'manual' | 'triage' | 'communication' | 'goal' | 'someday' | 'delegation';
  sourceId?: string;
  linkedGoalId?: string;
  linkedRoleId?: string;
  stage?: WorkflowStage;
  workType?: WorkType;
  dependencyType?: DependencyType;
  dependsOnTaskId?: string;
  blocksTaskId?: string;
  quadrant?: Quadrant;
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
  quadrant?: Quadrant;
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
  delegationId?: string;
  commitmentId?: string;
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
  linkedRoleId?: string;
  stage?: WorkflowStage;
}

export interface SomedayItem {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  linkedRoleId?: string;
  activatedTaskId?: string;
  activatedGoalId?: string;
}

export interface DelegationItem {
  id: string;
  title: string;
  delegatedTo: string;
  owner: string;
  whyThisPerson: string;
  writtenInstruction: string;
  agreedAction: string;
  agreedDueDate: string;
  followUpDate: string;
  evaluationNotes?: string;
  status: DelegationStatus;
  linkedTaskId?: string;
  linkedCommunicationEntryId?: string;
}

export interface CommitmentOutcome {
  id: string;
  title: string;
  deliveredTo: string;
  communicationSummary: string;
  commitmentMade: string;
  followUpRequired: string;
  nextFollowUpDate?: string;
  linkedCommunicationEntryId?: string;
}

export interface Scorecard {
  date: string;
  wins: [string, string, string];
  notes?: string;
}

export interface PlannerState {
  settings: Settings;
  planningProfile: PlanningProfile;
  roles: RoleProfile[];
  appointments: Appointment[];
  tasks: Task[];
  triageItems: TriageItem[];
  contacts: Contact[];
  communicationEntries: CommunicationEntry[];
  goals: Goal[];
  somedayItems: SomedayItem[];
  delegationItems: DelegationItem[];
  commitmentOutcomes: CommitmentOutcome[];
  scorecards: Scorecard[];
}
