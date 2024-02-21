import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';

const EventStats = new Mongo.Collection('events.stats');

export function EventStatsDisplay({ selectedEvent }) {
  const { attendees, attendeesByCompany, peopleNotCheckedIn } = useTracker(
    () => {
      const noData = {
        attendees: 0,
        attendeesByCompany: [],
        peopleNotCheckedIn: 0,
      };
      if (!selectedEvent) return noData;

      const handle = Meteor.subscribe('events.stats', selectedEvent);
      if (!handle.ready()) return noData;

      return EventStats.findOne(selectedEvent);
    }
  );

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-5">
      <div className="max-w-xs gap-y-4">
        <div className="text-base leading-7 text-gray-600">
          People in the event right now
        </div>
        <div className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {attendees}
        </div>
      </div>
      <div className="max-w-xs gap-y-4">
        <div className="text-base leading-7 text-gray-600">
          People by company in the event right now
        </div>
        {attendeesByCompany.map(({ company, count }) => (
          <span
            key={company}
            className="mb-1 mr-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
          >
            {company} ({count})
          </span>
        ))}
      </div>
      <div className="max-w-xs gap-y-4">
        <div className="text-base leading-7 text-gray-600">
          People not checked-in
        </div>
        <div className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {peopleNotCheckedIn}
        </div>
      </div>
    </div>
  );
}
