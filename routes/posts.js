import {Router} from 'express';
const router = Router();

import * as posts from '../data/posts.js';
import * as sections from '../data/sections.js';
import * as journals from '../data/journals.js';
import * as helpers from '../helpers.js';
import * as users from '../data/users.js';


router
.route('/newPost/:sectionId')
.get(async(req,res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let sectionId = req.params.sectionId;
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "section id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        return res.status(200).render('posts/newPost', {title: 'New Post'});   //change handlebar to entry name.
    } catch(e) {
        return res.status(500).render('posts/error', {error: e});
    }
})
.post(async(req,res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let sectionId = req.params.sectionId;
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let title = req.body.title;
    let content = req.body.content;
    let pub = req.body.pub;
    let username;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "section id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        username = journal.author;
        title = helpers.checkString(title, "title");
        content = helpers.checkContent(content);
        if (pub === "public") pub = true;
        else pub = false;
        pub = helpers.checkBool(pub, "public or private indicator");
    } catch(e) {
        return res.status(400).render('posts/error', {error: e});
    }
    try {
        const post = await posts.addPost(sectionId, title, content, pub, username, userAccessing, role);
        let newPost = await posts.getPost(post, userAccessing, role);
        return res.status(200).json(newPost);
    } catch(e) {
        return res.status(500).render('posts/error', {error: e});
    }
});



router
.route('/delete/:postId')
.get(async(req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "post id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."});
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (!post.usernames.includes(userAccessing) && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        return res.render('posts/delete', {title: 'Delete Post'});
    } catch(e) {
        return res.status(500).render('posts/error', {error: e});
    }
})
.post(async(req,res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "post id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."});
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
    } catch(e) {
        return res.status(400).json({error: e});
    }
    try {
        const deletedPost = await posts.deletePost(postId, userAccessing, role);
        return res.status(200).render('posts/delete', {title: 'Delete Post', message: 'Deleted successfully.'});
    } catch(e) {
        return res.status(500).render('posts/error', {error: e});
    }
});

router
.route('/update/:postId')
.get(async(req,res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "section id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."}); 
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        let postTitle = post.title;
        let content = post.content;
        let pub = post.pub;
        return res.status(200).render("posts/update", {title: 'Update Post', postTitle: postTitle, content: content, pub: pub});
    } catch(e) {
        return res.status(400).render('posts/error', {error: e});
    }   //change handlebar to entry name.
})
.post(async(req,res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    let title = req.body.title;
    let content = req.body.content;
    let pub = req.body.pub;
    let username;
    let postObject = new Object();
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "section id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."}); 
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        username = journal.author;
        let valid = false;
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
        if (pub !== "" && content !== undefined) {
            if (pub === "public") pub = true;
            else pub = false;
            pub = helpers.checkBool(pub, "public or private indicator");
            if (pub !== post.pub) {
                valid = true;
                postObject.pub = pub;
            }
        }
        else postObject.pub = post.pub;
        if (valid === false) throw "Nothing is being updated.";
    } catch(e) {
        return res.status(400).render('posts/error', {error: e});
    }
    try {
        const updatedPost = await posts.updatePost(postId, userAccessing, role, postObject);
        return res.status(200).render('posts/update', {title: 'Update Post', success: true, postId: postId});
    } catch(e) {
        return res.status(500).json({error: e});
    }
});


    

    //unnecessary: Cannot search through all posts.
    // router.route('/search')
    // .get(async (req, res) => {
    //     res.render('posts/search', { title: 'Search Post' }); 
    // })
    // .post(async (req, res) => { 
    //     const searchInput = req.body.searchInput.trim();

    //     if (!searchInput) {
    //         return res.render('posts/search', { title: 'Search Post', error: 'Search input is empty' });
    //     }

    //     try {
    //         const searchResults = await getPostsByKeyword(searchInput);
            
            
            
    //         return res.render('posts/search', {title: 'Search Post', searchResults });
    //     } catch (error) {
    //         return res.render('posts/search', {title: 'Search Post',  error: error });
    //     }
    // });

router
.route('/:postId')
.get(async(req, res) => {
    let userAccessing;
    let role;
    let postId = req.params.postId;
    try {
        if (!req.session.user)  {
            userAccessing = "visitingUser";
            role = "user";
        }
        else {
            userAccessing = helpers.checkString(userAccessing, "accessing user");
            role = helpers.checkRole(role);
            const accessingUser = await users.getUser(userAccessing, userAccessing, role);
            if (!accessingUser) throw "We could not find the accessing user.";
        }
        postId = helpers.checkId(postId, "section id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."}); 
        if (post.pub === false && !post.usernames.includes(userAccessing) && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        return res.status(200).render('posts/post', {title: post.title, content: post.content});
    } catch(e) {
        return res.status(500).render("posts/error", {error: e});
    }
});

router
.route('/share/:postId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "post id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."});
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        return res.status(200).json("posts/share");
    } catch(e) {
        return res.status(500).render("posts/error", {error: e});
    }
}).post(async(req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let postId = req.params.postId;
    let fromUser = userAccessing;
    let toUser = req.body.username;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        postId = helpers.checkId(postId, "post id");
        const post = await posts.getPost(postId, userAccessing, role);
        if (!post) return res.status(404).render("posts/error", {error: "Post not found."});
        const section = await sections.getSection(post.sectionId, userAccessing, role);
        if (!section) return res.status(404).render("posts/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("posts/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("posts/error", {error: "Access denied."});
        fromUser = helpers.checkString(fromUser);
        const foundFromUser = await users.getUser(fromUser, userAccessing, role);
        if (!foundFromUser) return res.status(404).render("posts/error", {error: "From user not found."});
        toUser = helpers.checkString(toUser);
        const foundToUser = await users.getUser(toUser, userAccessing, role);
        if (!foundToUser) return res.status(404).render("posts/error", {error: "From user not found."});
        if (post.usernames.includes(toUser)) throw "This user already has the post shared with them.";
    } catch(e) {
        return res.status(400).json({error: e});
    }
    try {
        const sharedPost = await posts.sharePost(postId, fromUser, toUser, userAccessing, role);
        return res.json(sharedPost);
    } catch(e) {
        return res.status(500).render("posts/error", {error: e});
    }
})


export default router;
