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
