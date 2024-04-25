import {Router} from 'express';
import * as users from '../data/users.js';
import * as helpers from '../helpers.js';
import * as posts from '../data/posts.js';
import * as journals from '../data/journals.js';
import {ObjectId} from 'mongodb';
const router = Router();

router
.route('/')
.get(async (req, res) => {
    try {
        if (!req.session.user) return res.redirect("/users/login");
        if (req.session.user.role !== "admin") return res.status(400).render("users/error", {error: "Access Denied"});
        const userList = await users.getAllUsers();
        res.status(200).render("users/allUsers", {users: userList});
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
});

router
.route("/register")
.get(async (req, res) => {
    try {
        if (!req.session.user) res.status(200).render("users/register");
        else if (req.session.user) res.redirect("/users/get/" + req.session.user.username);
        else throw "Cannot render the register page.";
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
}).post(async (req, res) => {
    let newUserData = req.body;
    if (!newUserData || Object.keys(newUserData).length === 0) {
        return res.status(400).render("users/error", {error: "There are no fields in the request body."});
    }
    try {
        newUserData.usernameInput = await helpers.checkUsername(newUserData.usernameInput);
        newUserData.passwordInput = helpers.checkPassword(newUserData.passwordInput);
        newUserData.confirmPasswordInput = helpers.checkPassword(newUserData.confirmPasswordInput);  //Added confirm password.
        newUserData.ageInput = Number(newUserData.ageInput);
        newUserData.ageInput = helpers.checkAge(newUserData.ageInput);
        newUserData.emailInput = await helpers.checkEmail(newUserData.emailInput);
        newUserData.firstNameInput = helpers.checkName(newUserData.firstNameInput, "first name");
        newUserData.lastNameInput = helpers.checkName(newUserData.lastNameInput, "last name");
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        const newUser = await users.createUser(
            newUserData.usernameInput,
            newUserData.passwordInput,
            newUserData.confirmPasswordInput,  //Pass confirm password.
            newUserData.ageInput,
            newUserData.emailInput,
            newUserData.firstNameInput,
            newUserData.lastNameInput
        );
        if (newUser) {
            return res.status(200).redirect("/users/login");
        }
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
});

router
.route("/login")
.get(async (req, res) => {
    try {
        if (req.session.user) return res.redirect("/users/get/" + req.session.user.username);
        return res.status(200).render("users/login");
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
}).post(async (req, res) => {
    let newUserData = req.body;
    if (!newUserData || Object.keys(newUserData).length === 0) {
        return res.status(400).render("users/error", {error: "There are no fields in the request body."});
    }
    try {
        newUserData.loginInput = helpers.checkString(newUserData.loginInput, "login");
        newUserData.passwordInput = helpers.checkString(newUserData.passwordInput, "password");
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        const loggedUser = await users.loginUser(
            newUserData.loginInput,
            newUserData.passwordInput
        );
        if (loggedUser) {
            const user = await users.getUserByUsername(loggedUser.username);
            if (user) {
              req.session.user = {
                _id: user._id,
                username: loggedUser.username,
                role: user.role
              };
              return res.redirect("/users/get/" + loggedUser.username);
            } else {
              throw "User not found";
            }
          }
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
});

router
.route("/get/:username")
.get(async (req, res) => {
    let username = req.params.username;
    let userAccessing;
    let role;
    if (req.session.user) userAccessing = req.session.user.username;
    else userAccessing = "visitingUser";
    if (req.session.user) role = req.session.user.role;
    else role = "user";
    try {
        username = helpers.checkString(username, "username");
        if (req.session.user) userAccessing = helpers.checkString(userAccessing, "accessing user");
        if (req.session.user) role = helpers.checkRole(role);
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        let owned;
        let shared;
        let publicPosts;
        const getUser = await users.getUser(username, userAccessing, role);
        let allPosts = await posts.getAllUserPosts(username, userAccessing, role);
        if (!getUser) return res.status(404).render("users/error", {error: "User not found."});
        if (getUser.role === "admin" && (!req.session.user || role !== "admin")) return res.status(403).render("users/error", {error: "Access denied."});
        if (allPosts.sharedPosts && allPosts.sharedPosts.length > 0) shared = true;
        else shared = false;
        if (allPosts.publicPosts && allPosts.publicPosts.length > 0) publicPosts = true;
        else publicPosts = false;
        if (!req.session.user || (req.session.user.username !== username && req.session.user.role !== "admin")) {
            owned = false;
            return res.status(200).render("users/user", {
                owned: owned,
                publicPosts: publicPosts,
                shared: shared,
                username: getUser.username,
                posts: allPosts
            });
        };
        if (username === userAccessing || role === "admin") {
            owned = true;
            let allJournals = await journals.getJournalsByAuthenticatedUsername(username, userAccessing, role);
            return res.status(200).render("users/user", {
                owned: owned,
                publicPosts: publicPosts,
                shared: shared,
                username: getUser.username,
                posts: allPosts,
                journals: allJournals
            });
        };
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
})
.post(async (req, res) => {
    let username = req.params.username;
    let keyword = req.body.keywordInput;
    let date1 = req.body.date1Input;
    console.log(date1);
    let date2 = req.body.date2Input;
    let wordSearch;
    let userAccessing;
    let role;
    try {
        if (keyword !== "")  {
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
        if (req.session.user) {
            userAccessing = helpers.checkString(req.session.user.username, "accessing user");
            role = helpers.checkRole(req.session.user.role);
            const accessingUser = await users.getUser(userAccessing, userAccessing, role);
            if (!accessingUser) throw "We could not find the accessing user.";
        }
        else {
            userAccessing = "visitingUser";
            role = "user";
        }
        const user = await users.getUser(username, userAccessing, role);
        if (!user) throw "We could not find that user.";
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        var allPosts;
        if (wordSearch) {
            allPosts = await posts.getUserPostsByKeyword(keyword, username, userAccessing, role);
        }
        if (!wordSearch) {
            allPosts = await posts.getUserPostsByDate(date1, date2, username, userAccessing, role);
        }
        let valid = true;
        if (typeof allPosts === 'string') valid = false;
        let publicPosts = false;
        let sharedPosts = false;
        let privatePosts = false;
        if (allPosts.publicPosts && allPosts.publicPosts.length > 0) publicPosts = true;
        if (allPosts.sharedPosts && allPosts.sharedPosts.length > 0) sharedPosts = true;
        if (allPosts.privatePosts && allPosts.privatePosts.length > 0) privatePosts = true;
        return res.status(200).render('users/search', {valid: valid, posts: allPosts, keyword: keyword, username: username, publicPosts: publicPosts, sharedPosts: sharedPosts, privatePosts: privatePosts});
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
});

router
.route("/update/:username")
.get(async (req, res) => {
    let username = req.params.username;
    if (!req.session.user) return res.redirect("/users/login");
    try {
        username = helpers.checkString(username, "username");
        const user = await users.getUser(username, req.session.user.username, req.session.user.role);
        if (!user) return res.status(404).render("users/error", {error: "User not found."});
        if (req.session.user.username !== username && req.session.user.role !== "admin") return res.status(403).json({error: "Access denied."});
        return res.status(200).render("users/update", {
            username: user.username,
            age: user.age,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
})
.post(async (req, res) => {
    const requestBody = req.body;
    if (!requestBody || Object.keys(requestBody).length === 0) {
        return res.status(400).render({error: "There are no fields in the request body."});
    }
    if (!req.session.user) return res.redirect("/users/login");
    let username = req.params.username;
    try {
        username = helpers.checkString(username, "username");
        const getUser = await users.getUser(username, req.session.user.username, req.session.user.role);
        if (!getUser) return res.status(404).json({error: "User not found."});
        if (req.session.user.username !== username && req.session.user.role !== "admin") return res.status(403).json({error: "Access Denied."});
        if (requestBody.passwordInput !== "") requestBody.passwordInput = helpers.checkPassword(requestBody.passwordInput);
        if (requestBody.ageInput !== "") requestBody.ageInput = helpers.checkAge(Number(requestBody.ageInput));
        if (requestBody.emailInput !== "") requestBody.emailInput = await helpers.checkNewEmail(requestBody.emailInput);
        if (requestBody.firstNameInput !== "") requestBody.firstNameInput = helpers.checkName(requestBody.firstNameInput, "first name");
        if (requestBody.lastNameInput !== "") requestBody.lastNameInput = helpers.checkName(requestBody.lastNameInput, "last name");
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        const newUser = {
            password: requestBody.passwordInput,
            age: requestBody.ageInput,
            email: requestBody.emailInput,
            firstName: requestBody.firstNameInput,
            lastName: requestBody.lastNameInput
        }
        const updatedUser = await users.updateUser(
            username,
            req.session.user.username,
            req.session.user.role,
            newUser
        );
        if (updatedUser === "Cannot update the user, as nothing is being changed.") return res.status(400).render("users/error", {error: updatedUser});
        req.session.user.username = updatedUser.username;
        return res.redirect("/users/get/" + req.session.user.username);
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
});

router
.route("/delete/:username")
.get(async (req, res) => {
    let username = req.params.username;
    if (!req.session.user) return res.redirect("/users/login");
    try {
        username = helpers.checkUsername(username);
        const user = await users.getUser(username, req.session.user.username, req.session.user.role);
        if (!user) return res.status(404).render("users/error", {error: "We're sorry, we could not find the user: " + username + "."});
        if (req.session.user.username !== username && req.session.user.role !== "admin") return res.status(403).render("users/error", {error: "Access Denied."});
        return res.status(200).render("users/delete", {username: username});
    } catch(e) {
        return res.status(500).render("users/error", {error: e});
    }
})
.post(async (req, res) => {
    let username = req.params.username;
    if (!req.session.user) return res.redirect("/users/login");
    try {
        username = helpers.checkUsername(username);
        const user = await users.getUser(username, req.session.user.username, req.session.user.role);
        if (!user) return res.status(404).render("users/error", {error: "We're sorry, we could not find the user: " + username + "."});
        if (req.session.user.username !== username && req.session.user.role !== "admin") return res.status(403).render("users/error", {error: "Access Denied."});
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
    try {
        const deletedUser = await users.deleteUser(username, req.session.user.username, req.session.user.role);
        if (!deletedUser) return res.status(500).render("users/error", {error: "Could not delete the user " + username + "."});
        req.session.user = null;
        if (deletedUser.deleted) return res.status(200).redirect("/users/logout");
    } catch(e) {
        return res.status(400).render("users/error", {error: e});
    }
});

router
.route("/logout")
.get(async (req, res) =>{
    try {
        if (req.session.user) {
            req.session.destroy();
            return res.redirect("/users/login");
        }
        else return res.redirect("/users/login")
    } catch(e) {
        return res.status(500).render("users/error", {error: "Cannot logout."});
    }
});

export default router;
