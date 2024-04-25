
import {posts, users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helpers from '../helpers.js';
import * as userMethods from '../data/users.js';
import * as journalMethods from '../data/journals.js';
import * as sectionMethods from '../data/sections.js';

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


export const getOtherPost = async(postId) => {
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

export const getPostsByKeyword = async (keyword) => {
    if (typeof keyword !== 'string') {
        throw 'Keyword is not a string.';
    }

    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword.length === 0) {
        throw 'Keyword is empty string.';
    }

    const postCollection = await posts();
    const matchingPosts = await postCollection.find({ 
        title: { $regex: trimmedKeyword, $options: 'i' },
        pub: 'public'}).toArray();

    if (matchingPosts.length === 0) {
        throw 'No posts found with title containing keyword: ' + trimmedKeyword;
    }

    return matchingPosts;
};

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

export const updatePost = async (
    postId,
    updates
) => {
    let postCollection = await posts();

    if (!postId || typeof postId !== 'string') {
        throw 'Invalid postId.';
    }

    postId = new ObjectId(postId);

    let existingPost = await postCollection.findOne({ _id: postId });
    if (!existingPost) {
        throw 'Post not found.';
    }

    
    if (updates && typeof updates === 'object') {
        for (let field in updates) {
            
            if (updates[field] !== null) {
                switch (field) {
                    case 'sectionId':
                        if (typeof updates[field] !== 'string') {
                            throw 'Section ID must be a string.';
                        }
                        existingPost.sectionId = updates[field].trim();
                        break;
                    case 'title':
                        if (typeof updates[field] !== 'string') {
                            throw 'Title must be a string.';
                        }
                        existingPost.title = updates[field].trim();
                        break;
                    case 'content':
                        if (typeof updates[field] !== 'string') {
                            throw 'Content must be a string.';
                        }
                        existingPost.content = updates[field].trim();
                        break;
                    case 'pub':
                        if (typeof updates[field] !== 'string') {
                            throw 'Pub must be a string.';
                        }
                        let pub = updates[field].toLowerCase().trim();
                        if (pub !== 'public' && pub !== 'private') {
                            throw 'Pub must be either "public" or "private".';
                        }
                        existingPost.pub = pub;
                        break;
                    case 'usernames':
                        if (typeof updates[field] !== 'string') {
                            throw 'Usernames must be a string.';
                        }
                        let usernamesArray = updates[field].split(',').map(username => username.trim());
                        existingPost.usernames = usernamesArray.filter(username => username !== '');
                        break;
                    case 'image':
                        if (typeof updates[field] !== 'string') {
                            throw 'Image must be a string.';
                        }
                        existingPost.image = updates[field].trim();
                        break;
                    default:
                        throw `Invalid field '${field}' for updating.`;
                }
            }
        }
    }

    
    if (Object.keys(updates || {}).length > 0) {
        existingPost.time = new Date().toLocaleString();
    }

    let updateFields = {};
    
    if (existingPost.sectionId !== null && updates.sectionId !== null) {
        updateFields.sectionId = existingPost.sectionId;
    }
    if (existingPost.title !== null && updates.title !== null) {
        updateFields.title = existingPost.title;
    }
    if (existingPost.content !== null && updates.content !== null) {
        updateFields.content = existingPost.content;
    }
    if (existingPost.pub !== null && updates.pub !== null) {
        updateFields.pub = existingPost.pub;
    }
    if (existingPost.usernames !== null && updates.usernames !== null) {
        updateFields.usernames = existingPost.usernames;
    }
    if (existingPost.image !== null && updates.image !== null) {
        updateFields.image = existingPost.image;
    }

    let updateResult = await postCollection.updateOne({ _id: postId }, { $set: updateFields });

    if (updateResult.modifiedCount === 0) {
        throw 'Could not update the post.';
    }

    return { updated: true };
}


export const getAllUserPosts = async(username, userAccessing, role) => {
    const userCollection = await users();
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing);
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "Sorry, but we could not find the accessing user.";
    }
    if (!username) {
        const foundUsers = await userCollection.find({}).toArray();
        let publicPosts = [];
        let currPost;
        for (let i in foundUsers) {
            for (let j in foundUsers[i].publicPosts) {
                currPost = await getPost(foundUsers[i].publicPosts[j]);
                publicPosts.push(currPost);
            }
        }
        if (publicPosts.length === 0) return "There are no public posts for you to view.";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        }
        let postObject = {
            publicPosts: publicPosts
        }
        return postObject;
    }
    else if (username && userAccessing === "visitingUser") {
        const currUser = await userMethods.getUser(username, userAccessing, role);
        if (!currUser) throw "User: " + username + " not found.";
        let publicPosts = [];
        let currPost;
        for (let i in currUser.publicPosts) {
            currPost = await getPost(currUser.publicPosts[i]);
            publicPosts.push(currPost);
        }
        if (publicPosts.length == 0) return username + " does not have any posts that you can view.";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        }
        let postObject = {
            publicPosts: publicPosts
        }
        return postObject;
    }
    else if (username && userAccessing !== username && role !== "admin") {
        const currUser = await userMethods.getUser(username, userAccessing, role);
        if (!currUser) throw "User: " + username + " not found.";
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        let publicPosts = [];
        let sharedPosts = [];
        let currPost;
        for (let i in currUser.publicPosts) {
            currPost = await getPost(currUser.publicPosts[i]);
            publicPosts.push(currPost);
        }
        for (let i in currUser.sharedPosts) {
            if (accessingUser.sharedPosts.includes(currUser.sharedPosts[i])) {
                currPost = await getPost(currUser.sharedPosts[i], userAccessing, role);
            }
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts
        }
        if (publicPosts.length == 0 && sharedPosts.length === 0) return username + " does not have any posts that you can view.";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
    else {
        const currUser = await userMethods.getUser(username, userAccessing, role);
        if (!currUser) throw "User: " + username + " not found.";
        let publicPosts = [];
        let sharedPosts = [];
        let privatePosts = [];
        let currPost;
        let journal;
        let section;
        for (let i in currUser.publicPosts) {
            currPost = await getPost(currUser.publicPosts[i], userAccessing, role);
            publicPosts.push(currPost);
        }
        for (let i in currUser.sharedPosts) {
            currPost = await getPost(currUser.sharedPosts[i], userAccessing, role);
            sharedPosts.push(currPost);
        }
        for (let i in currUser.journals) {
            journal = await journalMethods.getJournalById(currUser.journals[i], userAccessing, role);
            for (let j in journal.sections) {
                section = await sectionMethods.getSection(journal.sections[j], userAccessing, role);
                for (let k in section.posts) {
                    if (!publicPosts.includes(section.posts[k]) && !sharedPosts.includes(section.posts[k])) {
                        currPost = await getPost(section.posts[k], userAccessing, role);
                        privatePosts.push(currPost);
                    }
                }
            }
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts,
            privatePosts: privatePosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0 && postObject.privatePosts.length === 0) return "You have no posts to view.";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.privatePosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};

export const getPost = async(postId, userAccessing, role) => {
    postId = helpers.checkId(postId);
    const postCollection = await posts();
    const post = await postCollection.findOne({_id: new ObjectId(postId)});
    if(!post) throw 'No post with that ID.';
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing);
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "Sorry, but we could not find the accessing user.";
    }
    if (post.pub === false) {
        let valid = false;
        if (post.usernames.includes(userAccessing)) valid = true;
        if (!valid && role !== "admin") throw "Access denied.";
    }
    return post;
};

