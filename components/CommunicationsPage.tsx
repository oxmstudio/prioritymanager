'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatShortDate, initials, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { Priority } from '../lib/types';

export function CommunicationsPage() {
  const { state, addCommunicationEntry, addContact, createFollowUpTask } = usePlanner();
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [iSaid, setISaid] = useState('');
  const [theySaid, setTheySaid] = useState('');
  const [agreement, setAgreement] = useState('');
  const [followUpDate, setFollowUpDate] = useState(todayIso());
  const [followUpTitleByEntry, setFollowUpTitleByEntry] = useState<Record<string, string>>({});
  const [followUpPriorityByEntry, setFollowUpPriorityByEntry] = useState<Record<string, Priority>>({});

  useEffect(() => {
    if (!selectedContactId && state.contacts[0]) {
      setSelectedContactId(state.contacts[0].id);
    }
  }, [selectedContactId, state.contacts]);

  const selectedContact = state.contacts.find((contact) => contact.id === selectedContactId);
  const entries = useMemo(
    () => state.communicationEntries.filter((entry) => entry.contactId === selectedContactId),
    [selectedContactId, state.communicationEntries],
  );

  function submitContact() {
    if (!firstName.trim() || !lastName.trim()) return;
    const id = addContact({ firstName: firstName.trim(), lastName: lastName.trim(), company: company.trim(), email: email.trim() });
    setSelectedContactId(id);
    setFirstName('');
    setLastName('');
    setCompany('');
    setEmail('');
  }

  function submitEntry() {
    if (!selectedContactId || !iSaid.trim() || !theySaid.trim()) return;
    addCommunicationEntry({
      contactId: selectedContactId,
      happenedAt: new Date().toISOString(),
      iSaid: iSaid.trim(),
      theySaid: theySaid.trim(),
      agreement: agreement.trim(),
      followUpDate,
    });
    setISaid('');
    setTheySaid('');
    setAgreement('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Communication planner</h2>
          <p>Important conversations belong in the log, not in memory. Every agreement can become a linked next action.</p>
        </div>
        <div className="badge">A-Z filing by last name</div>
      </div>

      <section className="grid-3">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Contacts</div>
            <h3 className="card-title">Directory</h3>
          </div>
          <div className="contact-list">
            {state.contacts.map((contact) => (
              <button
                type="button"
                key={contact.id}
                className={`contact-pill ${selectedContactId === contact.id ? 'active' : ''}`}
                onClick={() => setSelectedContactId(contact.id)}
              >
                <div className="avatar">{initials(contact.firstName, contact.lastName)}</div>
                <div style={{ textAlign: 'left' }}>
                  <strong>{contact.lastName}, {contact.firstName}</strong>
                  <div className="small">{contact.company || contact.email || 'No details yet'}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="hr" />
          <div className="stack">
            <div className="small">Add contact</div>
            <div className="grid-2">
              <label className="label">
                First name
                <input className="field" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </label>
              <label className="label">
                Last name
                <input className="field" value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </label>
            </div>
            <div className="grid-2">
              <label className="label">
                Company
                <input className="field" value={company} onChange={(event) => setCompany(event.target.value)} />
              </label>
              <label className="label">
                Email
                <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            </div>
            <button className="button-ghost" onClick={submitContact}>Add contact</button>
          </div>
        </div>

        <div className="panel panel-inner stack" style={{ gridColumn: 'span 2' }}>
          <div className="row spread wrap">
            <div>
              <div className="kicker">Conversation log</div>
              <h3 className="card-title">
                {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Choose a contact'}
              </h3>
            </div>
            {selectedContact?.company ? <span className="badge">{selectedContact.company}</span> : null}
          </div>

          <div className="grid-2">
            <label className="label">
              I Said
              <textarea className="textarea" rows={4} value={iSaid} onChange={(event) => setISaid(event.target.value)} placeholder="What you committed, proposed, or clarified" />
            </label>
            <label className="label">
              They Said
              <textarea className="textarea" rows={4} value={theySaid} onChange={(event) => setTheySaid(event.target.value)} placeholder="What they agreed, requested, or pushed back on" />
            </label>
          </div>
          <div className="grid-2">
            <label className="label">
              Agreement / next step
              <input className="field" value={agreement} onChange={(event) => setAgreement(event.target.value)} placeholder="What now exists because of the conversation?" />
            </label>
            <label className="label">
              Follow-up date
              <input className="field" type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
            </label>
          </div>
          <button className="button" onClick={submitEntry} disabled={!selectedContactId}>Save entry</button>

          <div className="hr" />

          {entries.length === 0 ? (
            <div className="empty">No conversation entries yet for this contact.</div>
          ) : (
            <div className="item-list">
              {entries.map((entry) => (
                <div className="item" key={entry.id}>
                  <div className="row spread wrap">
                    <span className="badge">{new Date(entry.happenedAt).toLocaleString()}</span>
                    {entry.followUpDate ? <span className="badge">Follow-up {formatShortDate(entry.followUpDate)}</span> : null}
                  </div>
                  <div className="grid-2" style={{ marginTop: 12 }}>
                    <div>
                      <div className="kicker">I Said</div>
                      <p>{entry.iSaid}</p>
                    </div>
                    <div>
                      <div className="kicker">They Said</div>
                      <p>{entry.theySaid}</p>
                    </div>
                  </div>
                  {entry.agreement ? (
                    <div>
                      <div className="kicker">Agreement</div>
                      <p>{entry.agreement}</p>
                    </div>
                  ) : null}
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {entry.linkedTaskId ? (
                      <span className="badge done">Linked follow-up created</span>
                    ) : (
                      <>
                        <input
                          className="field"
                          style={{ maxWidth: 280 }}
                          placeholder="Follow-up task title"
                          value={followUpTitleByEntry[entry.id] ?? entry.agreement ?? ''}
                          onChange={(event) => setFollowUpTitleByEntry((current) => ({ ...current, [entry.id]: event.target.value }))}
                        />
                        <select
                          className="select"
                          style={{ maxWidth: 110 }}
                          value={followUpPriorityByEntry[entry.id] ?? 'A'}
                          onChange={(event) => setFollowUpPriorityByEntry((current) => ({ ...current, [entry.id]: event.target.value as Priority }))}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </select>
                        <button
                          className="button-ghost"
                          onClick={() =>
                            createFollowUpTask(
                              entry.id,
                              followUpTitleByEntry[entry.id] ?? entry.agreement ?? 'Follow up',
                              entry.followUpDate ?? todayIso(),
                              followUpPriorityByEntry[entry.id] ?? 'A',
                            )
                          }
                        >
                          Create follow-up task
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
