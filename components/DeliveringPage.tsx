'use client';

import { useMemo, useState } from 'react';
import { formatShortDate, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { DelegationStatus } from '../lib/types';

export function DeliveringPage() {
  const { state, addCommunicationEntry, addDelegationItem, updateDelegationItem, addCommitmentOutcome, setScorecard } = usePlanner();
  const [contactId, setContactId] = useState(state.contacts[0]?.id ?? '');
  const [iSaid, setISaid] = useState('');
  const [theySaid, setTheySaid] = useState('');
  const [delegationTitle, setDelegationTitle] = useState('');
  const [delegatedTo, setDelegatedTo] = useState('');
  const [why, setWhy] = useState('');
  const [instruction, setInstruction] = useState('');
  const [agreedAction, setAgreedAction] = useState('');
  const [agreedDueDate, setAgreedDueDate] = useState(todayIso());
  const [followUpDate, setFollowUpDate] = useState(todayIso());
  const [outcomeTitle, setOutcomeTitle] = useState('');
  const [deliveredTo, setDeliveredTo] = useState('');
  const [commitment, setCommitment] = useState('');

  const deliveryStats = useMemo(() => ({
    communications: state.communicationEntries.length,
    delegationsOpen: state.delegationItems.filter((item) => item.status !== 'complete').length,
    outcomes: state.commitmentOutcomes.length,
  }), [state.commitmentOutcomes.length, state.communicationEntries.length, state.delegationItems]);

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Delivering</h2>
          <p>Communicate outcomes, track delegation, and close loops with commitments and follow-up.</p>
        </div>
        <div className="row wrap">
          <span className="badge">Comms {deliveryStats.communications}</span>
          <span className="badge">Open delegations {deliveryStats.delegationsOpen}</span>
          <span className="badge">Outcomes {deliveryStats.outcomes}</span>
        </div>
      </div>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div className="kicker">Communications</div>
          <select className="select" value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">Select contact</option>
            {state.contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
          <textarea className="textarea" rows={3} placeholder="I said" value={iSaid} onChange={(e) => setISaid(e.target.value)} />
          <textarea className="textarea" rows={3} placeholder="They said" value={theySaid} onChange={(e) => setTheySaid(e.target.value)} />
          <button className="button" onClick={() => { if (!contactId || !iSaid.trim() || !theySaid.trim()) return; addCommunicationEntry({ contactId, happenedAt: new Date().toISOString(), iSaid: iSaid.trim(), theySaid: theySaid.trim(), followUpDate }); setISaid(''); setTheySaid(''); }}>Save communication</button>
          <div className="item-list">{state.communicationEntries.slice(0, 6).map((entry) => <div className="item" key={entry.id}><p>{entry.iSaid}</p><div className="small">Follow-up {entry.followUpDate ? formatShortDate(entry.followUpDate) : 'not set'}</div></div>)}</div>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Delegation Tracker</div>
          <input className="field" placeholder="Delegation title" value={delegationTitle} onChange={(e) => setDelegationTitle(e.target.value)} />
          <div className="grid-2">
            <input className="field" placeholder="Delegated to" value={delegatedTo} onChange={(e) => setDelegatedTo(e.target.value)} />
            <input className="field" placeholder="Owner" value={why} onChange={(e) => setWhy(e.target.value)} />
          </div>
          <textarea className="textarea" rows={2} placeholder="Why this person" value={why} onChange={(e) => setWhy(e.target.value)} />
          <textarea className="textarea" rows={2} placeholder="Written instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
          <textarea className="textarea" rows={2} placeholder="Agreed action" value={agreedAction} onChange={(e) => setAgreedAction(e.target.value)} />
          <div className="grid-2"><input className="field" type="date" value={agreedDueDate} onChange={(e) => setAgreedDueDate(e.target.value)} /><input className="field" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} /></div>
          <button className="button" onClick={() => { if (!delegationTitle.trim() || !delegatedTo.trim()) return; addDelegationItem({ title: delegationTitle.trim(), delegatedTo: delegatedTo.trim(), owner: why.trim(), whyThisPerson: why.trim(), writtenInstruction: instruction.trim(), agreedAction: agreedAction.trim(), agreedDueDate, followUpDate, status: 'waiting' }); setDelegationTitle(''); setDelegatedTo(''); }}>Add delegation</button>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div className="kicker">Delegation Follow-up</div>
          <div className="item-list">{state.delegationItems.map((item) => <div className="item" key={item.id}><div className="row spread wrap"><strong>{item.title}</strong><select className="select" style={{ maxWidth: 170 }} value={item.status} onChange={(e) => updateDelegationItem(item.id, { status: e.target.value as DelegationStatus })}><option value="waiting">waiting</option><option value="in_progress">in progress</option><option value="returned">returned</option><option value="complete">complete</option></select></div><p>{item.writtenInstruction}</p><div className="small">Due {formatShortDate(item.agreedDueDate)} · Follow-up {formatShortDate(item.followUpDate)}</div></div>)}</div>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Commitments / Outcomes</div>
          <input className="field" placeholder="Delivered item" value={outcomeTitle} onChange={(e) => setOutcomeTitle(e.target.value)} />
          <input className="field" placeholder="Delivered to" value={deliveredTo} onChange={(e) => setDeliveredTo(e.target.value)} />
          <input className="field" placeholder="Commitment made" value={commitment} onChange={(e) => setCommitment(e.target.value)} />
          <button className="button" onClick={() => { if (!outcomeTitle.trim()) return; addCommitmentOutcome({ title: outcomeTitle.trim(), deliveredTo: deliveredTo.trim(), communicationSummary: iSaid || 'See communication log', commitmentMade: commitment.trim(), followUpRequired: 'Confirm completion', nextFollowUpDate: followUpDate }); setOutcomeTitle(''); setDeliveredTo(''); setCommitment(''); }}>Record outcome</button>
          <div className="item-list">{state.commitmentOutcomes.map((item) => <div className="item" key={item.id}><strong>{item.title}</strong><p>{item.commitmentMade}</p><div className="small">Next follow-up {item.nextFollowUpDate ? formatShortDate(item.nextFollowUpDate) : 'None'}</div></div>)}</div>
        </div>
      </section>

      <section className="panel panel-inner stack">
        <div className="kicker">Review / Scorecards</div>
        <button className="button-ghost" onClick={() => setScorecard({ date: todayIso(), wins: ['Delivered key communication', 'Tracked delegation', 'Captured commitment'], notes: 'Workflow-driven closeout.' })}>Auto-save today scorecard</button>
      </section>
    </div>
  );
}
