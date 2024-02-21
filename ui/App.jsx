import React, { useState, useEffect, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Mongo } from 'meteor/mongo';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Texts } from '../infra/constants';
import { People } from '../people/people';
import { ActionButton } from './ActionButton.jsx';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

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

  useEffect(() => {
    Meteor.call('events.list', (err, res) => {
      if (!err) {
        setEvents(res);
      }
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1>{Texts.HOME_TITLE}</h1>
      <Listbox
        value={selectedEvent}
        onChange={value => {
          setSelectedEvent(value);
          setPage(1);
        }}
      >
        {({ open }) => (
          <Fragment>
            <div className="relative mt-2 sm:w-[300px]">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                <span className="flex items-center">
                  <span className="ml-3 block truncate">
                    {selectedEvent
                      ? events.find(event => event._id === selectedEvent).name
                      : 'Select an Event'}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {events.map(event => (
                    <Listbox.Option
                      key={event._id}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9'
                        )
                      }
                      value={event._id}
                    >
                      {({ selected, active }) => (
                        <Fragment>
                          <div className="flex items-center">
                            <span
                              className={classNames(
                                selected ? 'font-semibold' : 'font-normal',
                                'ml-3 block truncate'
                              )}
                            >
                              {event.name}
                            </span>
                          </div>
                          {selected ? (
                            <span
                              className={classNames(
                                active ? 'text-white' : 'text-indigo-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </Fragment>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Fragment>
        )}
      </Listbox>

      {selectedEvent && (
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
      )}

      {people.length > 0 && (
        <div className="flex justify-end mt-5">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 me-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5H1m0 0 4 4M1 5l4-4"
              />
            </svg>
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={people.length < 10}
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <svg
              className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="relative overflow-x-auto mt-5 mb-3">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Check-In
              </th>
              <th scope="col" className="px-6 py-3">
                Check-Out
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map(person => (
              <tr
                key={person._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {person.firstName} {person.lastName}
                </th>
                <td className="px-6 py-4">{person.companyName}</td>
                <td className="px-6 py-4">{person.title}</td>
                <td className="px-6 py-4">
                  {person.checkedInAt
                    ? person.checkedInAt.toLocaleString()
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {person.checkedOutAt
                    ? person.checkedOutAt.toLocaleString()
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <ActionButton person={person} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {people.length === 0 && (
          <div className="flex justify-center items-center mt-5">
            <div className="text-xl text-gray-400">No data to display</div>
          </div>
        )}
      </div>
    </div>
  );
};
