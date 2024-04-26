import { journals, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helpers from '../helpers.js';
import * as sectionMethods from './sections.js';

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
    const userCollection = await users();
    const addingUser = await userCollection.findOne({username: username});
    if (!addingUser) throw "We could not find a user with the username: " + username;
    const insertInfo = await journalCollection.insertOne(newJournal);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add journal';
    addingUser.journals.push(insertInfo.insertedId.toString());
    const journalAdded = await userCollection.findOneAndReplace({username: username}, addingUser);
    if (!journalAdded) throw "Could not add the journal.";
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
  const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
  if (!journal) throw "We could not find the journal to be deleted.";
  const userCollection = await users();
  const user = await userCollection.findOne({username: journal.author[0]});
  if (!user) throw "We could not find the user that owns the journal.";
  let section;
  for (let i in journal.sections) {
    section = await sectionMethods.deleteSection(journal.sections[i]);
    if (!section) throw "We could not delete the section.";
  }
  for (let i in user.journals) {
    if (user.journals[i] === journalId) {
      user.journals[i] = user.journals[user.journals.length - 1];
      user.journals.pop();
    }
  }
  const updatedUser = await userCollection.findOneAndReplace({username: user.username}, user);
  if (!updatedUser) throw "We could not update the user.";
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

export const getJournalsByAuthenticatedUsername = async (username, userAccessing, role) => {
  const userCollection = await users();
  userAccessing = helpers.checkString(userAccessing, "accessing user");
  const accessingUser = await userCollection.findOne({username: userAccessing});
  if (!accessingUser) throw "We could not find the accessing user.";
  role = helpers.checkRole(role);
  username = helpers.checkString(username, "username");
  const foundUser = await userCollection.findOne({username: username});
  if (!foundUser) throw "We could not find the user with username: " + username + ".";
  if (userAccessing !== username && role !== "admin") throw "Access denied.";
  const journalCollection = await journals();
  let journal;
  let journalArray = [];
  for (let i in foundUser.journals) {
    journal = await journalCollection.findOne({_id: new ObjectId(foundUser.journals[i])});
    journalArray.push(journal);
  }
  if (journalArray.length === 0) return "You have no journals to view.";
  return journalArray;
};