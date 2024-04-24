import {sections, users, journals} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helpers from '../helpers.js';
import * as posts from './posts.js';


export const createSection = async (journalId, title, userAccessing, role) => {
    const journalCollection = await journals();
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
    if (!journal) throw "We could not find the journal with id: " + journalId + ".";
    title = helpers.checkString(title, "title");
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing, "accessing user");
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    if (userAccessing !== journal.author && role !== "admin") throw "Access denied.";
    const newSection = {
        journalId: journalId,
        title: title,
        posts: []
    };
    const sectionCollection = await sections();
    const insertInfo = await sectionCollection.insertOne(newSection);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw ('Could not add the section.');
    journal.sections.push(insertInfo.insertedId.toString());
    const updatedJournal = await journalCollection.findOneAndReplace({_id: new ObjectId(journalId)}, journal);
    if (!updatedJournal) throw "We could not create the section.";
    return await getSection(insertInfo.insertedId.toString(), userAccessing, role);
};

export const getSection = async (sectionId, userAccessing, role) => {
    const sectionCollection = await sections();
    sectionId = helpers.checkId(sectionId, "section id");
    const section = await sectionCollection.findOne({ _id: new ObjectId(sectionId) });
    if (!section) throw ('Section not found.');
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing, "accessing user");
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: new ObjectId(section.journalId)});
    if (!journal) throw "We could not find the journal this section belongs to.";
    if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
    section._id = section._id.toString();
    return section;
};

export const getSectionsByJournal = async (journalId, userAccessing, role) => {
    const journalCollection = await journals();
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
    if (!journal) throw "Journal with the given id: " + journalId + " was not found.";
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
    if (journal.sections.length === 0) return "There are no sections in this journal.";
    let sectionsList = [];
    let section;
    for (let i in journal.sections) {
        section = await getSection(journal.sections[i], userAccessing, role);
        sectionsList.push(section);
    }
    return sectionsList;
};

export const updateSection = async(sectionId, title, userAccessing, role) => {
    const sectionCollection = await sections();
    sectionId = helpers.checkId(sectionId, "section id");
    const section = await sectionCollection.findOne({_id: new ObjectId(sectionId)});
    if (!section) throw "Could not find a section with id: " + sectionId + ".";
    if (!title) throw "Cannot update the section, as nothing is being changed.";
    title = helpers.checkString(title, "title");
    if (title === section.title) throw "Cannot update the section, as nothing is being changed.";
    section.title = title;
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "Could not find the accessing user.";
    role = helpers.checkRole(role);
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: new ObjectId(section.journalId)});
    if (!journal) throw "We could not find the journal this section belongs to.";
    if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
    const updateSection = await sectionCollection.findOneAndReplace({_id: new ObjectId(sectionId)}, section);
    if (!updateSection) throw "We could not update the section.";
    return await getSection(sectionId, userAccessing, role);
}

export const deleteSection = async (sectionId, userAccessing, role) => {
    const sectionCollection = await sections();
    sectionId = helpers.checkId(sectionId, "section id");
    const section = await sectionCollection.findOne({_id: new ObjectId(sectionId)});
    if (!section) throw "We could not find the section with id: " + sectionId + ".";
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "Could not find the accessing user.";
    role = helpers.checkRole(role);
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: new ObjectId(section.journalId)});
    if (!journal) throw "We could not find the journal this section belongs to.";
    if (journal.author !== userAccessing && role !== "admin") throw "Access denied.";
    let deletedPost;
    for (let i in section.posts) {
        deletedPost = await posts.deletePost(section.posts[i], userAccessing, role);
    }
    for (let i in journal.sections) {
        if (journal.sections[i] === sectionId) {
            journal.sections[i] = journal.sections[journal.sections.length - 1];
            journal.sections.pop();
        }
    }
    const updatedJournal = await journalCollection.findOneAndReplace({_id: new ObjectId(section.journalId)}, journal);
    if (!updatedJournal) throw "Could not delete the section.";
    const deletionInfo = await sectionCollection.deleteOne({ _id: new ObjectId(sectionId) });
    if (!deletionInfo.deletedCount) throw ('Could not delete the section.');
    return deletionInfo;
};