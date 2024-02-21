import React, { Fragment, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '../people/people';
import { ActionButton } from './ActionButton.jsx';

export function PeopleTable({ selectedEvent }) {
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

  return (
    <Fragment>
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
    </Fragment>
  );
}
