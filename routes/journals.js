import { Router } from 'express';
const router = Router();

import * as journals from '../data/journals.js';
import * as users from '../data/users.js';
import * as helpers from '../helpers.js';
import * as posts from '../data/posts.js';

//Unneccessary: The user is going to have all the journals displayed on their home page.

// router.get('/', async (req, res) => {
//   try {

//     const userId = req.session.user._id;
//     const journals = await getJournalsByUser(userId);
//     res.render('journals/journalList', { journals });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router
.route("/create/:username")
.get(async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let username = req.params.username;
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing user");
    role = helpers.checkRole(role);
    const userAccessing = await users.getUser(accessingUser, accessingUser, role);
    if (!userAccessing) throw "We could not find the accessing user.";
    username = helpers.checkString(username);
    const user = await users.getUser(username, accessingUser, role);
    if (!user) throw "We could not find the user with username: " + username + ".";
    if (accessingUser !== username && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    return res.status(200).render('journals/createJournal');
  } catch (error) {
    return res.status(500).render('journals/error', { error: "Internal server error." });
  }
}).post(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let username = req.params.username;
    let accessingUser = req.session.user.username;
    let role = req.session.user.role;
    let title = req.body.title;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing user");
    role = helpers.checkRole(role);
    const userAccessing = await users.getUser(accessingUser, accessingUser, role);
    if (!userAccessing) throw "We could not find the accessing user.";
    username = helpers.checkString(username);
    const user = await users.getUser(username, accessingUser, role);
    if (!user) throw "We could not find the user with username: " + username + ".";
    if (accessingUser !== username && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    title = helpers.checkString(title, "title");
  } catch(e) {
    res.status(400).render('journals/error', {error: e});
  }
  try {
    const newJournal = await journals.createJournal(username, title, accessingUser, role);
    return res.redirect("/journals/" + newJournal._id);
  } catch (error) {
    res.status(500).render('journals/error', { error: "Internal server error." });
  }
});

router
.route('/:id')
.get(async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing user");
    role = helpers.checkRole(role);
    const userAccessing = await users.getUser(accessingUser, accessingUser, role);
    if (!userAccessing) throw "We could not find the accessing user.";
    var journalId = req.params.id;
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render("journals/error", {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    return res.status(200).render("journals/journalView", {journal: journal});
  } catch (error) {
    res.status(500).render("journals/error", { error: error });
  }
});

router
.route("/:id/edit")
.get( async (req, res) => {
 
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  let journalId = req.params.id;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing user");
    role = helpers.checkRole(role);
    const userAccessing = await users.getUser(accessingUser, accessingUser, role);
    if (!userAccessing) throw "We could not find the accessing user.";
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render('journals/error', {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render('journals/error', {error: "Access denied."});
    res.status(200).render('journals/editJournal', { journal: journal });
  } catch (error) {
    res.status(500).render('journals/error',{ error: error });
  }
});

router.put('/:id', async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  let journalId = req.params.id;
  let title = req.body.title;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing user");
    role = helpers.checkRole(role);
    const userAccessing = await users.getUser(accessingUser, accessingUser, role);
    if (!userAccessing) throw "We could not find the accessing user.";
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render("journals/error", {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    title = helpers.checkString(title, "title");
    if (title === journal.title) return res.status(400).render("journals/error", {error: "Nothing is being updated."});
  } catch(e) {
    return res.status(400).render("journals/error", {error: e});
  }
  try {
    const updatedJournal = await journals.updateJournal(journalId, title, accessingUser, role);
    if (!updatedJournal) throw "We could not update the journal.";
    res.redirect(`/journals/` + journalId);
  } catch (error) {
    res.status(500).render("journals/error", { error: error });
  }
});

router.get('/:id/delete', async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  let journalId = req.params.id;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing User");
    role = helpers.checkRole(role);
    const user = await users.getUser(accessingUser, accessingUser, role);
    if (!user) return res.status(403).render("journals/error", {error: "We could not find the accessing user."});
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render("journals/error", {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    res.status(200).render('journals/deleteJournal', { journal: journal });
  } catch (error) {
    res.status(400).render("journals/error", { error: error });
  }
});

router.delete('/:id', async (req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  let journalId = req.params.id;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing User");
    role = helpers.checkRole(role);
    const user = await users.getUser(accessingUser, accessingUser, role);
    if (!user) return res.status(403).render("journals/error", {error: "We could not find the accessing user."});
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render("journals/error", {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
  } catch (error) {
    res.status(400).render("journals/error", { error: error });
  }
  try {
    const deletedJournal = await journals.deleteJournal(journalId, accessingUser, role);
    return res.redirect('/users/get/' + accessingUser);
  } catch(e) {
    res.status(500).json({error: e});
  }
});

router
.route("/search/:id")
.get( async(req, res) => {
  if (!req.session.user) return res.redirect("/users/login");
  let accessingUser = req.session.user.username;
  let role = req.session.user.role;
  let journalId = req.params.id;
  let keyword = req.body.keywordInput;
  let date1 = req.body.date1Input;
  let date2 = req.body.date2Input;
  let wordSearch;
  try {
    accessingUser = helpers.checkString(accessingUser, "accessing User");
    role = helpers.checkRole(role);
    const user = await users.getUser(accessingUser, accessingUser, role);
    if (!user) return res.status(403).render("journals/error", {error: "We could not find the accessing user."});
    journalId = helpers.checkId(journalId, "journal id");
    const journal = await journals.getJournalById(journalId, accessingUser, role);
    if (!journal) return res.status(404).render("journals/error", {error: "Journal not found."});
    if (journal.author !== accessingUser && role !== "admin") return res.status(403).render("journals/error", {error: "Access denied."});
    if (keyword !== "" && keyword !== undefined)  {
      keyword = helpers.checkString(keyword, "search term");
      wordSearch = true;
    }
    else if (date1 !== "" && date2 !== "") {
        date1 = helpers.checkDate(date1);
        date2 = helpers.checkDate(date2);
        let newDate1 = Date.parse(date1);
        let newDate2 = Date.parse(date2);
        if (newDate1 > newDate2) throw "The first date is later than the second.";
        wordSearch = false;
    }
    else throw "No search data was entered.";
    } catch (error) {
      return res.status(400).render("views", { error: error });
    }
  try {
    let allPosts;
    if (wordSearch) {
      allPosts = await posts.getJournalPostsbyKeyword(keyword, journalId, userAccessing, role);
    }
    if (!wordSearch) {
      allPosts = await posts.getJournalPostsbyDate(date1, date2, journalId, userAccessing, role);
    }
  let valid = true;
  if (typeof allPosts === 'string') valid = false;
  return res.status(200).render("journals/search", {valid: valid, posts: allPosts});
  } catch(e) {
    return res.status(500).render("journals/error", {error: e});
  }
});

export default router;
