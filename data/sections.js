import {sections, journals, posts, users } from '../config/mongoCollections.js';
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
        { $push: { sections: insertInfo.insertedId } }
      );
    
      if (!updateJournalInfo.matchedCount && !updateJournalInfo.modifiedCount)
        throw ('Failed to link section to journal');
    

    return await getSection(insertInfo.insertedId.toString());
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
    const journalCollection = await journals();

    const section = await sectionsCollection.findOne({ _id: new ObjectId(sectionId) });
    if (!section) throw 'Section not found.';

    if (section.posts && section.posts.length > 0) {
        const postsCollection = await posts();
        await postsCollection.deleteMany({ _id: { $in: section.posts.map(id => new ObjectId(id)) } });
    }

    const deletionInfo = await sectionsCollection.deleteOne({ _id: new ObjectId(sectionId) });
    if (!deletionInfo.deletedCount) throw 'Failed to delete the section.';

    const updateJournal = await journalCollection.updateOne(
        { _id: new ObjectId(section.journalId) },
        { $pull: { sections: new ObjectId(sectionId) } }
    );
    if (!updateJournal.matchedCount || !updateJournal.modifiedCount) {
        throw 'Failed to remove the section from the journal.';
    }

    return deletionInfo;
};

