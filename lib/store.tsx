'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { nowIso, todayIso } from './date';
import { isPlannerStateShape, normalizePlannerState, normalizeSeedState } from './seed';
import type {
  Appointment,
  CommitmentOutcome,
  CommunicationEntry,
  Contact,
  DelegationItem,
  Goal,
  PlannerState,
  PlanningProfile,
  Priority,
  RoleProfile,
  Scorecard,
  SomedayItem,
  Task,
  TriageDecision,
  TriageItem,
} from './types';

const STORAGE_KEY = 'priority-manager-mvp-state';
const SAVE_DEBOUNCE_MS = 800;

interface PlannerApiResponse {
  state: PlannerState;
  source: 'blob' | 'seed';
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readLocalState(): { state: PlannerState; hasLocalData: boolean } {
  if (typeof window === 'undefined') {
    return { state: normalizeSeedState(), hasLocalData: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: normalizeSeedState(), hasLocalData: false };
    return { state: normalizePlannerState(JSON.parse(raw) as unknown), hasLocalData: true };
  } catch {
    return { state: normalizeSeedState(), hasLocalData: false };
  }
}

interface PlannerContextValue {
  state: PlannerState;
  isLoaded: boolean;
  updatePlanningProfile: (input: PlanningProfile) => void;
  addRole: (input: Omit<RoleProfile, 'id'>) => void;
  addAppointment: (input: Omit<Appointment, 'id'>) => void;
  addTask: (input: Omit<Task, 'id' | 'status'> & { status?: Task['status'] }) => string;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  toggleTaskComplete: (taskId: string) => void;
  scheduleTaskDate: (taskId: string, date: string) => void;
  addTriageDecision: (input: {
    text: string;
    decision: TriageDecision;
    activationDate?: string;
    delegatedTo?: string;
    priority?: Priority;
    title?: string;
    quadrant?: TriageItem['quadrant'];
  }) => void;
  addContact: (input: Omit<Contact, 'id'>) => string;
  addCommunicationEntry: (input: Omit<CommunicationEntry, 'id' | 'linkedTaskId'>) => void;
  createFollowUpTask: (entryId: string, title: string, date: string, priority: Priority) => void;
  addGoal: (input: Omit<Goal, 'id' | 'active'> & { active?: boolean }) => void;
  toggleGoalActive: (goalId: string) => void;
  addSomedayItem: (input: Omit<SomedayItem, 'id' | 'createdAt'>) => void;
  activateSomedayToTask: (itemId: string, date: string) => void;
  addDelegationItem: (input: Omit<DelegationItem, 'id'>) => void;
  updateDelegationItem: (id: string, patch: Partial<DelegationItem>) => void;
  addCommitmentOutcome: (input: Omit<CommitmentOutcome, 'id'>) => void;
  setScorecard: (scorecard: Scorecard) => void;
  exportState: () => string;
  importState: (raw: string) => { ok: boolean; message: string };
  resetState: () => void;
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlannerState>(normalizeSeedState());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      const local = readLocalState();
      let nextState = local.state;

      try {
        const response = await fetch('/api/planner-state', { cache: 'no-store' });
        if (response.ok) {
          const payload = (await response.json()) as PlannerApiResponse;
          if (payload.source === 'blob' || !local.hasLocalData) {
            nextState = normalizePlannerState(payload.state);
          }
        }
      } catch {
        nextState = local.state;
      }

      if (!isCancelled) {
        setState(nextState);
        setIsLoaded(true);
      }
    }

