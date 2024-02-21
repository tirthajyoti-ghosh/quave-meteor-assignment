import React, { useState } from 'react';
import { Texts } from '../infra/constants';
import { EventsDropdown } from './EventsDropdown.jsx';
import { PeopleTable } from './PeopleTable.jsx';
import { EventStatsDisplay as EventStats } from './EventStats.jsx';

export const App = () => {
  const [selectedEvent, setSelectedEvent] = useState('');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-5">
        {Texts.HOME_TITLE}
      </h1>

      <EventsDropdown
        selectedEvent={selectedEvent}
        onChange={setSelectedEvent}
      />

      {selectedEvent && <EventStats selectedEvent={selectedEvent} />}

      <PeopleTable key={selectedEvent} selectedEvent={selectedEvent} />
    </div>
  );
};
