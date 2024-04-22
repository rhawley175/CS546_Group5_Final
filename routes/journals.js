import { Router } from 'express';
const router = Router();

import {
  createJournal,
  getJournalById,
  getJournalsByUser,
  updateJournal,
  deleteJournal,
} from '../data/journals.js';

router.get('/', async (req, res) => {
  try {
    const userId = req.session.user._id;
    const journals = await getJournalsByUser(userId);
    res.render('journals/journalList', { journals });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/create', async (req, res) => {
  try {
    res.render('journals/createJournal');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/users/login'); // Redirect to the login page if user is not authenticated
    }
    const userId = req.session.user._id; // Extract the userId (ObjectId) from the authenticated user session
    const username = req.session.user.username; // Extract the username from the authenticated user session
    console.log('userId:', userId); // Log the userId
    const { title, sectionTitle, sectionContent } = req.body;
    const newJournal = await createJournal(userId, username, title, sectionTitle, sectionContent);
    res.redirect(`/journals/${newJournal._id}`);
  } catch (error) {
    console.error('Error in POST /journals/create:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);
    res.render('journals/journalView', { journal });
  } catch (error) {
    res.status(404).json({ error: 'Journal not found' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    const updatedJournal = req.body;
    const journal = await updateJournal(journalId, updatedJournal);
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    await deleteJournal(journalId);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
