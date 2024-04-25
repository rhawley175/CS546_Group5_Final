import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helpers from '../helpers.js';
import bcrypt from 'bcrypt';

export const createUser = async(
    username,
    password,
    confirmPassword,   //Added confirm password to check.
    age,
    email,
    firstName,
    lastName
) => {
    username = await helpers.checkNewUsername(username);
    password = helpers.checkPassword(password);
    confirmPassword = helpers.checkPassword(confirmPassword);  //Added confirm password error check.
    if(password!==confirmPassword){                            //Check if password and confirm password is the the same or not.
        throw 'Password does not match.';
    }
    age = helpers.checkAge(age);
    email = await helpers.checkNewEmail(email);
    firstName = helpers.checkName(firstName, "first name");
    lastName = helpers.checkName(lastName, "last name");
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    let role;
    const userCollection = await users();
    const admin = await userCollection.findOne({role: "admin"});
    if (username === "adminUser" && password === "T1mApPDgi@2A" && !admin) role = "admin";
    else role = "user";
    let publicPosts = [];
    let sharedPosts = [];
    let journals = [];
    let comments = [];
    const newUser = {
        "username": username,
        "password": hash,
        "age": age,
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "role": role,
        "publicPosts": publicPosts,
        "sharedPosts": sharedPosts,
        "journals": journals,
        "comments": comments, 
    }
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation) throw "Insert failed!";
    return true;
};

export const getUser = async(username, userAccessing, role) => {
    username = helpers.checkString(username, "username");
    userAccessing = helpers.checkString(userAccessing, "username");
    role = helpers.checkString(role, "role");
    const userCollection = await users();
    const foundUser = await userCollection.findOne({username: username});
    if (userAccessing !== "visitingUser") {
        const foundAccessingUser = await userCollection.findOne({username: userAccessing});
        if (!foundAccessingUser) throw "Accessing user not found.";
    }
    if (!foundUser) throw "We're sorry, we could not find the user: " + username + ".";
    let newUser;
    if (role === "admin" || username === userAccessing) {
        newUser = {
            "username": foundUser.username,
            "age": foundUser.age,
            "email": foundUser.email,
            "firstName": foundUser.firstName,
            "lastName": foundUser.lastName,
            "role": foundUser.role,
            "publicPosts": foundUser.publicPosts,
            "sharedPosts": foundUser.sharedPosts,
            "journals": foundUser.journals,
            "comments": foundUser.comments
        }
    }
    else {
        newUser = {
            "username": foundUser.username,
            "role": foundUser.role,
            "publicPosts": foundUser.publicPosts,
            "comments": foundUser.comments
        }
    }
    return newUser;
};

export const loginUser = async (login, password) => {
    login = helpers.checkLogin(login, "login");
    password = helpers.checkString(password, "password");
    const userCollection = await users();
    var userObject = await userCollection.findOne({email: login});
    if (!userObject) userObject = await userCollection.findOne({username: login});
    if (!userObject) throw "The email/username or password is incorrect.";
    const valid = await bcrypt.compare(password, userObject.password);
    if (!valid) throw "Either the email/username or password is incorrect.";
    return await getUser(userObject.username, userObject.username, userObject.role);
};


export const getAllUsers = async() => {
    const userCollection = await users();
    const allUsers = await userCollection.find({}).toArray();
    let usersArray = [];
    for (let i in allUsers) {
        if (allUsers[i].role !=="admin") usersArray.push({username: allUsers[i].username});
    }
    return usersArray;
};

