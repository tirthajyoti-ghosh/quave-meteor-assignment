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
    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-5 min-h-[200px]">
      <div className="max-w-xs gap-y-4 md:border-r-2 border-gray-200 pr-4 border-b-2 md:border-b-0 pb-5 md:pb-0">
        <div className="text-base leading-7 text-gray-600 mb-3 md:text-center">
          People in the event right now
        </div>
        <div className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl md:text-center">
          {attendees}
        </div>
      </div>

      <div className="max-w-xs gap-y-4 border-b-2 border-gray-200 pb-5 md:border-none md:pb-0">
        <div className="text-base leading-7 text-gray-600 mb-3 md:text-center">
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

      <div className="max-w-xs gap-y-4 md:border-l-2 border-gray-200 lg:pl-4 border-l-0">
        <div className="text-base leading-7 text-gray-600 mb-3 md:text-center">
          People not checked-in
        </div>
        <div className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl md:text-center">
          {peopleNotCheckedIn}
        </div>
      </div>
    </div>
  );
}
