import { Router } from 'express';
const router = Router();
import * as sectionData from '../data/sections.js';
import * as users from '../data/users.js';

import {
  createJournal,
  getJournalById,
  getJournalsByUser,
  updateJournal,
  deleteJournal,
  getJournalsByUsername,

} from '../data/journals.js';

router.get('/', async (req, res) => {
  
  try {
    const userId = req.session.user._id;
    const journals = await getJournalsByUser(userId);
    res.render('journals/journalList', { journals });
  } catch (error) {
    res.status(500).render('users/error', { error: 'Internal Server Error' });
  }
});

router.get('/create', async (req, res) => {
  if(!req.session.user){                        //Added redirect
    res.status(302).redirect("/users/login")
  }
  
  try {
    res.render('journals/createJournal');
  } catch (error) {
    res.status(500).render('users/error',{ error: 'Internal Server Error' });
  }
});


router.post('/create', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/users/login'); 
    }

    const userId = req.session.user._id; 
    const username = req.session.user.username; 
    const { title } = req.body;
    const newJournal = await createJournal(userId, username, title);
    res.redirect(`/journals/${newJournal._id}`);
  } catch (error) {
    console.error('Error in POST /journals/create:', error);
    res.status(500).render('users/error', { error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {

if (!req.session.user) return res.redirect("/users/login");
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);

    // Check if the logged-in user is the owner of the journal
    if (journal.user_id[0].toString() !== req.session.user._id.toString()) {
      return res.status(403).render('users/error', { error: 'Forbidden' });
    }

    const sections = await sectionData.getSectionsByJournalId(journalId);
    journal.sections = sections;
    res.render('journals/journalView', { title: journal.title, journal });
  } catch (error) {
    res.status(404).render('users/error', { error: 'Journal not found.' });
  }

});


router.get('/:id/edit', async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);
    
    // Check if the logged-in user is the owner of the journal
    if (journal.user_id[0].toString() !== req.session.user._id.toString()) {
      return res.status(403).json('users/error', { error: 'Forbidden' });
    }
    
    res.render('journals/editJournal', { journal });
  } catch (error) {
    res.status(404).render('users/error', { error: 'Journal not found' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    const updatedJournal = req.body;
    
    // Check if the logged-in user is the owner of the journal
    const journal = await getJournalById(journalId);
    if (journal.user_id[0].toString() !== req.session.user._id.toString()) {
      return res.status(403).render('users/error', { error: 'Forbidden' });
    }
    
    await updateJournal(journalId, updatedJournal);
    res.redirect(`/journals/${journalId}`);
  } catch (error) {
    res.status(500).render('users/error', { error: 'Internal Server Error' });
  }
});

router.get('/:id/delete', async (req, res) => {
  try {
    const journalId = req.params.id;
    const journal = await getJournalById(journalId);
    
    // Check if the logged-in user is the owner of the journal
    if (journal.user_id[0].toString() !== req.session.user._id.toString()) {
      return res.status(403).render('users/error', { error: 'Forbidden' });
    }
    
    res.render('journals/deleteJournal', { journal });
  } catch (error) {
    res.status(404).render('users/error', { error: 'Journal not found' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const journalId = req.params.id;
    // Check if the logged-in user is the owner of the journal
    const journal = await getJournalById(journalId);
    if (journal.user_id[0].toString() !== req.session.user._id.toString()) {
      return res.status(403).render('posts/error', { error: 'Forbidden' });
    }
    await deleteJournal(journalId);
    res.redirect('/journals');
  } catch (error) {
    res.status(500).render('posts/error', { error: 'Internal Server Error' });
  }
});





router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const journals = await getJournalsByUsername(username);
    res.render('journals/journalList', { journals });
  } catch (error) {
    res.status(500).render('users/error', { error: 'Internal Server Error' });
  }
});


export default router;
