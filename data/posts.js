import {posts as postCollection} from '../config/mongoCollections.js';
import {sections as sectionsCollection} from '../config/mongoCollections.js';
import {users, post, sections} from '../config/mongoCollections.js';
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

if(!ObjectId.isValid(sectionId)){
    throw 'Invalid object ID.';
}

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
usernamesArray = [];
usernamesArray.push(usernames);

let newEntry = {
    sectionId:sectionId,
    usernames:usernamesArray,
    title:title,
    time:time,
    content:content,
    pub:pub,
    image:image
}


    const userCollection = await users();
    const user = await userCollection.findOne({username: usernames});
    if (!user) throw "We could not find the user with username: " + usernames + ".";

const postsDb = await postCollection();
let insertInfo = await postsDb.insertOne(newEntry);


if(insertInfo.insertedCount===0){
    throw 'Could not add new jorunal entry.';
}


if (pub === "public") {
    const updatedUser = await userCollection.updateOne({username: usernames}, {$push: {publicPosts: insertInfo.insertedId.toString()}});
    if (!updatedUser.matchedCount && !updatedUser.modifiedCount) throw 'Failed to make the post public.';
}
const sectionsDb = await sectionsCollection();
const updateSection = await sectionsDb.updateOne(

    { _id: new ObjectId(sectionId) },
    { $push: { posts: insertInfo.insertedId } }
);

const userCollection = await users();
const user = await userCollection.findOne({username: usernames});
// if (pub) {
//     if (!user) throw "We could not find "
// if (!updateSection.matchedCount && !updateSection.modifiedCount) throw 'Failed to link the post to the section.';
// }


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

    const postsDb = await postCollection();
    const post = await postsDb.findOne({_id: new ObjectId(postId)});

    if(post===null){
        throw 'No post with that ID.';
    }

    return post;
};

