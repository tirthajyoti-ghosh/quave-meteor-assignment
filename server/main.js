import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { loadInitialData } from '../infra/initial-data';
import { People } from '../people/people';
import { Communities } from '../communities/communities';

const calculateStats = (eventId) => {
  const eventStatsData = People.find({
    communityId: eventId,
    checkedOutAt: { $exists: false },
    checkedInAt: { $lte: new Date() },
  });

  const companies = eventStatsData.fetch().map(person => person.companyName);
  const companyCount = companies.reduce((acc, company) => {
    // if company is undefined, we will use 'Unknown' as the key
    // structure is: [{ company: 'Trulia', count: 1 }, { company: 'Unknown', count: 1 }]

    const key = company || 'Unknown';

    const existingCompany = acc.find(c => c.company === key);
    if (existingCompany) {
      existingCompany.count += 1;
    } else {
      acc.push({ company: key, count: 1 });
    }
    return acc;
  }, []);

  const peopleNotCheckedInData = People.find({
    communityId: eventId,
    $or: [
      { checkedOutAt: { $exists: true } },
      { checkedInAt: { $exists: false } },
    ],
  });

  return {
    attendees: eventStatsData.count(),
    attendeesByCompany: companyCount,
    peopleNotCheckedIn: peopleNotCheckedInData.count(),
  };
};

Meteor.publish('people', (eventId, skip, limit) => {
  check(eventId, String);
  check(skip, Number);
  check(limit, Number);

  return People.find({ communityId: eventId }, { skip, limit });
});

Meteor.publish('events.stats', function (eventId) {
  check(eventId, String);

  const self = this;

  self.added('events.stats', eventId, calculateStats(eventId));
  self.ready();

  const handle = People.find({ communityId: eventId }).observeChanges({
    changed: () => {
      self.changed('events.stats', eventId, calculateStats(eventId));
    },
  });

  self.ready();

  self.onStop(() => {
    handle.stop();
  });
});

Meteor.startup(() => {
  // DON'T CHANGE THE NEXT LINE
  loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE

  Meteor.methods({
    'events.list': () => Communities.find().fetch(),
    'people.checkIn': (personId) => {
      const checkInTime = new Date();

      People.update(personId, { $set: { checkedInAt: checkInTime }, $unset: { checkedOutAt: '' } });
    },
    'people.checkOut': (personId) => {
      People.update(personId, { $set: { checkedOutAt: new Date() } });
    },
  });
});
