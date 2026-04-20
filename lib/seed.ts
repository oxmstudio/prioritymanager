import { addDays, todayIso } from './date';
import type {
  CommitmentOutcome,
  DelegationItem,
  Goal,
  PlannerState,
  PlanningProfile,
  RoleProfile,
  Task,
} from './types';

const defaultPlanningProfile: PlanningProfile = {
  mission: 'Run a calm, reliable priority workflow from deciding to delivery.',
  purpose: 'Turn ideas into outcomes with clear decisions, focused execution, and accountable follow-up.',
  values: 'Clarity, consistency, ownership, and respectful communication.',
  priorityThemes: ['Protect deep work', 'Close loops daily', 'Deliver with clear follow-up'],
};

const defaultRoles: RoleProfile[] = [
  { id: 'role-owner', name: 'Owner', mission: 'Set direction and final priorities.', priorityTheme: 'Strategic focus' },
  { id: 'role-operator', name: 'Operator', mission: 'Run reliable routines and systems.', priorityTheme: 'Operational quality' },
  { id: 'role-creator', name: 'Creator', mission: 'Build and ship meaningful work.', priorityTheme: 'Output and craft' },
  { id: 'role-partner', name: 'Partner', mission: 'Maintain trusted relationships.', priorityTheme: 'Communication and alignment' },
  { id: 'role-health', name: 'Health', mission: 'Protect sustainable energy.', priorityTheme: 'Protected time and recovery' },
];

export function normalizeSeedState(): PlannerState {
  const today = todayIso();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  return {
    settings: {
      userName: 'Planner',
      workdayStart: '07:00',
      workdayEnd: '18:00',
      biologicalPeakStart: '09:00',
      biologicalPeakEnd: '10:30',
      monthlyFocus: 'Calm execution through right priorities.',
      topPriorities: ['Protect deep work', 'Clear mind traffic daily', 'Close each day with tomorrow planned'],
    },
    planningProfile: defaultPlanningProfile,
    roles: defaultRoles,
    appointments: [
      {
        id: 'apt-1',
        title: 'Weekly leadership call',
        date: today,
        start: '11:00',
        end: '11:30',
        notes: 'Review open commitments and blockers.',
      },
      {
        id: 'apt-2',
        title: 'Client strategy review',
        date: tomorrow,
        start: '14:00',
        end: '15:00',
      },
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Finalize monthly planning template',
        description: 'Refine the planner layout and monthly focus prompts.',
        date: today,
        priority: 'A',
        status: 'active',
        sourceType: 'manual',
        stage: 'doing',
        workType: 'operational',
        dependencyType: 'independent',
        linkedRoleId: 'role-operator',
        quadrant: 'Q2',
        timeBlockStart: '09:00',
        timeBlockEnd: '10:30',
      },
      {
        id: 'task-2',
        title: 'Review upcoming appointments',
        date: today,
        priority: 'B',
        status: 'active',
        sourceType: 'manual',
        stage: 'doing',
        workType: 'operational',
        dependencyType: 'independent',
        linkedRoleId: 'role-owner',
        quadrant: 'Q2',
      },
      {
        id: 'task-3',
        title: 'Send recap and next-step summary',
        date: tomorrow,
        priority: 'A',
        status: 'active',
        sourceType: 'communication',
        sourceId: 'comm-1',
        stage: 'delivering',
        workType: 'project',
        dependencyType: 'dependent',
        dependsOnTaskId: 'task-4',
        linkedRoleId: 'role-partner',
        quadrant: 'Q1',
        timeBlockStart: '15:30',
        timeBlockEnd: '16:00',
      },
      {
        id: 'task-4',
        title: 'Check delegated vendor quote',
        date: nextWeek,
        priority: 'B',
        status: 'delegated',
        sourceType: 'triage',
        stage: 'delivering',
        workType: 'project',
        dependencyType: 'blocks',
        blocksTaskId: 'task-3',
        delegatedTo: 'Chris',
        followUpDate: nextWeek,
        linkedRoleId: 'role-operator',
        quadrant: 'Q3',
      },
    ],
    triageItems: [
      {
        id: 'triage-1',
        text: 'Ask vendor for final quote and expected install window.',
        capturedAt: `${today}T08:15:00.000Z`,
        decision: 'delegate',
        activationDate: nextWeek,
        delegatedTo: 'Chris',
        quadrant: 'Q3',
      },
    ],
    contacts: [
      {
        id: 'contact-1',
        firstName: 'Maya',
        lastName: 'Taylor',
        company: 'Northstar Studio',
        email: 'maya@example.com',
      },
      {
        id: 'contact-2',
        firstName: 'Jordan',
        lastName: 'Lee',
        company: 'Peak Operations',
        email: 'jordan@example.com',
      },
    ],
    communicationEntries: [
      {
        id: 'comm-1',
        contactId: 'contact-1',
        happenedAt: `${today}T13:00:00.000Z`,
        iSaid: 'We will send the revised schedule and confirm dependencies by tomorrow.',
        theySaid: 'They need the recap before approving the next production step.',
        agreement: 'Send recap and proposed next steps.',
        followUpDate: tomorrow,
        linkedTaskId: 'task-3',
      },
    ],
    goals: [
      {
        id: 'goal-1',
        type: 'annual',
        title: 'Build a repeatable priority system',
        specific: 'Use one planner system to manage calendar, tasks, and follow-ups.',
        measurable: 'Use the system five days a week.',
        attainable: 'Start with a lightweight MVP and add sync later.',
        relevant: 'Reduces stress and drift between tools.',
        trackable: 'Review weekly completion trends.',
        active: true,
        linkedRoleId: 'role-owner',
        stage: 'deciding',
      },
      {
        id: 'goal-2',
        type: 'monthly',
        title: 'Protect 90 minutes of peak-time focus each workday',
        specific: 'Reserve 9:00 to 10:30 for A-priority work.',
        measurable: 'Hit at least 15 protected-time sessions this month.',
        attainable: 'The block already fits the schedule.',
        relevant: 'This is the highest-value work window.',
        trackable: 'Track on the review screen.',
        active: true,
        linkedRoleId: 'role-health',
        stage: 'deciding',
      },
    ],
    somedayItems: [
      {
        id: 'some-1',
        title: 'Create a weekly review checklist',
        note: 'Could become a reusable template after the daily flow feels right.',
        createdAt: `${today}T18:00:00.000Z`,
        linkedRoleId: 'role-operator',
      },
    ],
    delegationItems: [
      {
        id: 'delegate-1',
        title: 'Vendor quote follow-up',
        delegatedTo: 'Chris',
        owner: 'Operations',
        whyThisPerson: 'Chris owns vendor relationships and technical review.',
        writtenInstruction: 'Request final quote, timeline, and installation dependencies.',
        agreedAction: 'Send quote and timeline package.',
        agreedDueDate: nextWeek,
        followUpDate: nextWeek,
        evaluationNotes: 'Awaiting confirmation.',
        status: 'waiting',
        linkedTaskId: 'task-4',
      },
    ],
    commitmentOutcomes: [
      {
        id: 'outcome-1',
        title: 'Client recap delivered',
        deliveredTo: 'Maya Taylor',
        communicationSummary: 'Sent revised schedule and dependency notes.',
        commitmentMade: 'Confirm production-ready start date.',
        followUpRequired: 'Check approval and schedule kickoff.',
        nextFollowUpDate: tomorrow,
        linkedCommunicationEntryId: 'comm-1',
      },
    ],
    scorecards: [
      {
        date: today,
        wins: ['Protected deep work block', 'Clarified three open items', 'Closed the day with tomorrow planned'],
        notes: 'Light day, strong momentum.',
      },
    ],
  };
}

