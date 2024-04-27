import {Router} from 'express';
const router = Router();
import { ObjectId } from 'mongodb';
import{posts, sections, users, journals} from '../config/mongoCollections.js';
import * as postMethods from "../data/posts.js";
import * as userMethods from '../data/users.js';
import * as helpers from '../helpers.js';

import {addPost, getOtherPost, deletePost, updatePost, getPostsByKeyword} from '../data/posts.js';


router
.route('/newPost/:sectionId')
.get(async(req,res) => {
    if(!req.session.user){
        return res.redirect("/users/login");
    }
    const sectionId = req.params.sectionId;
    if (!sectionId) {
        return res.status(400).render('users/error', { error: 'Section ID is required' });
    }
    const sectionCollection = await sections();
    const section = await sectionCollection.findOne({_id: new ObjectId(sectionId)});
    if (!section) throw "We could not find the section this post would belong to.";
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: section.journalId});
    if (!journal) throw "We could not find the journal this section should belong to.";
    if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") return res.status(403).render("users/error", {error: "Access denied."});
    try {
        res.render('posts/newPost', {
            title: 'Create New Post',
            sectionId: sectionId
        });
    } catch (error) {
        res.status(404).render('users/error', { error: error });
    }
})
.post(async(req,res) => {
   if (!req.session.user) return res.redirect("/users/login");
    const sectionId = req.params.sectionId;
    const data=req.body;
    
    try{
        if (!sectionId) {
            return res.status(400).render('users/error', { error: 'Section ID is required' });
        }
        const sectionCollection = await sections();
        const section = await sectionCollection.findOne({_id: new ObjectId(sectionId)});
        if (!section) throw "We could not find the section this post would belong to.";
        const journalCollection = await journals();
        const journal = await journalCollection.findOne({_id: section.journalId});
        if (!journal) throw "We could not find the journal this section should belong to.";
        if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") return res.status(403).render("users/error", {error: "Access denied."});

        const entry = await addPost(sectionId, data.titleInput, data.entryText, data.pub, req.session.user.username);

        if(entry){
            res.redirect('/sections/' + data.sectionIdInput);
        }
        else{
            res.status(500).render('posts/newPost', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
        }
    }
    catch(e){
        res.status(400).render('posts/newPost', {hasError: true, error: e, title: 'New Post', sectionId: data.sectionIdInput});
    }
});



    /*router
    .route('/delete')
    .get(async(req, res) => {

        if(!req.session.user){
            return res.redirect("/users/login");
        }
        res.render('posts/delete', {title: 'Delete Post'});

    })
    .post(async(req,res) => {
        const data=req.body;
        try{
            
            if(!data.deleteId){
                throw 'Post ID is not provided.';
            }
        
            if(typeof data.deleteId !=='string'){
                throw 'Input is not a string.';
            }
        
            const trimpostId=data.deleteId.trim();
            
            if(trimpostId.length===0){
                throw 'Input is empty string.';
            }
        
            

            let deletedPost = await deletePost(trimpostId);
            
            return res.status(200).render('posts/delete', {title: 'Delete Post', message: 'Deleted successfully.'});

        }
        
        catch(e){
            return res.status(404).render('posts/delete', {title: 'Delete Post', hasError: true, error: e});
        }

    }) */

    router
    .route('/delete/:postId')
    .get(async(req, res) => {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }

        try {
            const postId = req.params.postId;
            const postCollection = await posts();
            const post = await postCollection.findOne({_id: new ObjectId(postId)});
            if (!post) throw "Post not found.";
            if (req.session.user.role !== "admin" && req.session.user.username !== post.usernames[0]) return res.render("users/error", {error: "Access denied."});

            if (!postId || !ObjectId.isValid(postId)) {
                return res.status(400).render("users/error", { error: 'Invalid post ID provided' });
            }

            const result = await deletePost(postId);
            if (result.deleted) {
                res.redirect(`/sections/${result.sectionId}`);
            } else{
                throw ('Deletion failed');
            }
        } catch (error) {
            res.status(500).render("users/error", { error: 'Failed to delete the post: ' + error });
        }
    });

    router
    .route('/update/:postId')
    .get(async(req,res) => {
        let postId;
        if(!req.session.user){
            return res.redirect("/users/login");
        }
        try {
            postId = req.params.postId;
            const postCollection = await posts();
            const post = await postCollection.findOne({_id: new ObjectId(postId)});
            const user = await userMethods.getUser(req.session.user.username, req.session.user.username, req.session.user.role);
            if (!user) throw "We could not find the user this belongs to.";
            if (post.usernames[0].toLowerCase() !== user.username.toLowerCase() && user.role !== "admin") return res.render("users/error", {error: "Access denied."});
            res.render('posts/update', {title: 'Update Post', id: post._id.toString()});  
        } catch(e) {
            return res.status(400).json({error: e});
        }
 //change handlebar to entry name.
    })
    .post(async(req,res) => {
        if (!req.session.user) return res.redirect("/users/login");
        let postId = req.params.postId;
        let title = req.body.titleInput;
        let content = req.body.entryText;
        let valid = false;
        let pub = req.body.pub;
        let username = req.body.usernameInput;
        try{
            if (!req.session.user) return res.redirect("/users/login");
            let postObject = {};
            const userCollection = await users();
            const user = await userCollection.findOne({username: req.session.user.username});
            if (!user) throw "We could not find the accessing user.";
            let userAccessing = req.session.user.username;
            let role = req.session.user.role;
            const post = await postMethods.getPost(postId, userAccessing, role);
            if (!post) return res.status(404).render("users/error", {error: "Post not found."});
            if (post.usernames[0] !== req.session.user.username && req.session.user.role !== "admin") return res.status(403).render("users/error", {error: "Access denied."});
            if (title !== "" && title !== undefined) {
                title = helpers.checkString(title, "title");
                if (title !== post.title) {
                    valid = true;
                    postObject.title = title;
                }
            }
            else postObject.title = post.title;
            if (content !== "" && content !== undefined) {
                content = helpers.checkContent(content);
                if (content !== post.content) {
                    valid = true;
                    postObject.content = content;
                }
            }
            else postObject.content = post.content;
            if (pub !== "public" && pub !== "private") throw "Public or private indicator is incorrect.";
            postObject.pub = pub;
            if (username !== "" && username !== undefined) {
                username = helpers.checkString(username, "username");
                postObject.username = username;
            }        
            const entry = await updatePost(postId, userAccessing, role, postObject);  
            if(entry){
                return res.render('posts/update', {title: 'Update Post', success: true, postId: entry, id: post._id.toString()});
            }
            else{
                res.status(500).render('posts/update', {hasError: true, error: 'Internal Server Error.', title: 'New Post', id: post._id.toString()});
            }
        }
        catch(e){
            res.status(400).render('users/error', {hasError: true, error: e, title: 'Update Post'});
        }
    });


    


    router.route('/search')
    .get(async (req, res) => {
        let username = false;
        if (req.session.user) username = req.session.user.username;
        res.render('posts/search', { title: 'Search Post', username: username }); 
    })
    .post(async (req, res) => { 
        const searchInput = req.body.searchInput.trim();

        if (!searchInput) {
            return res.render('posts/search', { title: 'Search Post', error: 'Search input is empty' });
        }

        try {
            const searchResults = await getPostsByKeyword(searchInput);
            
            
            
            return res.render('posts/search', {title: 'Search Post', searchResults });
        } catch (error) {
            return res.render('posts/search', {title: 'Search Post',  error: error });
        }
    });

    router
    .route('/:postId')
    .get(async(req, res) => {
        try{


            const postId=req.params.postId;
            
            if(!postId){
                throw 'Post ID is not provided.';
            }
        
            if(typeof postId !=='string'){
                throw 'Input is not a string.';
            }
           
            const trimpostId=postId.trim();
            
            if(trimpostId.length===0){
                throw 'Input is empty string.';
            }
            
            const post = await getOtherPost(trimpostId);
            if (!post) throw "We could not find the post.";
            if (post.pub !== "public" && !req.session.user) return res.redirect("/users/login");
            let owned = false;
            let user;
            if (req.session.user) {
                user = await userMethods.getUser(req.session.user.username, req.session.user.username, req.session.user.role);
                if (!user) throw "We cannot find the accessing user.";
                let usernames = post.usernames;
                for (let i in usernames) {
                    usernames[i] = usernames[i].toLowerCase();
                }
                if (!post.usernames.includes(user.username.toLowerCase()) && user.role !== "admin" && post.pub !== "public") throw "Access denied.";
                if (req.session.user.username.toLowerCase() === post.usernames[0].toLowerCase()) {
                    owned = true;
                }
            };
            if(post && req.session.user){
                user = await userMethods.getUser(req.session.user.username, req.session.user.username, req.session.user.role);
                return res.status(200).render('posts/post', {title: post.title, content: post.content, id: post._id.toString(), owned: owned, sectionId: post.sectionId, username: user.username});
            }
            else if (post) {
                return res.status(200).render('posts/post', {title: post.title, content: post.content, id: post._id.toString(), owned: owned, sectionId: post.sectionId});
            }
            else{
                res.status(500).render('posts/post', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
            }
        }
        catch(e){
            return res.status(404).render('users/error', { error: e});
        }
      
    if(!req.session.user){
            return res.redirect("/users/login");
        }  

    try {
        const postId = req.params.postId;
        const post = await getOtherPost(postId);
        if (!post) {
            res.status(404).render('users/error', { error: 'Post not found' });
            return;
        }
        res.render('posts/post', {  title: post.title, post: post });
    } catch (error) {
        res.status(500).render('users/error', { error: 'Failed to retrieve the post' });
    }
});



export default router;

