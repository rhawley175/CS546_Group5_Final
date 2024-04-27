import {Router} from 'express';
import * as sections from '../data/sections.js';
import { ObjectId } from 'mongodb';
import {journals} from '../config/mongoCollections.js';
const router = Router();
import xss from 'xss';

router
.route('/newSection')
.get( async(req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    const journalId = req.query.journalId;
    const journalCollection = await journals();
    const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
    if (!journal) throw "We could not find the journal this section belongs to.";
    //if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") throw "Access denied.";
    if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") {
        return res.status(403).render('sections/error', { error: "Access denied." });
    }

    if (!journalId) {
        return res.status(400).render('sections/error', { error: 'Journal ID is required' });
    }
    
    res.render('sections/newSection', { title: 'Create New Section', journalId: journalId });
})
.post(async (req, res) => {
    try {
        var html = xss(req.body);
        html = xss(req.body.title);
        html = xss(req.body.journalId);
        if (!req.session.user) return res.redirect("/users/login");
        const { journalId, title } = req.body;
        
        /* if (!journalId || !title) throw 'Journal ID and title must be provided';
        if (!ObjectId.isValid(journalId)) throw 'Invalid journal ID provided'; */

        if (!journalId || !title) {
            return res.status(400).render('sections/error', { error: 'Journal ID and title must be provided' });
        }
        if (!ObjectId.isValid(journalId)) {
            return res.status(400).render('sections/error', { error: 'Invalid journal ID provided' });
        }

        const journalCollection = await journals();
        const journal = await journalCollection.findOne({_id: new ObjectId(journalId)});
        if (!journal) throw "We could not find the journal this section belongs to.";
        //if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") throw "Access denied.";
        if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") {
            return res.status(403).render('sections/error', { error: "Access denied." });
        }
        const section = await sections.createSection(journalId.trim(), title.trim(), req.session.user._id);

        
        res.render('sections/newSection', { title: 'Create New Section', success: true, sectionId: section._id });
    } catch (e) {
        res.status(500).render('sections/error', { error: e });
    }
}); 

router
.route('/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    const sectionId = req.params.sectionId;
    if (!sectionId || !ObjectId.isValid(sectionId)) {
        return res.status(400).render('sections/error', { error: 'Invalid section ID provided' });
    }

    try {
        const section = await sections.getSection(sectionId);
        if (!section) throw ('Section not found.');
        const journalCollection = await journals();
        const journal = await journalCollection.findOne({_id: new ObjectId(section.journalId)});
        if (!journal) throw "We could not find the journal this section belongs to.";
        //if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") throw "Access denied.";
        if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") {
            return res.status(403).render('sections/error', { error: "Access denied." });
        }
        res.render('sections/sectionDetails', { section });
    } catch (e) {
        res.status(404).render('sections/error', { error: e });
    }
});


router
.route('/delete/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");

    try {
        const sectionId = req.params.sectionId;
        if (!sectionId || !ObjectId.isValid(sectionId)) throw 'Invalid section ID provided';

        const section = await sections.getSection(sectionId);
        if (!section) throw 'Section not found';

        if (!req.session.user || (section.userId.toString() !== req.session.user._id && req.session.user.role !== "admin")) {
            return res.status(403).render('sections/error', { error: "You do not have permission to delete this section." });
        }

        res.render('sections/deleteSection', { title: 'Delete Section', section: section });
    } catch (e) {
        res.status(404).render('sections/error', { e: e.message });
    }
})
.post(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    try {
        const sectionId = req.params.sectionId;

        if (!sectionId || !ObjectId.isValid(sectionId)) throw 'Invalid section ID provided';

        const section = await sections.getSection(sectionId);
        if (!section) throw 'Section not found';

        if (!req.session.user || (section.userId.toString() !== req.session.user._id && req.session.user.role !== "admin")) {
            return res.status(403).render('sections/error', { error: "You do not have permission to delete this section." });
        }
        if (!section) throw ('Section not found.');
        const journalCollection = await journals();
        const journal = await journalCollection.findOne({_id: section.journalId});
        if (!journal) throw "We could not find the journal this section belongs to.";
        if (journal.author[0] !== req.session.user.username && req.session.user.role !== "admin") return res.render("users/error", {error: "Access denied."});
        await sections.deleteSection(sectionId);
        res.redirect('/journals');
    } catch (e) {
        res.status(500).render('sections/error', { e: 'Failed to delete the section.' });
    }
});

export default router;