    void bootstrap();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetch('/api/planner-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => undefined);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isLoaded, state]);

  const value = useMemo<PlannerContextValue>(() => ({
    state,
    isLoaded,
    updatePlanningProfile(input) {
      setState((current) => ({ ...current, planningProfile: input }));
    },
    addRole(input) {
      setState((current) => ({ ...current, roles: [{ ...input, id: makeId('role') }, ...current.roles] }));
    },
    addAppointment(input) {
      setState((current) => ({ ...current, appointments: [...current.appointments, { ...input, id: makeId('apt') }] }));
    },
    addTask(input) {
      const id = makeId('task');
      setState((current) => ({
        ...current,
        tasks: [...current.tasks, { ...input, id, status: input.status ?? 'active', stage: input.stage ?? 'doing' }],
      }));
      return id;
    },
    updateTask(taskId, patch) {
      setState((current) => ({ ...current, tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)) }));
    },
    toggleTaskComplete(taskId) {
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const isCompleting = task.status !== 'completed';
          return { ...task, status: isCompleting ? 'completed' : 'active', completedAt: isCompleting ? nowIso() : undefined };
        }),
      }));
    },
    scheduleTaskDate(taskId, date) {
      setState((current) => ({ ...current, tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, date } : task)) }));
    },
    addTriageDecision(input) {
      const triageId = makeId('triage');
      const baseItem: TriageItem = {
        id: triageId,
        text: input.text,
        capturedAt: nowIso(),
        decision: input.decision,
        activationDate: input.activationDate,
        delegatedTo: input.delegatedTo,
        quadrant: input.quadrant,
      };

      setState((current) => {
        const nextState: PlannerState = { ...current, triageItems: [baseItem, ...current.triageItems] };
        if (input.decision === 'delete') return nextState;

        const taskId = makeId('task');
        const task: Task = {
          id: taskId,
          title: input.title?.trim() || input.text,
          description: input.text,
          date: input.activationDate || todayIso(),
          priority: input.priority || 'B',
          status: input.decision === 'delegate' ? 'delegated' : 'active',
          sourceType: 'triage',
          sourceId: triageId,
          delegatedTo: input.delegatedTo,
          followUpDate: input.activationDate,
          stage: input.decision === 'delegate' ? 'delivering' : 'doing',
          workType: input.decision === 'delegate' ? 'project' : 'operational',
          dependencyType: 'independent',
          quadrant: input.quadrant,
        };

        nextState.triageItems = nextState.triageItems.map((item) => (item.id === triageId ? { ...item, resultingTaskId: taskId } : item));
        nextState.tasks = [task, ...current.tasks];
        return nextState;
      });
    },
    addContact(input) {
      const id = makeId('contact');
      setState((current) => ({
        ...current,
        contacts: [...current.contacts, { ...input, id }].sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)),
      }));
      return id;
    },
    addCommunicationEntry(input) {
      setState((current) => ({ ...current, communicationEntries: [{ ...input, id: makeId('comm') }, ...current.communicationEntries] }));
    },
    createFollowUpTask(entryId, title, date, priority) {
      const taskId = makeId('task');
      setState((current) => ({
        ...current,
        tasks: [{ id: taskId, title, date, priority, status: 'active', sourceType: 'communication', sourceId: entryId, stage: 'delivering', workType: 'operational', dependencyType: 'independent' }, ...current.tasks],
        communicationEntries: current.communicationEntries.map((entry) => (entry.id === entryId ? { ...entry, linkedTaskId: taskId, followUpDate: date } : entry)),
      }));
    },
    addGoal(input) {
      setState((current) => ({ ...current, goals: [{ ...input, id: makeId('goal'), active: input.active ?? true, stage: input.stage ?? 'deciding' }, ...current.goals] }));
    },
    toggleGoalActive(goalId) {
      setState((current) => ({ ...current, goals: current.goals.map((goal) => (goal.id === goalId ? { ...goal, active: !goal.active } : goal)) }));
    },
    addSomedayItem(input) {
      setState((current) => ({ ...current, somedayItems: [{ ...input, id: makeId('some'), createdAt: nowIso() }, ...current.somedayItems] }));
    },
    activateSomedayToTask(itemId, date) {
      setState((current) => {
        const somedayItem = current.somedayItems.find((item) => item.id === itemId);
        if (!somedayItem) return current;
        const taskId = makeId('task');
        return {
          ...current,
          tasks: [{ id: taskId, title: somedayItem.title, description: somedayItem.note, date, priority: 'B', status: 'active', sourceType: 'someday', sourceId: itemId, stage: 'deciding', workType: 'project', dependencyType: 'independent', linkedRoleId: somedayItem.linkedRoleId }, ...current.tasks],
          somedayItems: current.somedayItems.map((item) => (item.id === itemId ? { ...item, activatedTaskId: taskId } : item)),
        };
      });
    },
    addDelegationItem(input) {
      setState((current) => ({ ...current, delegationItems: [{ ...input, id: makeId('delegate') }, ...current.delegationItems] }));
    },
    updateDelegationItem(id, patch) {
      setState((current) => ({ ...current, delegationItems: current.delegationItems.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
    },
    addCommitmentOutcome(input) {
      setState((current) => ({ ...current, commitmentOutcomes: [{ ...input, id: makeId('outcome') }, ...current.commitmentOutcomes] }));
    },
    setScorecard(scorecard) {
      setState((current) => {
        const existing = current.scorecards.find((item) => item.date === scorecard.date);
        if (!existing) return { ...current, scorecards: [scorecard, ...current.scorecards] };
        return { ...current, scorecards: current.scorecards.map((item) => (item.date === scorecard.date ? scorecard : item)) };
      });
    },
    exportState() {
      return JSON.stringify(state, null, 2);
    },
    importState(raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isPlannerStateShape(parsed)) {
          return { ok: false, message: 'Import failed. JSON does not match planner shape.' };
        }
        setState(normalizePlannerState(parsed));
        return { ok: true, message: 'Import complete.' };
      } catch {
        return { ok: false, message: 'Import failed. Please paste valid JSON.' };
      }
    },
    resetState() {
      setState(normalizeSeedState());
    },
  }), [isLoaded, state]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
}
