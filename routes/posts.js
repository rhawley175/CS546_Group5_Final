import {Router} from 'express';
const router = Router();

import {addPost, getOtherPost, deletePost, updatePost, getPostsByKeyword} from '../data/posts.js';


router
.route('/newPost')
.get(async(req,res) => {
    res.render('posts/newPost', {title: 'New Post'});   //change handlebar to entry name.
})
.post(async(req,res) => {
    const data=req.body;
    
    
    
    
    try{
        const entry = await addPost(data.sectionIdInput, data.titleInput, data.entryText, data.pub, data.usernameInput);

        if(entry){
            return res.render('posts/newPost', {title: 'New Post', success: true, postId: entry});
        }
        else{
            res.status(500).render('posts/newPost', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
        }
    }
    catch(e){
        res.status(400).render('posts/newPost', {hasError: true, error: e, title: 'New Post'});
    }
});



    router
    .route('/delete')
    .get(async(req, res) => {
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

    })

    router
    .route('/update')
    .get(async(req,res) => {
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
                
                return res.status(200).render('posts/post', {title: post.title, content: post.content});
            }
            else{
                res.status(500).render('posts/post', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
            }
        }
        catch(e){
            return res.status(404).render('posts/post', {title: 'Error', hasError: true, error:e});
        }
    });




export default router;
