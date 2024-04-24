import {sections, journals} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
//import * as helpers from '../helpers.js';


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
        { $push: { sections: insertInfo.insertedId } }
      );
    
      if (!updateJournalInfo.matchedCount && !updateJournalInfo.modifiedCount)
        throw ('Failed to link section to journal');
    

    return await getSection(insertInfo.insertedId.toString());
};

export const getSection = async (sectionId) => {
    if (!sectionId) throw ('Section ID must be provided.');

    if (!ObjectId.isValid(sectionId)) throw ('Invalid section ID format.');
    const sectionsCollection = await sections();
    const section = await sectionsCollection.findOne({ _id: new ObjectId(sectionId) });
    if (!section) throw ('Section not found.');
    
    return section;
};

export const getSectionsByJournal = async (journalId) => {
    if (!journalId) throw ('Journal ID must be provided.');
    if (!ObjectId.isValid(journalId)) throw ('Invalid journal ID format.');
    const sectionsCollection = await sections();
    const sectionsList = await sectionsCollection.find({ journalId: new ObjectId(journalId) }).toArray();
    
    if (!sectionsList.length) throw ('No sections found for the given journal ID.');

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
    const deletionInfo = await sectionsCollection.deleteOne({ _id: new ObjectId(sectionId) });
    
    if (!deletionInfo.deletedCount) throw ('Could not delete the section.');
    
    return deletionInfo;
};