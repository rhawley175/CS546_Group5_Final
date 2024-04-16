import {Router} from 'express';
import {addPost, getPost, deletePost} from '../data/posts.js';

const router = Router();


router
.route('/newPost')
.get(async(req,res) => {
    res.render('newPost', {title: 'New Post'});   //change handlebar to entry name.
})
.post(async(req,res) => {
    const data=req.body;
    
    
    
    try{
        const entry = await addPost(data.titleInput, data.entryText, data.pub);
        
        if(entry){
            return res.render('newPost', {title: 'New Post'});
        }
        else{
            res.status(500).render('newPost', {hasError: true, error: 'Internal Server Error.', title: 'New Post'});
        }
    }
    catch(e){
        res.status(400).render('newPost', {hasError: true, error: e, title: 'New Post'});
    }
});
