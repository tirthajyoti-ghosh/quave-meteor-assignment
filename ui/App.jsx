import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Mongo } from 'meteor/mongo';
import { People } from '../people/people';
import { ActionButton } from './ActionButton.jsx';

const EventStats = new Mongo.Collection('events.stats');

export const App = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);

  const people = useTracker(() => {
    const skip = (page - 1) * 10;
    if (selectedEvent) {
      const handle = Meteor.subscribe('people', selectedEvent, skip, 10);
      if (handle.ready()) {
        return People.find({}).fetch();
      }
    }
    return [];
  });

  const {
    attendees,
    attendeesByCompany,
    peopleNotCheckedIn,
  } = useTracker(() => {
    const noData = { attendees: 0, attendeesByCompany: [], peopleNotCheckedIn: 0 };
    if (!selectedEvent) return noData;

    const handle = Meteor.subscribe('events.stats', selectedEvent);
    if (!handle.ready()) return noData;

    return EventStats.findOne(selectedEvent);
  });

  // Reset page when selected event changes
  useEffect(() => {
    setPage(1);
  }, [selectedEvent]);

  useEffect(() => {
    Meteor.call('events.list', (err, res) => {
      if (!err) {
        setEvents(res);
      }
    });
  }, []);

  return (
    <div>
      <h1>Event Check-in System</h1>
      <select
        value={selectedEvent}
        onChange={e => setSelectedEvent(e.target.value)}
      >
        <option value="">Select an Event</option>
        {events.map(event => (
          <option key={event._id} value={event._id}>
            {event.name}
          </option>
        ))}
      </select>

      {selectedEvent && (
        <div>
          <p>People in the event right now: {attendees}</p>
          <p>
            People by company in the event right now:{' '}
            {attendeesByCompany.map(({ company, count }) => (
              <span key={company}>
                {company} ({count}){', '}
              </span>
            ))}
          </p>
          <p>People not checked-in: {peopleNotCheckedIn}</p>
        </div>
      )}
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)} disabled={people.length < 10}>
        Next
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company Name</th>
            <th>Title</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {people.map(person => (
            <tr key={person._id}>
              <td>{person.firstName} {person.lastName}</td>
              <td>{person.companyName}</td>
              <td>{person.title}</td>
              <td>{person.checkedInAt ? person.checkedInAt.toLocaleString() : 'N/A'}</td>
              <td>{person.checkedOutAt ? person.checkedOutAt.toLocaleString() : 'N/A'}</td>
              <td><ActionButton person={person} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
