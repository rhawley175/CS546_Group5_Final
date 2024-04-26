import {sections, journals, posts, users } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
//import * as helpers from '../helpers.js';
import * as postMethods from './posts.js';


export const createSection = async (journalId, title) => {
    if (!journalId || !title) throw ('Journal ID and title must be provided.');
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

export const addPostToSection = async (sectionId, postId) => {
    if (!sectionId || !postId) throw ('Section ID and Post ID must be provided.');
    if (!ObjectId.isValid(sectionId) || !ObjectId.isValid(postId)) throw ('Invalid ID format for section or post.');
    const sectionsCollection = await sections();
    const updateInfo = await sectionsCollection.updateOne(
        { _id: new ObjectId(sectionId) },
        { $push: { posts: new ObjectId(postId) } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw ('Updating the section with the post failed.');
    
    return await getSection(sectionId);
};


export const deleteSection = async (sectionId) => {
    if (!sectionId) throw ('Section ID must be provided.');
    if (!ObjectId.isValid(sectionId)) throw ('Invalid section ID format.');
    const sectionsCollection = await sections();
    const section = await sectionsCollection.findOne({_id: new ObjectId(sectionId)});
    if (!section) throw "We could not find the section to delete.";
    let deletedPost;
    for (let i in section.posts) {
        deletedPost = await postMethods.deletePost(section.posts[i].toString());
        if (!deletedPost) throw "We could not delete all the posts from the section.";
    }
    const journalCollection = await journals();
    const allJournals = await journalCollection.find({}).toArray();
    let journal
    for (let i in allJournals) {
        if (allJournals[i].sections.includes(sectionId)) {
            journal = allJournals[i];
        }
    }
    for (let i in journal.sections) {
        if (journal.sections[i] === sectionId) {
            journal.sections[i] === journal.sections[journal.sections.length - 1];
            journal.sections.pop();
        }
    }
    const updatedJournal = await journalCollection.findOneAndReplace({_id: journal._id}, journal);
    if (!updatedJournal) throw "We could not find the journal this section belongs to.";
    const deletionInfo = await sectionsCollection.deleteOne({ _id: new ObjectId(sectionId) });
    if (!deletionInfo.deletedCount) throw ('Could not delete the section.');
    
    return deletionInfo;
};

