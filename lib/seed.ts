import { addDays, todayIso } from './date';
import type { PlannerState } from './types';

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
      },
      {
        id: 'task-3',
        title: 'Send recap and next-step summary',
        date: tomorrow,
        priority: 'A',
        status: 'active',
        sourceType: 'communication',
        sourceId: 'comm-1',
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
        delegatedTo: 'Chris',
        followUpDate: nextWeek,
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
      },
    ],
    somedayItems: [
      {
        id: 'some-1',
        title: 'Create a weekly review checklist',
        note: 'Could become a reusable template after the daily flow feels right.',
        createdAt: `${today}T18:00:00.000Z`,
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
