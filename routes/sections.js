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
        const { journalId, title } = req.body;
        
        if (!journalId || !title) throw 'Journal ID and title must be provided';
        if (!ObjectId.isValid(journalId)) throw 'Invalid journal ID provided';

        const section = await sections.createSection(journalId.trim(), title.trim());
        res.render('sections/newSection', { title: 'Create New Section', success: true, sectionId: section._id });
    } catch (e) {
        res.status(400).render('sections/error', { error: e });
    }
});
/*     try {
        const { title, journalId } = req.body;
        const section = await sections.createSection(title, journalId);
        res.redirect(`/journals/${journalId}`); // Redirect back to the journal view
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ error: 'Failed to create section' });
    }
    }); */




router
.route('/:sectionId')
.get(async (req, res) => {
    try {
        const sectionId = req.params.sectionId;

        if (!sectionId || !ObjectId.isValid(sectionId)) throw 'Invalid section ID provided';

        const section = await sections.getSection(sectionId);
        res.render('sections/sectionDetails', { title: 'Section Details', section });
    } catch (error) {
        res.status(404).render('error', { error: 'Section not found' });
    }
});


router
.route('/delete/:sectionId')
.get(async (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).render('error', { error: "You do not have permission to delete sections." });
    }

    res.render('sections/deleteSection', { title: 'Delete Section' });
})
.post(async (req, res) => {
    try {
        const sectionId = req.body.sectionId;

        if (!sectionId || !ObjectId.isValid(sectionId)) throw 'Invalid section ID provided';

        await sections.deleteSection(sectionId);
        res.render('sections/deleteSection', { title: 'Delete Section', message: 'Section deleted successfully.' });
    } catch (error) {
        res.status(404).render('error', { error: 'Failed to delete the section.' });
    }
});

export default router;