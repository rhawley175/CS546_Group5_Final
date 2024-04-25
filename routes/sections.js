import {Router} from 'express';
import * as sections from '../data/sections.js';
import { ObjectId } from 'mongodb';
const router = Router();


router
.route('/newSection')
.get((req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const journalId = req.query.journalId;
    if (!journalId) {
        return res.status(400).render('sections/error', { error: 'Journal ID is required' });
    }
    res.render('sections/newSection', { title: 'Create New Section', journalId: journalId });
})
.post(async (req, res) => {
    try {
        if (!req.session.user) return res.redirect("/login");
        const { journalId, title } = req.body;
        
        if (!journalId || !title) throw 'Journal ID and title must be provided';
        if (!ObjectId.isValid(journalId)) throw 'Invalid journal ID provided';

        const section = await sections.createSection(journalId.trim(), title.trim(), req.session.user._id);
        
        res.render('sections/newSection', { title: 'Create New Section', success: true, sectionId: section._id });
    } catch (e) {
        res.status(400).render('sections/error', { error: e });
    }
}); 

router
.route('/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const sectionId = req.params.sectionId;
    if (!sectionId || !ObjectId.isValid(sectionId)) {
        return res.status(400).render('sections/error', { error: 'Invalid section ID provided' });
    }

    try {
        const section = await sections.getSection(sectionId);
        if (!section) throw ('Section not found.');
        if (section.userId.toString() !== req.session.user._id && req.session.user.role !== "admin") {
            return res.status(403).render('sections/error', { error: "Unauthorized access" });
        }
        res.render('sections/sectionDetails', { section });
    } catch (e) {
        res.status(404).render('sections/error', { error: 'Section not found' });
    }
});


router
.route('/delete/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
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
        res.status(404).render('sections/error', { e: e.toString() });
    }
})
.post(async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    try {
        const sectionId = req.params.sectionId;

        if (!sectionId || !ObjectId.isValid(sectionId)) throw 'Invalid section ID provided';

        const section = await sections.getSection(sectionId);
        if (!section) throw 'Section not found';

        if (!req.session.user || (section.userId.toString() !== req.session.user._id && req.session.user.role !== "admin")) {
            return res.status(403).render('sections/error', { error: "You do not have permission to delete this section." });
        }

        await sections.deleteSection(sectionId);
        res.redirect('/journals');
    } catch (e) {
        res.status(404).render('sections/error', { e: 'Failed to delete the section.' });
    }
});

export default router;