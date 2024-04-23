
import {posts, users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helpers from '../helpers.js';
import * as userMethods from './users.js';

export const addPost = async (
    sectionId,
    title,
    content,
    pub,
    username,
    userAccessing,
    role
) => {
    sectionId = helpers.checkId(sectionId, "section id");
    title = helpers.checkString(title, "title");
    content = helpers.checkContent(content);
    pub = helpers.checkBool(pub, "public or private indicator");
    username = helpers.checkString(username);
    const userCollection = await users();
    const foundUser = await userCollection.findOne({username: username});
    if (!foundUser) throw "Sorry, but we could not find a user with username: " + username + ".";
    userAccessing = helpers.checkString(userAccessing);
    const foundUserAccessing = await userMethods.getUser(userAccessing, userAccessing, role);
    if (!foundUserAccessing) throw "Sorry, but we could not find the accessing user.";
    role = helpers.checkRole(role);
    if (userAccessing !== username && role !== 'admin') throw "Access denied.";
    let usernamesArray = [];
    usernamesArray.push(username);
    let time = new Date().toLocaleString();
    let newEntry = {
        sectionId:sectionId,
        usernames:usernamesArray,
        title:title,
        time:time,
        content:content,
        pub:pub
    }
    let postCollection = await posts();
    let insertInfo = await postCollection.insertOne(newEntry);
    if(!insertInfo.insertedCount===0) throw 'Could not add new journal entry.';
    insertInfo.insertedId = insertInfo.insertedId.toString();
    if (pub === true) {
        foundUser.publicPosts.push(insertInfo.insertedId);
        const userCollection = await users();
        const replacedUser = await userCollection.findOneAndReplace({username: username}, foundUser);
        if (!replacedUser) throw "We could not make the post public.";
    } 
    //TODO: Add to section
    return insertInfo.insertedId;
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

export const getAllPosts = async(username, userAccessing, role) => {
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
            return publicPosts;
        }
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
        if (publicPosts.length == 0 && sharedPosts.length === 0) return username + " does not have any posts that you can view.";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return publicPosts;
        }
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
        //TODO: Add posts from journals and sections.
        let currPost;
        for (let i in currUser.publicPosts) {
            currPost = await getPost(currUser.publicPosts[i], userAccessing, role);
            publicPosts.push(currPost);
        }
        for (let i in currUser.sharedPosts) {
            currPost = await getPost(currUser.sharedPosts[i], userAccessing, role);
            sharedPosts.push(currPost);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0) return "You have no posts to view.";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};

