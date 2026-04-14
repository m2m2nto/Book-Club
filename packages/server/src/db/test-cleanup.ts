import { db } from './client.js';
import {
  bookSurveyOptionsTable,
  bookSurveyVotesTable,
  bookSurveysTable,
  booksTable,
  commentsTable,
  dateSurveyOptionsTable,
  dateSurveyVotesTable,
  dateSurveysTable,
  meetingsTable,
  ratingsTable,
  reminderDeliveriesTable,
  rsvpsTable,
  usersTable,
} from './schema.js';

export const resetDatabase = () => {
  db.delete(reminderDeliveriesTable).run();
  db.delete(rsvpsTable).run();
  db.delete(dateSurveyVotesTable).run();
  db.delete(dateSurveyOptionsTable).run();
  db.delete(dateSurveysTable).run();
  db.delete(meetingsTable).run();
  db.delete(bookSurveyVotesTable).run();
  db.delete(bookSurveyOptionsTable).run();
  db.delete(bookSurveysTable).run();
  db.delete(commentsTable).run();
  db.delete(ratingsTable).run();
  db.delete(booksTable).run();
  db.delete(usersTable).run();
};
