import {posts} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export const addPost = async (
    sectionId,
    title,
    content,
    pub,
    usernames,
    image
) => {


if(sectionId===undefined){
   throw 'Section ID is undefined';
}

// I didn't check if usernames are undefined. Initially, a user could have not shared with anyone. Let me know if you want me to change this.
//Same for video URL and images because they are optional. Same with video and image.

if(title===undefined){
    throw 'You must have a title for your journal entry.';
}

//if(!ObjectId.isValid(sectionId)){
//    throw 'Invalid object ID.';
//}

if(content===undefined){
    throw 'No text was input.';
}

if(pub===undefined){
    throw 'Public or Private is undefined.';
}

let usernamesArray = [];
if(usernames!==undefined){
    if(typeof usernames !=='string'){
        throw 'Usernames must be a string.';
    }

    usernamesArray = usernames ? usernames.split(',').map(username => username.trim()) : [];
    
    if (usernamesArray.some(username => username === '')) {
        throw 'Usernames cannot contain empty strings.';
    }
}



if(image !== undefined){
    if(typeof image !=='string'){
        throw 'Image is not a string.';
    }
    image=image.trim();
    if(image.length===0){
        image='';
    }
}




if(typeof sectionId !=='string'){
    throw 'Section ID is not a string.';
}


if(typeof title !=='string'){
    throw 'Title is not a string.';
}

if(typeof content !== 'string'){
    throw 'Input is not a string type.';
}

if(typeof pub !=='string'){
    throw 'Pub is not a string.';
}

sectionId=sectionId.trim();
if(sectionId===0){
    throw 'Section ID is empty string.';
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
    sectionId:sectionId,
    usernames:usernamesArray,
    title:title,
    time:time,
    content:content,
    pub:pub,
    image:image
}

let postCollection = await posts();
let insertInfo = await postCollection.insertOne(newEntry);

if(insertInfo.insertedCount===0){
    throw 'Could add new jorunal entry.';
}

return insertInfo.insertedId.toString();



}


export const getPost = async(postId) => {
    if(postId===undefined){
        throw 'Post ID is not provided.';
    }

    if(typeof postId !=='string'){
        throw 'Input is not a string.';
    }

    postId=postId.trim();
    
    if(postId.length===0){
        throw 'Input is empty string.';
    }

    if(!ObjectId.isValid(postId)){
        throw 'Invalid object ID.';
    }

    const postCollection = await posts();
    const post = await postCollection.findOne({_id: new ObjectId(postId)});

    if(post===null){
        throw 'No post with that ID.';
    }

    return post;
}

export const deletePost = async (postId) =>{
    if(postId===undefined){
        throw 'Post ID is not provided.';
    }

    if(typeof postId !=='string'){
        throw 'Input is not a string.';
    }

    postId=postId.trim();
    
    if(postId.length===0){
        throw 'Input is empty string.';
    }

    if(!ObjectId.isValid(postId)){
        throw 'Invalid object ID.';
    }

    const postCollection = await posts();
    
    const deletionInfo = await postCollection.findOneAndDelete({_id:  new ObjectId(postId)});

    if(!deletionInfo){
        throw 'Could not delete post.';
    }

    return {"deleted": true};
}
