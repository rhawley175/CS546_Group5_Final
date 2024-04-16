import {posts} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export const addPost = async (
    //user_ids,
    //comments,
    //sectionId,
    //usernames,
    title,
    content,
    //videoUrl,
    //image,
    pub
) => {


//if(sectionId===undefined){
//   throw 'Section ID is undefined';
//////}

// I didn't check if usernames are undefined. Initially, a user could have not shared with anyone. Let me know if you want me to change this.
//Same for video URL and images because they are optional.

if(title===undefined){
    throw 'You must have a title for your journal entry.';
}

if(content===undefined){
    throw 'No text was input.';
}

if(pub===undefined){
    throw 'Public or Private is undefined.';
}

//if()
//if(typeof sectionId !=='string'){
 //   throw 'Section ID is not a string.';
//}


if(typeof title !=='string'){
    throw 'Title is not a string.';
}

if(typeof content !== 'string'){
    throw 'Input is not a string type.';
}

if(typeof pub !=='string'){
    throw 'Pub is not a string.';
}

title=title.trim();

if(title.length===0){
    throw 'Title is an empty string.';
}

content=content.trim();

if(content.length===0){
    throw 'Text is empty strings.';
}

if(content.length < 10 || content.length > 1000){
    throw 'Journal entry must be at least 10 characters and no more than 1000.';
}

pub=pub.toLowerCase();
pub=pub.trim();

if(pub.length===0){
    throw 'Pub is empty strings.';
}

if(pub !== 'public' && pub !=='private'){
    throw 'Pub must be either public or private input.';
}

let time = new Date().toLocaleString();


let newEntry = {
    //sectionId:sectionId,
    //usernames:usernames,
    title:title,
    time:time,
    content:content,
    pub:pub
}

let journalCollection = await posts();
let insertInfo = await journalCollection.insertOne(newEntry);

if(insertInfo.insertedCount===0){
    throw 'Could add new jorunal entry.';
}

return insertInfo.insertedId.toString();



}
