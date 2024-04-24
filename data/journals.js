import { journals, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helpers from '../helpers.js';
import * as sections from './sections.js';
import * as posts from './posts.js';


export const createJournal = async (username, title, userAccessing, role) => {
    const userCollection = await users();
    username = helpers.checkString(username, "username");
    const addingUser = await userCollection.findOne({username: username});
    if (!addingUser) throw "We could not find a user with the username: " + username;
    userAccessing = helpers.checkString(userAccessing, "accessing user");
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    title = helpers.checkString(title, "Title");
    if (userAccessing !== username && role !== "admin") throw "Access denied.";
    const journalCollection = await journals();
    const newJournal = {
      author: username,
      title: title,
      sections: [],
    };
    const insertInfo = await journalCollection.insertOne(newJournal);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add journal';
    addingUser.journals.push(insertInfo.insertedId.toString());
    const journalAdded = await userCollection.findOneAndReplace({username: username}, addingUser);
    if (!journalAdded) throw "Could not add the journal.";
    return await getJournalById(insertInfo.insertedId.toString(), userAccessing, role);
};

export const getJournalById = async (journalId, userAccessing, role) => {
  const userCollection = await users();
  userAccessing = helpers.checkString(userAccessing, "accessing user");
  const accessingUser = await userCollection.findOne({username: userAccessing});
  if (!accessingUser) throw "We could not find the accessing user.";
  role = helpers.checkRole(role);
  journalId = helpers.checkId(journalId, "journal id");
  const journalCollection = await journals();
  const journal = await journalCollection.findOne({ _id: new ObjectId(journalId) });
  if (!journal) throw 'Journal not found';
  if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
  journal._id = journal._id.toString();
  return journal;
};

export const getJournalsByUser = async (username, userAccessing, role) => {
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

export const updateJournal = async (journalId, title, userAccessing, role) => {
  const userCollection = await users();
  userAccessing = helpers.checkString(userAccessing, "accessing user");
  const accessingUser = await userCollection.findOne({username: userAccessing});
  if (!accessingUser) throw "We could not find the accessing user.";
  role = helpers.checkRole(role);
  journalId = helpers.checkId(journalId, "journal id");
  const journalCollection = await journals();
  const oldJournal = await journalCollection.findOne({_id: new ObjectId(journalId)});
  if (oldJournal.author !== userAccessing && role !== "admin") throw "Access denied.";
  if (!title) throw "Could not update journal with id of: " + journalId + ". Nothing is being changed.";
  title = helpers.checkString(title, "title");
  const newJournal = new Object();
  newJournal._id = oldJournal._id;
  newJournal.author = oldJournal.author;
  newJournal.title = title;
  newJournal.sections = oldJournal.sections;
  const updateInfo = await journalCollection.findOneAndReplace(
    { _id: new ObjectId(journalId) },
    newJournal
  );
  if (!updateInfo) throw 'Update failed';
  return await getJournalById(journalId.toString(), userAccessing, role);
};

export const deleteJournal = async (journalId, userAccessing, role) => {
  const userCollection = await users();
  userAccessing = helpers.checkString(userAccessing, "accessing user");
  const accessingUser = await userCollection.findOne({username: userAccessing});
  if (!accessingUser) throw "We could not find the accessing user.";
  role = helpers.checkRole(role);
  journalId = helpers.checkId(journalId, "journal id");
  const journalCollection = await journals();
  const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
  if (!journal) throw "We could not find the journal with id: " + journalId + ".";
  if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
  let section;
  for (let i in journal.sections) {
    section = await sections.deleteSection(journal.sections[i], userAccessing, role);
  }
  const foundUser = await userCollection.findOne({username: journal.author});
  if (!foundUser) throw "We could not find the user this journal belongs to.";
  for (let i in foundUser.journals) {
    if (foundUser.journals[i] === journalId) {
      foundUser.journals[i] = foundUser.journals[foundUser.journals.length - 1];
      foundUser.journals.pop();
    }
  }
  const updatedUser = await userCollection.findOneAndReplace({username: foundUser.username}, foundUser);
  if (!updatedUser) throw "Could not update the journal with id: " + id + ".";
  const deleteInfo = await journalCollection.deleteOne({ _id: new ObjectId(journalId) });
  if (deleteInfo.deletedCount === 0) {
    throw `Could not delete journal with id ${journalId}`;
  }
  return true;
};
