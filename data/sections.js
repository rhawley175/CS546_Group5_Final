import {sections} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
//import * as helpers from '../helpers.js';


export const createSection = async (journalId, title) => {
    if (!journalId || !title) throw ('Journal ID and title must be provided.');
    if (typeof journalId !== 'string' || typeof title !== 'string') throw ('Journal ID and title must be strings.');

    journalId = journalId.trim();
    title = title.trim();

    if (!ObjectId.isValid(journalId)) throw ('Invalid journal ID format.');
    if (!title.length) throw ('Title cannot be empty.');

    const newSection = {
        journalId: ObjectId(journalId),
        title: title,
        posts: []
    };
    const insertInfo = await sections.insertOne(newSection);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw ('Could not add the section.');

    return await getSection(insertInfo.insertedId.toString());
};

export const getSection = async (sectionId) => {
    if (!sectionId) throw ('Section ID must be provided.');

    if (!ObjectId.isValid(sectionId)) throw ('Invalid section ID format.');
    
    const section = await sections.findOne({ _id: ObjectId(sectionId) });
    if (!section) throw ('Section not found.');
    
    return section;
};

export const getSectionsByJournal = async (journalId) => {
    if (!journalId) throw ('Journal ID must be provided.');
    if (!ObjectId.isValid(journalId)) throw ('Invalid journal ID format.');
    
    const sectionsList = await sections.find({ journalId: ObjectId(journalId) }).toArray();
    
    if (!sectionsList.length) throw ('No sections found for the given journal ID.');

    return sectionsList;
};

export const addPostToSection = async (sectionId, postId) => {
    if (!sectionId || !postId) throw ('Section ID and Post ID must be provided.');
    if (!ObjectId.isValid(sectionId) || !ObjectId.isValid(postId)) throw ('Invalid ID format for section or post.');
    
    const updateInfo = await sections.updateOne(
        { _id: ObjectId(sectionId) },
        { $push: { posts: ObjectId(postId) } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw ('Updating the section with the post failed.');
    
    return await getSection(sectionId);
};

export const deleteSection = async (sectionId) => {
    if (!sectionId) throw ('Section ID must be provided.');
    if (!ObjectId.isValid(sectionId)) throw ('Invalid section ID format.');
    
    const deletionInfo = await sections.deleteOne({ _id: ObjectId(sectionId) });
    
    if (!deletionInfo.deletedCount) throw ('Could not delete the section.');
    
    return deletionInfo;
};