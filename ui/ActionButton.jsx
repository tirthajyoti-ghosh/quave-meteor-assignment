import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';

export function ActionButton({ person }) {
  const [canCheckOut, setCanCheckOut] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (person && person.checkedInAt) {
      const timeLeft =
        new Date(person.checkedInAt.getTime() + 5000) - new Date();
      if (timeLeft > 0) {
        setCanCheckOut(false);
        timeoutId = setTimeout(() => setCanCheckOut(true), timeLeft);
      } else {
        setCanCheckOut(true);
      }
    } else {
      setCanCheckOut(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [person]);

  if (!person.checkedInAt || person.checkedOutAt) {
    return (
      <button
        onClick={() => Meteor.call('people.checkIn', person._id)}
        className="font-medium text-indigo-600 dark:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Check-in {person.firstName} {person.lastName}
      </button>
    );
  }

  return (
    <button
      disabled={!canCheckOut}
      onClick={() => Meteor.call('people.checkOut', person._id)}
      className="font-medium text-indigo-600 dark:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Check-out {person.firstName} {person.lastName}
    </button>
  );
}
