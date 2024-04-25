import { journals } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helpers from '../helpers.js';

export const createJournal = async (userId, username, title) => {
  try {
    username = helpers.checkString(username, "Username");
    title = helpers.checkString(title, "Title");

    const journalCollection = await journals();
    const newJournal = {
      user_id: [userId],
      author: [username],
      title: title,
      sections: [],
    };

    const insertInfo = await journalCollection.insertOne(newJournal);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add journal';

    return await getJournalById(insertInfo.insertedId);
  } catch (error) {
    console.error('Error in createJournal:', error);
    throw error;
  }
};

export const getJournalById = async (journalId) => {
  const journalCollection = await journals();
  const journal = await journalCollection.findOne({ _id: new ObjectId(journalId) });
  if (!journal) throw 'Journal not found';
  return journal;
};


export const getJournalsByUser = async (userId) => {
  const journalCollection = await journals();
  return await journalCollection.find({ user_id: userId }).toArray();
};

export const updateJournal = async (journalId, updatedJournal) => {
  journalId = helpers.checkString(journalId, "Journal ID");
  const journalCollection = await journals();
  const updatedJournalData = {};

  if (updatedJournal.title) {
    updatedJournalData.title = helpers.checkString(updatedJournal.title, "Title");
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


export const getJournalsByUsername = async (username) => {
  const journalCollection = await journals();
  return await journalCollection.find({ author: username }).toArray();
};

