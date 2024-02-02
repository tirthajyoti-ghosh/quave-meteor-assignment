import { Meteor } from 'meteor/meteor';
import { loadInitialData } from '../infra/initial-data';
import { People } from '../people/people';
import { Communities } from '../communities/communities';

Meteor.publish('people', (eventId) => People.find({ communityId: eventId }));

Meteor.publish('event.attendees', function (eventId) {
  const sub = this;
  const people = People.find({ communityId: eventId, checkedOutAt: { $exists: false }, checkedInAt: { $lte: new Date() } });
  const count = people.count();

  sub.added('attendees', eventId, { count });
  sub.ready();
});

Meteor.startup(() => {
  // DON'T CHANGE THE NEXT LINE
  loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE

  Meteor.methods({
    'events.list': () => Communities.find().fetch(),
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
