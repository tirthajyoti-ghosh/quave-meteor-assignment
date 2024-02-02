import { Meteor } from 'meteor/meteor';
import { loadInitialData } from '../infra/initial-data';
import { People } from '../people/people';
import { Communities } from '../communities/communities';

Meteor.publish('people', (eventId) => People.find({ communityId: eventId }));

Meteor.publish('events.attendees', function (eventId) {
  const sub = this;
  const people = People.find({ communityId: eventId, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
  const count = people.count();

  sub.added('events.attendees', eventId, { count });
  sub.ready();
});

// no. of people grouped by company in an event
Meteor.publish('events.attendeesByCompany', function (eventId) {
  const sub = this;
  const people = People.find({ communityId: eventId, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
  const companies = people.map((person) => person.companyName);
  const companyCount = companies.reduce((acc, company) => {
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  sub.added('events.attendeesByCompany', eventId, companyCount);
  sub.ready();
});

Meteor.startup(() => {
  // DON'T CHANGE THE NEXT LINE
  loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE

  Meteor.methods({
    'events.list': () => Communities.find().fetch(),
    'events.getAttendees': (eventId) => {
      const people = People.find({ communityId: eventId, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
      const count = people.count();

      return count;
    },
    'events.getAttendeesByCompany': async (eventId) => {
      const pipeline = [
        { $match: { communityId: eventId, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } } },
        { $group: { _id: '$companyName', count: { $sum: 1 } } },
      ];

      const companyCount = await People.rawCollection().aggregate(pipeline).toArray();

      return companyCount.map((company) => ({ name: company._id, count: company.count }));
    },
    'people.list': (eventId) => People.find({ communityId: eventId }).fetch(),
    'people.checkIn': (personId) => {
      const checkInTime = new Date();

      People.update(personId, { $set: { checkedInAt: checkInTime }, $unset: { checkedOutAt: '' } });
    },
    'people.checkOut': (personId) => {
      People.update(personId, { $set: { checkedOutAt: new Date() } });
    },
  });
});