export const deleteUser = async(username, userAccessing, role) => {
    username = helpers.checkString(username, "username");
    userAccessing = helpers.checkString(userAccessing, "user accessing");
    role = helpers.checkRole(role);
    const userCollection = await users();
    const userToDelete = await userCollection.findOne({username: username});
    const accessingUser = await userCollection.findOne({username: userAccessing});
    if (!accessingUser) throw "Sorry, we could not find the accessing user.";
    if (userAccessing !== username && role !== "admin") throw "You do not have permission to do that.";
    if (!userToDelete) throw "Sorry, but we could not delete the user with username " + username + ".";
    if (userToDelete.role === "admin" && role !== "admin") throw "You do not have permission to do that.";
    const deletedUser = await userCollection.findOneAndDelete({username: username});
    if (!deletedUser) throw "Sorry, but we could not delete the user with username " + username + ".";
    return {username: username, deleted: true};
};

export const updateUser = async(username, userAccessing, role, updateObject) => {
    username = helpers.checkString(username, "username");
    userAccessing = helpers.checkString(userAccessing, "user accessing");
    role = helpers.checkRole(role);
    if (username !== userAccessing && role !== "admin") throw "You do not have permission to do that.";
    const userCollection = await users();
    const oldUser = await userCollection.findOne({username: username});
    if (!oldUser) throw "Sorry, but we could not find the user with username: " + username + ".";
    updateObject = helpers.checkObject(updateObject);
    let updated = false;
    let newUser = new Object();
    if (updateObject.username) {
        updateObject.username = await helpers.checkUsername(updateObject.username);
        if (updateObject.username !== oldUser.username) updated = true;
        newUser.username = updateObject.username;
    }
    else newUser.username = oldUser.username;
    if (updateObject.password) {
        updateObject.password = helpers.checkPassword(updateObject.password);
        const check = await bcrypt.compare(updateObject.password, oldUser.password);
        if (!check) updated = true;
        newUser.password = await bcrypt.hash(updateObject.password, 12);
    }
    else newUser.password = oldUser.password;
    if (updateObject.age) {
        updateObject.age = helpers.checkAge(updateObject.age);
        if (updateObject.age !== oldUser.age) updated = true;
        newUser.age = updateObject.age;
    }
    else newUser.age = oldUser.age;
    if (updateObject.email) {
        updateObject.email = await helpers.checkEmail(updateObject.email);
        if (updateObject.email !== oldUser.email) updated = true;
        newUser.email = updateObject.email;
    }
    else newUser.email = oldUser.email;
    if (updateObject.firstName) {
        updateObject.firstName = helpers.checkName(firstName, "lirst name");
        if (updateObject.firstName !== oldUser.firstName) updated = true;
        newUser.firstName = updateObject.firstName;
    }
    else newUser.firstName = oldUser.firstName;
    if (updateObject.lastName) {
        updateObject.lastName = helpers.checkName(lastName, "last name");
        if (updateObject.lastName !== oldUser.lastName) updated = true;
        newUser.lastName = updateObject.lastName;
    }
    else newUser.lastName = oldUser.lastName;
    if (!updated) return "Cannot update the user, as nothing is being changed.";
    newUser.role = oldUser.role;
    newUser.publicPosts = oldUser.publicPosts;
    newUser.sharedPosts = oldUser.sharedPosts;
    newUser.journals = oldUser.journals;
    newUser.comments = oldUser.comments;
    const updateInfo = await userCollection.findOneAndReplace({username: username}, newUser, {returnDocument: 'after'});
    if (!updateInfo) throw "Sorry, but we could not update the user with username: " + username + ".";
    return newUser;
};



export const addJournalToUser = async (userId, journalId) => {
    userId = helpers.checkString(userId, "User ID");
    journalId = helpers.checkString(journalId, "Journal ID");
  
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { journals: new ObjectId(journalId) } }
    );
  
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw 'Update failed';
  
    return await getUser(userId);
  };
  
  export const removeJournalFromUser = async (userId, journalId) => {
    userId = helpers.checkString(userId, "User ID");
    journalId = helpers.checkString(journalId, "Journal ID");
  
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { journals: new ObjectId(journalId) } }
    );
  
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw 'Update failed';
  
    return await getUser(userId);
  };


  export const getUserByUsername = async (username) => {
    username = helpers.checkString(username, "username");
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    return user;
  };

