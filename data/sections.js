import {sections, journals, posts, users } from '../config/mongoCollections.js';
import * as postMethods from './posts.js';
import {ObjectId} from 'mongodb';


export const createSection = async (journalId, title, userId) => {
    if (!journalId || !title || !userId) throw ('Journal ID, title, and user ID must be provided.');
    if (typeof journalId !== 'string' || typeof title !== 'string') throw ('Journal ID and title must be strings.');

    journalId = journalId.trim();
    title = title.trim();

    if (!ObjectId.isValid(journalId)) throw ('Invalid journal ID format.');
    if (!title.length) throw ('Title cannot be empty.');

    const sectionsCollection = await sections();
    const journalCollection = await journals();
    
    const newSection = {
        journalId: new ObjectId(journalId),
        title: title,
        userId: new ObjectId(userId),
        posts: []
    };
    const insertInfo = await sectionsCollection.insertOne(newSection);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw ('Could not add the section.');

    const updateJournalInfo = await journalCollection.updateOne(
        { _id: new ObjectId(journalId) },
        { $push: { sections: insertInfo.insertedId.toString() } }
      );
    
      if (!updateJournalInfo.matchedCount && !updateJournalInfo.modifiedCount)
        throw ('Failed to link section to journal');
    

    return await getSection(insertInfo.insertedId);
};

export const getSection = async (sectionId) => {
    const sectionsCollection = await sections();
    const section = await sectionsCollection.findOne({ _id: new ObjectId(sectionId) });
    if (!section) throw ('Section not found.');

    if (section.posts && section.posts.length > 0) {
        const postsCollection = await posts(); 
        const postsDetails = [];

        for (const postId of section.posts) {
            const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
            if (post) {
                postsDetails.push(post);
            } else {
                console.log("No post found for ID:", postId);
            }
        }

        section.posts = postsDetails;
    }

    return section;
};

export const getSectionsByJournalId = async (journalId) => {
    const sectionsCollection = await sections();
    if (!ObjectId.isValid(journalId)) ('Invalid journal ID format.');

    const sectionsList = await sectionsCollection.find({ journalId: new ObjectId(journalId) }).toArray();
    return sectionsList; 
};


export const deleteSection = async (sectionId) => {
    if (!sectionId) throw 'Section ID must be provided.';
    if (!ObjectId.isValid(sectionId)) throw 'Invalid section ID format.';
    const sectionsCollection = await sections();
    const section = await sectionsCollection.findOne({_id: new ObjectId(sectionId)});
    if (!section) throw "We could not find the section to delete.";
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: section.journalId});
    if (!journal) throw "We couldn't find the journal this section belongs to.";
    const userCollection = await users();
    const user = await userCollection.findOne({username: journal.author[0]});
    if (!user) throw "We could not find the user this section belongs to.";
    let valid = false;
    for (let i in journal.sections) {
        if (journal.sections[i].toString() === section._id.toString()) {
            valid = true;
            journal.sections[i] = journal.sections[journal.sections.length - 1];
            journal.sections.pop();
        }
    }
    if (!valid) throw "We could not remove the section from the journal.";
    const updateJournal = await journalCollection.findOneAndReplace({_id: section.journalId}, journal);
    if (!updateJournal) {
        throw 'Failed to remove the section from the journal.';
    }
    if (section.posts && section.posts.length > 0) {
        for (let i in section.posts) {
            const deletePost = await postMethods.deletePost(section.posts[i].toString(), user.username, user.role);
            if (!deletePost) throw "We could not delete one of the posts.";
        }
    }
    const deletionInfo = await sectionsCollection.deleteOne({ _id: new ObjectId(sectionId) });
    if (!deletionInfo.deletedCount) throw 'Failed to delete the section.';

  
    return deletionInfo;
};

