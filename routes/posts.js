import {Router} from 'express';
import {addPost, getPost, deletePost} from '../data/posts.js';

const router = Router();


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
    .route('/post/:postId')
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
        
            
            const post = await getPost(trimpostId);
            
            if(post){
                console.log("Success");
                return res.status(200).render('posts/post', {title: post.title, content: post.content});
            }
            else{
                res.status(500).render('posts/post', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
            }
        }
        catch(e){
            return res.status(404).render('posts/post', {hasError: true, error:e});
        }
    })


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