export function normalizePlannerState(raw: unknown): PlannerState {
  const seed = normalizeSeedState();
  if (!raw || typeof raw !== 'object') return seed;

  const candidate = raw as Partial<PlannerState>;

  return {
    ...seed,
    ...candidate,
    planningProfile: {
      ...seed.planningProfile,
      ...(candidate.planningProfile ?? {}),
      priorityThemes: Array.isArray(candidate.planningProfile?.priorityThemes)
        ? candidate.planningProfile?.priorityThemes ?? []
        : seed.planningProfile.priorityThemes,
    },
    roles: Array.isArray(candidate.roles) && candidate.roles.length > 0 ? candidate.roles : seed.roles,
    tasks: Array.isArray(candidate.tasks)
      ? candidate.tasks.map((task) => normalizeTask(task))
      : seed.tasks,
    goals: Array.isArray(candidate.goals)
      ? candidate.goals.map((goal) => ({ ...goal, stage: goal.stage ?? 'deciding' }))
      : seed.goals,
    triageItems: Array.isArray(candidate.triageItems) ? candidate.triageItems : seed.triageItems,
    communicationEntries: Array.isArray(candidate.communicationEntries)
      ? candidate.communicationEntries
      : seed.communicationEntries,
    somedayItems: Array.isArray(candidate.somedayItems) ? candidate.somedayItems : seed.somedayItems,
    delegationItems: Array.isArray(candidate.delegationItems) ? candidate.delegationItems : seed.delegationItems,
    commitmentOutcomes: Array.isArray(candidate.commitmentOutcomes)
      ? candidate.commitmentOutcomes
      : seed.commitmentOutcomes,
    appointments: Array.isArray(candidate.appointments) ? candidate.appointments : seed.appointments,
    contacts: Array.isArray(candidate.contacts) ? candidate.contacts : seed.contacts,
    scorecards: Array.isArray(candidate.scorecards) ? candidate.scorecards : seed.scorecards,
  };
}

function normalizeTask(task: Task): Task {
  return {
    ...task,
    stage: task.stage ?? 'doing',
    workType: task.workType ?? 'operational',
    dependencyType: task.dependencyType ?? 'independent',
  };
}

export function isPlannerStateShape(value: unknown): value is Partial<PlannerState> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PlannerState>;
  return Boolean(candidate.settings)
    && Array.isArray(candidate.appointments)
    && Array.isArray(candidate.tasks)
    && Array.isArray(candidate.triageItems)
    && Array.isArray(candidate.contacts)
    && Array.isArray(candidate.communicationEntries)
    && Array.isArray(candidate.goals)
    && Array.isArray(candidate.somedayItems)
    && Array.isArray(candidate.scorecards);
}

export type WorkflowTask = Task;
export type WorkflowGoal = Goal;
export type WorkflowRole = RoleProfile;
export type WorkflowDelegation = DelegationItem;
export type WorkflowCommitment = CommitmentOutcome;
