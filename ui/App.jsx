import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '../people/people';
import { ActionButton } from './ActionButton.jsx';

export const App = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);

  const people = useTracker(() => {
    if (selectedEvent) {
      Meteor.subscribe('people', selectedEvent);
    }
    return People.find({}).fetch();
  });

  const attendees = useTracker(() => {
    if (selectedEvent) {
      Meteor.subscribe('events.attendees', selectedEvent);
    }

    const peopleData = People.find({ communityId: selectedEvent, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
    return peopleData.count();
  });

  const attendeesByCompany = useTracker(() => {
    if (selectedEvent) {
      Meteor.subscribe('events.attendeesByCompany', selectedEvent);
    }

    const peopleData = People.find({ communityId: selectedEvent, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
    const companies = peopleData.map((person) => person.companyName);
    const companyCount = companies.reduce((acc, company) => {
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});

    return companyCount;
  });

  useEffect(() => {
    Meteor.call('events.list', (err, res) => {
      if (err) {
        console.log(err);
      } else {
        setEvents(res);
      }
    });
  }, []);

  return (
    <div>
      <h1>Event Check-in System</h1>
      <select
        value={selectedEvent}
        onChange={(e) => {
          setSelectedEvent(e.target.value);
          // fetchPeople(e.target.value);
        }}
      >
        <option value="">Select an Event</option>
        {/* Render events dynamically */}
        {events.map((event) => (
          <option key={event._id} value={event._id}>{event.name}</option>
        ))}
      </select>

      <p>People in the event right now: {attendees}</p>
      <p>
        People by company in the event right now: {Object.keys(attendeesByCompany).map((company) => (
          <span key={company}>{company}: {attendeesByCompany[company]}&nbsp;</span>
        ))}
      </p>

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
              <td>
                <ActionButton person={person} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
