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
      return res.redirect('/users/login'); 
    }

    const userId = req.session.user._id; 
    const username = req.session.user.username; 
    console.log('userId:', userId); 
    const { title } = req.body;
    const newJournal = await createJournal(userId, username, title);
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

router.get('/:id/edit', async (req, res) => {
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);
    res.render('journals/editJournal', { journal });
  } catch (error) {
    res.status(404).json({ error: 'Journal not found' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    const updatedJournal = req.body;
    await updateJournal(journalId, updatedJournal);
    res.redirect(`/journals/${journalId}`);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id/delete', async (req, res) => {
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);
    res.render('journals/deleteJournal', { journal });
  } catch (error) {
    res.status(404).json({ error: 'Journal not found' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    await deleteJournal(journalId);
    res.redirect('/journals');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
