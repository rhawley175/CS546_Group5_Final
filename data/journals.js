import { journals } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helpers from '../helpers.js';

export const createJournal = async (userId, title, sectionTitle, sectionContent) => {
  try {
    userId = helpers.checkString(userId, "User ID");
    title = helpers.checkString(title, "Title");
    sectionTitle = helpers.checkString(sectionTitle, "Section Title");
    sectionContent = helpers.checkString(sectionContent, "Section Content");

    const journalCollection = await journals();
    const newJournal = {
      userId: new ObjectId(userId),
      author: [userId],
      title: title,
      sections: [
        {
          title: sectionTitle,
          posts: [],
        },
      ],
    };

    const insertInfo = await journalCollection.insertOne(newJournal);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add journal';

    const newId = insertInfo.insertedId.toString();
    return await getJournalById(newId);
  } catch (error) {
    console.error('Error in createJournal:', error);
    throw error;
  }
};

export const getJournalById = async (journalId) => {
  journalId = helpers.checkString(journalId, "Journal ID");
  const journalCollection = await journals();
  const journal = await journalCollection.findOne({ _id: new ObjectId(journalId) });
  if (!journal) throw 'Journal not found';
  return journal;
};

export const getJournalsByUser = async (userId) => {
  userId = helpers.checkString(userId, "User ID");
  const journalCollection = await journals();
  return await journalCollection.find({ userId: new ObjectId(userId) }).toArray();
};

export const updateJournal = async (journalId, updatedJournal) => {
  journalId = helpers.checkString(journalId, "Journal ID");
  const journalCollection = await journals();

  const updatedJournalData = {};

  if (updatedJournal.title) {
    updatedJournalData.title = helpers.checkString(updatedJournal.title, "Title");
  }

  if (updatedJournal.sections) {
    updatedJournalData.sections = helpers.checkArray(updatedJournal.sections, "Sections");
  }

  const updateInfo = await journalCollection.updateOne(
    { _id: new ObjectId(journalId) },
    { $set: updatedJournalData }
  );

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw 'Update failed';

  return await getJournalById(journalId);
};

export const deleteJournal = async (journalId) => {
  journalId = helpers.checkString(journalId, "Journal ID");
  const journalCollection = await journals();
  const deleteInfo = await journalCollection.deleteOne({ _id: new ObjectId(journalId) });

  if (deleteInfo.deletedCount === 0) {
    throw `Could not delete journal with id ${journalId}`;
  }
  return true;
};