export const getPostsByKeyword = async (keyword, username, userAccessing, role) => {
    keyword = helpers.checkString(keyword);
    if (!role) role = "user";
    else role = helpers.checkRole(role);
    if (!userAccessing) userAccessing = "visitingUser";
    else if (userAccessing !== "visitingUser") {
        userAccessing = helpers.checkString(userAccessing);
        const accessingUser = await userMethods.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "Sorry, but we could not find the accessing user.";
    }
    let allPosts = await getAllPosts(username, userAccessing, role);
    if (!username || userAccessing === "visitingUser") {
        let publicPosts = []
        for (let i in allPosts) {
            if (allPosts[i].title.includes(keyword) || allPosts[i].content.includes(keyword)) publicPosts.push(allPosts[i]);
        }
        if (publicPosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return publicPosts;
        }
    }
    else if (username && userAccessing !== username && role !== "admin") {
        let publicPosts = [];
        let sharedPosts = [];
        for (let i in allPosts.publicPosts) {
            if (allPosts.publicPosts[i].title.includes(keyword) || allPosts.publicPosts[i].content.includes(keyword)) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            if (allPosts.sharedPosts[i].title.includes(keyword) || allPosts.sharedPosts[i].content.includes(keyword)) sharedPosts.push(allPosts.sharedPosts[i]);
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
        for (let i in allPosts.publicPosts) {
            if (allPosts.publicPosts[i].title.includes(keyword) || allPosts.publicPosts[i].content.includes(keyword)) publicPosts.push(allPosts.publicPosts[i]);
        }
        for (let i in allPosts.sharedPosts) {
            if (allPosts.sharedPosts[i].title.includes(keyword) || allPosts.sharedPosts[i].content.includes(keyword)) sharedPosts.push(allPosts.sharedPosts[i]);
        }
        let postObject = {
            publicPosts: publicPosts,
            sharedPosts: sharedPosts
        }
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};

export const getPostsByDate = async (firstDate, secondDate, username, userAccessing, role) => {
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
    let allPosts = await getAllPosts(username, userAccessing, role);
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
        //TODO: Add in search for journals/sections.
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
        if (postObject.publicPosts.length === 0 && postObject.sharedPosts.length === 0) return "We could not find any posts containing the search keyword: " + keyword + ".";
        else  {
            postObject.publicPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            postObject.sharedPosts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return postObject;
        }
    }
};

export const deletePost = async (postId, userAccessing, role) =>{
    postId = helpers.checkId(postId, "post id");
    userAccessing = helpers.checkString(userAccessing);
    role = helpers.checkRole(role);
    const userCollection = await users();
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    const post = await getPost(postId, userAccessing, role);
    if (!post) throw "We could not find the post with postId: " + postId + ".";
    if (post.usernames[0] === userAccessing || role === "admin") {
        for (let i in post.usernames) {
            const currUser = await userCollection.findOne({username: post.usernames[i]});
            for (let j in currUser.sharedPosts) {
                if (currUser.sharedPosts[j] === postId) {
                    currUser.sharedPosts[j] = currUser.sharedPosts[currUser.sharedPosts.length - 1];
                    currUser.sharedPosts.pop();
                }
            }
            const updatedUser = await userCollection.findOneAndReplace({username: userAccessing}, currUser);
            if (!updatedUser) throw "Sorry, but we could not delete the post with id: " + postId + ".";
        }
        if (post.pub) {
            for (let i in accessingUser.publicPosts) {
                if (accessingUser.publicPosts[i] === postId) {
                    accessingUser.publicPosts[i] = accessingUser.publicPosts[accessingUser.publicPosts.length - 1];
                    accessingUser.publicPosts.pop();
                }
            }
            const updatedUser = await userCollection.findOneAndReplace({username: userAccessing}, accessingUser);
            if (!updatedUser) throw "Sorry, but we could not delete the post with id: " + postId + ".";
        }
        //TODO: Remove the post from its section.
        const postCollection = await posts();
        const deletedPost = await postCollection.findOneAndDelete({_id: new ObjectId(postId)});
        if (!deletedPost) throw "Sorry, but we could not delete the post with id: " + postId + ".";
        return {post: postId, deleted: true};
    }
    else if (post.usernames.includes(userAccessing)) {
        for (let i in accessingUser.sharedPosts) {
            if (accessingUser.sharedPosts[i] === postId) {
                accessingUser.sharedPosts[i] = accessingUser.sharedPosts[accessingUser.sharedPosts.length - 1];
                accessingUser.sharedPosts.pop();
            }
        }
        const updatedUser = await userCollection.findOneAndReplace({username: userAccessing}, accessingUser);
        if (!updatedUser) throw "We could not delete the post with id: " + postId + ".";
        for (let i in post.usernames) {
            if (post.usernames[i] === userAccessing) {
                post.usernames[i] = post.usernames[post.usernames.length - 1];
                post.usernames.pop();
            }
        }
        const updatedPost = await updatePost(postId, post.usernames[0], role, post);
        if (!updatedPost) throw "We could not delete the post with id: " + postId + ".";
        return "This post has been deleted for you (but not necessarily others).";
    }
    else throw "Access denied.";
};

export const updatePost = async (
    postId,
    userAccessing,
    role,
    updates
) => {
    userAccessing = helpers.checkString(userAccessing);
    role = helpers.checkRole(role);
    const userCollection = await users();
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    const postCollection = await posts();
    postId = helpers.checkId(postId);
    let existingPost = await postCollection.findOne({ _id: new ObjectId(postId) });
    if (!existingPost) throw 'Post not found.';
    if (existingPost.usernames[0] !== userAccessing && role !== "admin") throw "Access denied.";
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
    if (updates.pub !== undefined) {
        updates.pub = helpers.checkBool(updates.pub, "public or private indicator");
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
    if (!valid) throw "Cannot update the post with id: " + postId + ". Nothing is being updated.";
    const updateResult = await postCollection.findOneAndReplace({ _id: new ObjectId(postId) }, newPost);
    return { updated: true };
};

export const sharePost = async(postId, fromUser, toUser, userAccessing, role) => {
    const postCollection = await posts();
    postId = helpers.checkId(postId, "post id");
    const post = await postCollection.findOne({_id: new ObjectId(postId)});
    if (!post) throw "We could not find the post with id: " + postId + ".";
    const userCollection = await users();
    fromUser = helpers.checkString(fromUser, "originating user");
    const userFrom = await userCollection.findOne({username: fromUser});
    if (!userFrom) throw "We could not find the originating user.";
    toUser = helpers.checkString(toUser, "user the post is being sent to");
    const userTo = await userCollection.findOne({username: toUser});
    if (!userTo) throw "We could not find the user the post is being sent to.";
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    if (userAccessing !== fromUser && role !== "admin") throw "Access denied.";
    if (fromUser === toUser) throw "You cannot share this post with yourself. Why would you want to do that? You can already view the post.";
    if (!userFrom.sharedPosts.includes(postId)) userFrom.sharedPosts.push(postId);
    const updatedUserFrom = await userCollection.findOneAndReplace({username: fromUser}, userFrom);
    if (!updatedUserFrom) throw "We could not share the post with id: " + postId + ".";
    if (userTo.sharedPosts.includes(postId)) throw "You have already shared the post with this user.";
    userTo.sharedPosts.push(postId);
    const updatedUserTo = await userCollection.findOneAndReplace({username: toUser}, userTo);
    if (!updatedUserTo) throw "We could not share the post with id: " + postId + ".";
    post.usernames.push(toUser);
    const updatedPost = await postCollection.findOneAndReplace({_id: new ObjectId(postId)}, post);
    if (!updatedPost) throw "We could not share the post with id: " + postId + ".";
    return true;
};

export const unsharePost = async(postId, fromUser, toUser, userAccessing, role) => {
    const postCollection = await posts();
    postId = helpers.checkId(postId, "post id");
    const post = await postCollection.findOne({_id: new ObjectId(postId)});
    if (!post) throw "We could not find the post with id: " + postId + ".";
    const userCollection = await users();
    fromUser = helpers.checkString(fromUser, "originating user");
    const userFrom = await userCollection.findOne({username: fromUser});
    if (!userFrom) throw "We could not find the originating user.";
    toUser = helpers.checkString(toUser, "user the post is being sent to");
    const userTo = await userCollection.findOne({username: toUser});
    if (!userTo) throw "We could not find the user the post is being sent to.";
    userAccessing = helpers.checkString(userAccessing);
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "We could not find the accessing user.";
    role = helpers.checkRole(role);
    if (userAccessing !== fromUser && role !== "admin") throw "Access denied.";
    if (fromUser === toUser) throw "You cannot unshare this post with yourself.";
    if (!userFrom.sharedPosts.includes(postId)) throw "This post was never shared in the first place.";
    if (!userTo.sharedPosts.includes(postId)) throw "This post was not shared with the given user.";
    for (let i in userTo.sharedPosts) {
        if (userTo.sharedPosts[i] === postId) {
            userTo.sharedPosts[i] = userTo.sharedPosts[userTo.sharedPosts.length - 1];
            userTo.sharedPosts.pop();
        }
    }
    const updateToUser = await userCollection.findOneAndReplace({username: toUser}, userTo);
    if (!updateToUser) throw "Could not unshare the post with id: " + postId + ".";
    for (let i in post.usernames) {
        if (post.usernames[i] === toUser) {
            post.usernames[i] = post.usernames[post.usernames.length - 1];
            post.usernames.pop();
        }
    }
    const updatedPost = await postCollection.findOneAndReplace({_id: new ObjectId(postId)}, post);
    if (!updatedPost) throw "Could not unshare the post with id: " + postId + ".";
    if (post.usernames.length === 1) {
        for (let i in userFrom.sharedPosts) {
            if (userFrom.sharedPosts[i] === postId) {
                userFrom.sharedPosts[i] = userFrom.sharedPosts[userFrom.sharedPosts.length - 1];
                userFrom.sharedPosts.pop();
            }
        }
        const updateFromUser = await userCollection.findOneAndReplace({username: fromUser}, userFrom);
        if (!updateFromUser) throw "Could not unshare the post with id: " + postId + ".";
    }
    return true;
};