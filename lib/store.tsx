'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { nowIso, todayIso } from './date';
import { normalizeSeedState } from './seed';
import type {
  Appointment,
  CommunicationEntry,
  Contact,
  Goal,
  PlannerState,
  Priority,
  Scorecard,
  SomedayItem,
  Task,
  TriageDecision,
  TriageItem,
} from './types';

const STORAGE_KEY = 'priority-manager-mvp-state';

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

interface PlannerContextValue {
  state: PlannerState;
  isLoaded: boolean;
  addAppointment: (input: Omit<Appointment, 'id'>) => void;
  addTask: (input: Omit<Task, 'id' | 'status'> & { status?: Task['status'] }) => string;
  toggleTaskComplete: (taskId: string) => void;
  scheduleTaskDate: (taskId: string, date: string) => void;
  addTriageDecision: (input: {
    text: string;
    decision: TriageDecision;
    activationDate?: string;
    delegatedTo?: string;
    priority?: Priority;
    title?: string;
  }) => void;
  addContact: (input: Omit<Contact, 'id'>) => string;
  addCommunicationEntry: (input: Omit<CommunicationEntry, 'id' | 'linkedTaskId'>) => void;
  createFollowUpTask: (entryId: string, title: string, date: string, priority: Priority) => void;
  addGoal: (input: Omit<Goal, 'id' | 'active'> & { active?: boolean }) => void;
  toggleGoalActive: (goalId: string) => void;
  addSomedayItem: (input: Omit<SomedayItem, 'id' | 'createdAt'>) => void;
  activateSomedayToTask: (itemId: string, date: string) => void;
  setScorecard: (scorecard: Scorecard) => void;
  exportState: () => string;
  importState: (raw: string) => { ok: boolean; message: string };
  resetState: () => void;
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

function readInitialState(): PlannerState {
  if (typeof window === 'undefined') {
    return normalizeSeedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return normalizeSeedState();
    }
    return JSON.parse(raw) as PlannerState;
  } catch {
    return normalizeSeedState();
  }
}

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlannerState>(normalizeSeedState());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(readInitialState());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isLoaded, state]);

  const value = useMemo<PlannerContextValue>(() => ({
    state,
    isLoaded,
    addAppointment(input) {
      setState((current) => ({
        ...current,
        appointments: [...current.appointments, { ...input, id: makeId('apt') }],
      }));
    },
    addTask(input) {
      const id = makeId('task');
      setState((current) => ({
        ...current,
        tasks: [
          ...current.tasks,
          {
            ...input,
            id,
            status: input.status ?? 'active',
          },
        ],
      }));
      return id;
    },
    toggleTaskComplete(taskId) {
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const isCompleting = task.status !== 'completed';
          return {
            ...task,
            status: isCompleting ? 'completed' : 'active',
            completedAt: isCompleting ? nowIso() : undefined,
          };
        }),
      }));
    },
    scheduleTaskDate(taskId, date) {
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, date } : task)),
      }));
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
      };

      setState((current) => {
        const nextState: PlannerState = {
          ...current,
          triageItems: [baseItem, ...current.triageItems],
        };

        if (input.decision === 'delete') {
          return nextState;
        }

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
        };

        nextState.triageItems = nextState.triageItems.map((item) =>
          item.id === triageId ? { ...item, resultingTaskId: taskId } : item,
        );
        nextState.tasks = [task, ...current.tasks];
        return nextState;
      });
    },
    addContact(input) {
      const id = makeId('contact');
      setState((current) => ({
        ...current,
        contacts: [...current.contacts, { ...input, id }].sort((a, b) =>
          `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`),
        ),
      }));
      return id;
    },
    addCommunicationEntry(input) {
      const entry: CommunicationEntry = {
        ...input,
        id: makeId('comm'),
      };
      setState((current) => ({
        ...current,
        communicationEntries: [entry, ...current.communicationEntries],
      }));
    },
    createFollowUpTask(entryId, title, date, priority) {
      const taskId = makeId('task');
      setState((current) => ({
        ...current,
        tasks: [
          {
            id: taskId,
            title,
            date,
            priority,
            status: 'active',
            sourceType: 'communication',
            sourceId: entryId,
          },
          ...current.tasks,
        ],
        communicationEntries: current.communicationEntries.map((entry) =>
          entry.id === entryId ? { ...entry, linkedTaskId: taskId, followUpDate: date } : entry,
        ),
      }));
    },
    addGoal(input) {
      setState((current) => ({
        ...current,
        goals: [{ ...input, id: makeId('goal'), active: input.active ?? true }, ...current.goals],
      }));
    },
    toggleGoalActive(goalId) {
      setState((current) => ({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId ? { ...goal, active: !goal.active } : goal,
        ),
      }));
    },
    addSomedayItem(input) {
      setState((current) => ({
        ...current,
        somedayItems: [
          { ...input, id: makeId('some'), createdAt: nowIso() },
          ...current.somedayItems,
        ],
      }));
    },
    activateSomedayToTask(itemId, date) {
      setState((current) => {
        const somedayItem = current.somedayItems.find((item) => item.id === itemId);
        if (!somedayItem) return current;
        const taskId = makeId('task');
        return {
          ...current,
          tasks: [
            {
              id: taskId,
              title: somedayItem.title,
              description: somedayItem.note,
              date,
              priority: 'B',
              status: 'active',
              sourceType: 'someday',
              sourceId: itemId,
            },
            ...current.tasks,
          ],
          somedayItems: current.somedayItems.map((item) =>
            item.id === itemId ? { ...item, activatedTaskId: taskId } : item,
          ),
        };
      });
    },
    setScorecard(scorecard) {
      setState((current) => {
        const existing = current.scorecards.find((item) => item.date === scorecard.date);
        if (!existing) {
          return { ...current, scorecards: [scorecard, ...current.scorecards] };
        }
        return {
          ...current,
          scorecards: current.scorecards.map((item) =>
            item.date === scorecard.date ? scorecard : item,
          ),
        };
      });
    },
    exportState() {
      return JSON.stringify(state, null, 2);
    },
    importState(raw) {
      try {
        const parsed = JSON.parse(raw) as PlannerState;
        setState(parsed);
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
  if (!context) {
    throw new Error('usePlanner must be used inside PlannerProvider');
  }
  return context;
}
