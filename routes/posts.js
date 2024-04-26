import {Router} from 'express';
const router = Router();
import { ObjectId } from 'mongodb';

import {addPost, getOtherPost, deletePost, updatePost, getPostsByKeyword} from '../data/posts.js';


router
.route('/newPost')
.get(async(req,res) => {
    if(!req.session.user){
        return res.redirect("/users/login");
    }
    const sectionId = req.query.sectionId;
    if (!sectionId) {
        return res.status(400).render('posts/error', { error: 'Section ID is required' });
    }
    try {
        res.render('posts/newPost', {
            title: 'Create New Post',
            sectionId: sectionId
        });
    } catch (error) {
        res.status(404).render('posts/error', { error: 'Failed to render the post creation page.' });
    }
})
.post(async(req,res) => {
   
    
    const data=req.body;
    
    try{
        const entry = await addPost(data.sectionIdInput, data.titleInput, data.entryText, data.pub, data.usernameInput);

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
            return res.status(403).render('posts/error', { error: "You are not authorized to perform this action." });
        }

        try {
            const postId = req.params.postId;

            if (!postId || !ObjectId.isValid(postId)) {
                return res.status(400).render('posts/error', { error: 'Invalid post ID provided' });
            }

            const result = await deletePost(postId);
            if (result.deleted) {
                res.redirect(`/sections/${result.sectionId}`);
            } else{
                throw ('Deletion failed');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            res.status(500).render('posts/error', { error: 'Failed to delete the post.' });
        }
    });

    router
    .route('/update')
    .get(async(req,res) => {
        if(!req.session.user){
            return res.redirect("/users/login");
        }
        res.render('posts/update', {title: 'Update Post'});   //change handlebar to entry name.
    })
    .post(async(req,res) => {
        const data=req.body;
        
        try{
            const updates = {};


            if (data.sectionIdInput.trim() !== '') {
                updates.sectionId = data.sectionIdInput.trim();
            }

            if (data.titleInput.trim() !== '') {
                updates.title = data.titleInput.trim();
            }

            if (data.entryText.trim() !== '') {
                updates.content = data.entryText.trim();
            }


            if (data.pub !== '') {
                updates.pub = data.pub;
            }

            if (data.usernameInput !== undefined) {
                updates.usernames = data.usernameInput !== null && data.usernameInput.trim() !== '' ? data.usernameInput.trim() : null;
            }

            const entry = await updatePost(data.postIdInput, updates);
            if(entry){
                return res.render('posts/update', {title: 'Update Post', success: true, postId: entry});
            }
            else{
                res.status(500).render('posts/update', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
            }
        }
        catch(e){
            res.status(400).render('posts/update', {hasError: true, error: e, title: 'Update Post'});
        }
    });


    


    router.route('/search')
    .get(async (req, res) => {
        if(!req.session.user){
            return res.redirect("/users/login");
        }
        res.render('posts/search', { title: 'Search Post' }); 
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
        
        if(!req.session.user){
            return res.redirect("/users/login");
        }
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
            
            if(post){
                
                return res.status(200).render('posts/post', {title: post.title, content: post.content, _id: post._id, time:post.time});
            }
            else{
                res.status(500).render('posts/post', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
            }
        }
        catch(e){
            return res.status(404).render('error', { error: 'Error fetching post' });
        }
      
    if(!req.session.user){
            return res.redirect("/users/login");
        }  

    try {
        const postId = req.params.postId;
        const post = await getOtherPost(postId);
        if (!post) {
            res.status(404).render('posts/error', { error: 'Post not found' });
            return;
        }
        res.render('posts/post', {  title: post.title, post: post });
    } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(500).render('posts/error', { error: 'Failed to retrieve the post' });
    }
});



export default router;