export const getUserPostsByKeyword = async (keyword, username, userAccessing, role) => {
    keyword = helpers.checkString(keyword);
    keyword = keyword.toLowerCase();
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing);
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "Sorry, but we could not find the accessing user.";
    }
    let allPosts = await getAllUserPosts(username, userAccessing, role);
    if (!username || userAccessing === "visitingUser") {
        let publicPosts = []
        for (let i in allPosts.publicPosts) {
            if (allPosts.publicPosts[i].title.toLowerCase().includes(keyword) || allPosts.publicPosts[i].content.toLowerCase().includes(keyword)) publicPosts.push(allPosts.publicPosts[i]);
        }
        if (publicPosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        }
        let postObject = {
            publicPosts: publicPosts
        }
        return postObject;
    }
    else if (username && userAccessing !== username && role !== "admin") {
        let publicPosts = [];
        let sharedPosts = [];
        for (let i in allPosts.publicPosts) {
            if (allPosts.publicPosts[i].title.toLowerCase().includes(keyword) || allPosts.publicPosts[i].content.toLowerCase().includes(keyword)) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            if (allPosts.sharedPosts[i].title.toLowerCase().includes(keyword) || allPosts.sharedPosts[i].content.toLowerCase().includes(keyword)) sharedPosts.push(allPosts.sharedPosts[i]);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return publicPosts;
        }
    }
    else {
        //TODO: Add in search for journals/sections.
        let publicPosts = [];
        let sharedPosts = [];
        let privatePosts = [];
        for (let i in allPosts.publicPosts) {
            if (allPosts.publicPosts[i].title.toLowerCase().includes(keyword) || allPosts.publicPosts[i].content.toLowerCase().includes(keyword)) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            if (allPosts.sharedPosts[i].title.toLowerCase().includes(keyword) || allPosts.sharedPosts[i].content.toLowerCase().includes(keyword)) sharedPosts.push(allPosts.sharedPosts[i]);
        }
        for (let i in allPosts.privatePosts) {
            if (allPosts.privatePosts[i].title.toLowerCase().includes(keyword) || allPosts.privatePosts[i].content.toLowerCase().includes(keyword)) privatePosts.push(allPosts.privatePosts[i]);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts,
            privatePosts: privatePosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0 && postObject.privatePosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.privatePosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};

export const getUserPostsByDate = async (firstDate, secondDate, username, userAccessing, role) => {
    firstDate = helpers.checkDate(firstDate);
    let earlyDate = Date.parse(firstDate);
    secondDate = helpers.checkDate(secondDate);
    let lateDate = Date.parse(secondDate);
    if (earlyDate > lateDate) throw "The from date is later than the to date.";
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing);
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "Sorry, but we could not find the accessing user.";
    }
    let allPosts = await getAllUserPosts(username, userAccessing, role);
    let date;
    if (!username || userAccessing === "visitingUser") {
        let publicPosts = [];
        for (let i in allPosts) {
            date = new Date(allPosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) publicPosts.push(allPosts[i]);
        }
        if (publicPosts.length === 0) return "We could not find any posts between the dates " + firstDate + " and " + secondDate + ".";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return publicPosts;
        }
    }
    else if (username && userAccessing !== username && role !== "admin") {
        let publicPosts = [];
        let sharedPosts = [];
        for (let i in allPosts.publicPosts) {
            date = new Date(allPosts.publicPosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            date = new Date(allPosts.sharedPosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) sharedPosts.push(allPosts.sharedPosts[i]);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0) return "We could not find any posts between the dates " + firstDate + " and " + secondDate + ".";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return publicPosts;
        }
    }
    else {
        let publicPosts = [];
        let sharedPosts = [];
        let privatePosts = [];
        for (let i in allPosts.publicPosts) {
            date = new Date(allPosts.publicPosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            date = new Date(allPosts.sharedPosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) sharedPosts.push(allPosts.sharedPosts[i]);
        }
        for (let i in allPosts.privatePosts) {
            date = new Date(allPosts.privatePosts[i].time);
            date = date.toLocaleDateString();
            date = Date.parse(date);
            if (date >= earlyDate && date <= lateDate) privatePosts.push(allPosts.privatePosts[i]);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts,
            privatePosts: privatePosts
        }
  
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0 && postObject.privatePosts.length === 0) return "We could not find any posts between the dates " + firstDate + " and " + secondDate + ".";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.privatePosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};