export const getPostsByKeyword = async (keyword) => {
    if (typeof keyword !== 'string') {
        throw 'Keyword is not a string.';
    }

    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword.length === 0) {
        throw 'Keyword is empty string.';
    }

    const postsDb = await postCollection();
    const matchingPosts = await postsDb.find({ 
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
    const userCollection = await users();
    const sectionCollection = await sections();
    const post = await postCollection.findOne({_id: new ObjectId(postId)});
    if (!post) throw "We could not find the post with the id: " + postId + ".";
    const user = await userCollection.findOne({username: post.usernames[0]});
    if (!user) throw "We could not find the user that owns this post.";
    if (post.pub === "public") {
        for (let i in user.publicPosts) {
            if (user.publicPosts[i] === postId) {
                user.publicPosts[i] = user.publicPosts[user.publicPosts.length - 1];
                user.publicPosts.pop();
            }
        }
        const updatedUser = await userCollection.findOneAndReplace({username: user.username}, user);
        if (!updatedUser) throw "We could not update the user in removing the public post.";
    }
    let currUser;
    if (post.usernames.length > 1) {
        for (let i in post.usernames) {
            currUser = await userCollection.findOne({username: post.usernames[i]});
            for (let j in currUser.sharedPosts) {
                if (currUser.sharedPosts[j] === postId) {
                    currUser.sharedPosts[j] = currUser.sharedPosts[currUser.sharedPosts.length - 1];
                    currUser.sharedPosts.pop();
                }
            }
            const updatedUser = await userCollection.findOneAndReplace({username: currUser.username}, currUser);
            if (!updatedUser) throw "We could not update the user.";
        }
    }


    const postsDb = await postCollection();
    const sectionsDb = await sectionsCollection();


    const post = await postsDb.findOne({ _id: new ObjectId(postId) });
    if (!post) throw ('No post with that ID found.');
    const sectionId = post.sectionId.toString();

    const deletionInfo = await postsDb.deleteOne({ _id: new ObjectId(postId) });
    if (deletionInfo.deletedCount === 0) throw ('Could not delete post.');

    const updateResult = await sectionsDb.updateOne(
        { _id: new ObjectId(sectionId) },
        { $pull: { posts: new ObjectId(postId) } }
    );
    if (updateResult.modifiedCount === 0) throw ('Failed to update section after deleting post.');

    return { deleted: true, sectionId: sectionId };

};

export const updatePost = async (
    postId,
    updates
) => {

    const postCollection = await posts();
    postId = helpers.checkId(postId);
    let existingPost = await postCollection.findOne({ _id: new ObjectId(postId) });
    const userCollection = await users();
    let accessingUser = userCollection.findOne({username: existingPost.usernames[0]});
    if (!existingPost) throw 'Post not found.';
    let newPost = new Object();
    newPost._id = new ObjectId(postId);
    newPost.sectionId = existingPost.sectionId;
    newPost.usernames = existingPost.usernames;
    updates = helpers.checkObject(updates);
    let valid = false;
    if (updates.title) {
        if (updates.title !== existingPost.title) valid = true;
        updates.title = helpers.checkString(updates.title, "title");
        newPost.title = updates.title;
    }
    else newPost.title = existingPost.title;
    newPost.time = new Date().toLocaleString();
    if (updates.content) {
        if (updates.content !== existingPost.content) valid = true;
        updates.content = helpers.checkContent(updates.content);
        newPost.content = updates.content;
    }
    else newPost.content = existingPost.content;
    if (updates.pub) {
        if (updates.pub !== "private" && updates.pub !== "public") throw "Public or private indicator is incorrect.";
        if (updates.pub !== existingPost.pub) {
            valid = true;
            newPost.pub = updates.pub;
            if (updates.pub) {
                accessingUser.publicPosts.push(postId);
            }
            else {
                for (let i in accessingUser.publicPosts) {
                    if (accessingUser.publicPosts[i] === postId) {
                        accessingUser.publicPosts[i] = accessingUser.publicPosts[accessingUser.publicPosts.length - 1];
                        accessingUser.publicPosts.pop();
                    }

                }
            }
            const updatedUser = await userCollection.findOneAndReplace({username: userAccessing}, accessingUser);
            if (!updatedUser) throw "Sorry, we could not update the post with id: " + postId +".";
        }
        newPost.pub = updates.pub;
    }
    if (updates.username) {
        updates.username = helpers.checkUsername(updates.username);
        if (!existingPost.usernames.includes(updates.username)) valid = true;
        newPost.usernames.push(updates.username);
        const sharedPost = await sharePost(postId, updates.username);
        if (!sharedPost) throw "Could not share the post."
    }

    if (!valid) throw "Cannot update the post with id: " + postId + ". Nothing is being updated.";
    const updateResult = await postCollection.findOneAndReplace({ _id: new ObjectId(postId) }, newPost);


    return { updated: true };
};


export const getAllUserPosts = async(username, userAccessing, role) => {
    const userCollection = await users();
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
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
                        currPost = await getPost(section.posts[k]._id.toString(), userAccessing, role);
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

export const sharePost = async(postId, username) => {
    const postCollection = await posts();
    const post = await postCollection.findOne({_id: new ObjectId(postId)});
    if (!post) throw "We could not find the post with the id: " + postId;
    const userCollection = await users();
    const owningUser = await userCollection.findOne({username: post.usernames[0]});
    if (!owningUser) throw "We could not find the user this post belongs to.";
    if (!owningUser.sharedPosts.includes(postId.toString())) owningUser.sharedPosts.push(post._id.toString());
    let updatedUser = await userCollection.findOneAndReplace({username: owningUser.username}, owningUser);
    if (!updatedUser) throw "We could not update the owning user.";
    let user = await userCollection.findOne({username: username});
    if (!user) throw "One of the usernames entered does not exist.";
    if (!user.sharedPosts.includes(postId.toString())) user.sharedPosts.push(post._id.toString());
    else throw "This post has already been shared with the user.";
    updatedUser = await userCollection.findOneAndReplace({username: user.username}, user);
    if (!updatedUser) throw "We could not share with one of the users.";
    return true;
};