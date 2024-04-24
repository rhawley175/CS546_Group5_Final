import {Router} from 'express';
import * as sections from '../data/sections.js';
import * as users from '../data/users.js';
import * as journals from '../data/journals.js';
import * as helpers from '../helpers.js';
import * as posts from '../data/posts.js';
const router = Router();


router
.route('/newSection/:journalId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let journalId = req.params.journalId;
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        journalId = helpers.checkId(journalId, "journal id");
        const journal = await journals.getJournalById(journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
        return res.status(200).render('sections/newSection', { title: 'Create New Section' });
      } catch (error) {
        return res.status(500).json({ error: error });
      }
})
.post(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let journalId = req.params.journalId;
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let title = req.body.title;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        journalId = helpers.checkId(journalId, "journal id");
        const journal = await journals.getJournalById(journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "Journal not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
        title = helpers.checkString(title, "title");
    } catch(e) {
        return res.status(400).render("sections/error", {error: e});
    }
    try {
        const section = await sections.createSection(journalId, title, userAccessing, role);
        if (!section) throw "We could not create the section.";
        return res.json(section);
    } catch (e) {
        res.status(500).render('sections/error', { error: e });
    }
});

router
.route('/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
        return res.status(200).render("sections/sectionDetails", { title: 'Section Details', section });
    } catch(e) {
        res.status(500).render("sections/error", {error: e});
    }
});


router
.route('/delete/:sectionId')
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
        return res.status(200).render("sections/deleteSection", {title: "Delete Section"});
    } catch(e) {
        return res.status(500).render("sections/error", {error: e});
    }
})
.post(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
    } catch(e) {
        return res.status(400).render("sections/error", {error: e});
    }
    try {
        const deleteSection = await sections.deleteSection(sectionId, userAccessing, role);
        res.render('sections/deleteSection', { title: 'Delete Section', message: 'Section deleted successfully.' });
    } catch (error) {
        return res.status(500).render('sections/error', { error: error });
    }
});

router
.route("/update/:sectionId")
.get(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing && role !== "admin") return res.status(403).render("sections/error", {error: "Access denied."});
        let title = section.title;
        return res.json("update user", {title: title});
    } catch(e) {
        return res.status(400).render("sections/error", {error: e});
    }
}).put(async (req, res) => {
    if (!req.session.user) return res.redirect("/users/login");
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    let title = req.body.title;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing) return res.status(403).render("sections/error", {error: "Access denied."});
        title = helpers.checkString(title, "title");
        if (journal.title === title) throw "Nothing is being changed.";
    } catch(e) {
        return res.status(400).render("sections/error", {error: e});
    }
    try {
        const updateSection = await sections.updateSection(sectionId, title, userAccessing, role);
        return res.redirect("/sections/" + sectionId);
    } catch(e) {
        return res.status(500).render("sections/error", {error: e});
    }
});

router
.route("/search/:sectionId")
.get(async (req, res) => {
    let userAccessing = req.session.user.username;
    let role = req.session.user.role;
    let sectionId = req.params.sectionId;
    let keyword = req.body.keywordInput;
    let date1 = req.body.date1Input;
    let date2 = req.body.date2Input;
    let wordSearch;
    try {
        userAccessing = helpers.checkString(userAccessing, "accessing user");
        role = helpers.checkRole(role);
        const accessingUser = await users.getUser(userAccessing, userAccessing, role);
        if (!accessingUser) throw "We could not find the accessing user.";
        sectionId = helpers.checkId(sectionId, "journal id");
        const section = await sections.getSection(sectionId, userAccessing, role);
        if (!section) return res.status(404).render("sections/error", {error: "Section not found."});
        const journal = await journals.getJournalById(section.journalId, userAccessing, role);
        if (!journal) return res.status(404).render("sections/error", {error: "The journal that this section belongs to was not found."});
        if (journal.author !== userAccessing) return res.status(403).render("sections/error", {error: "Access denied."});
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
    } catch(e) {
       return res.status(400).render("sections/error", { error: e });
    }
    try {
        let allPosts;
        if (wordSearch) {
          allPosts = await posts.getSectionPostsByKeyword(keyword, sectionId, userAccessing, role);
        }
        if (!wordSearch) {
          allPosts = await posts.getSectionPostsByDate(date1, date2, sectionId, userAccessing, role);
        }
        let valid = true;
        if (typeof allPosts === 'string') valid = false;
        return res.status(200).json({valid: valid, posts: allPosts});
        } catch(e) {
            return res.status(500).render("sections/error", {error: e});
    }
});
export default router;