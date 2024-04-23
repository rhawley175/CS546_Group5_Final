import {users} from './config/mongoCollections.js';
import validator from 'email-validator';
import {ObjectId} from 'mongodb';


//General helpers
function checkString(string, val) {
    if (!string) throw "The " + val + " was not provided.";
    if (typeof string !== 'string') throw "The " + val + " is not a string.";
    string = string.trim();
    if (string.length === 0) throw "The " + val + " consists only of spaces.";
    return string;
};

function checkNum(num, val) {
    if (!num) throw "The " + val + " was not provided.";
    if (typeof num !== 'number') throw "The " + val + " is not a number.";
    return num;
};

//Helpers for users
function checkUsername(username) {
    username = checkString(username, "username");
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    if (username.length < 8) throw "The username must consist of at least 8 characters.";
    if (username.length > 25) throw "The username cannot have more than 25 characters.";
    for (let i in username) {
        if (!chars.includes(username[i])) throw "The username can only consist of letters, numbers, and the following special characters: !@#$%^&*. Spaces are not allowed.";
    }
    return username;
};

const checkNewUsername = async(username) => {
    username = checkUsername(username);
    const userCollection = await users();
    const oldUser = await userCollection.findOne({username: username});
    if (oldUser || username === "visitingUser" || username === "login") throw "This username has already been used.";
    return username;
};

function checkPassword(password) {
    password = checkString(password, "password");
    if (password.length < 8) throw "The password must consist of at least 8 characters.";
    if (password.length > 25) throw "The password cannot have more than 25 characters.";
    let caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let numbers = "1234567890";
    let specialChars = "!@#$%^&*";
    let cap = false;
    let number = false;
    let specialChar = false;
    for (let i in password) {
        if (caps.includes(password[i])) cap = true;
        else if (numbers.includes(password[i])) number = true;
        else if (specialChars.includes(password[i])) specialChar = true;
        else if (!letters.includes(password[i])) throw "The password can only consist of numbers, letters, and the following special characters: !@#$%^&*. Spaces are not allowed.";
    }
    if (!cap || !number || !specialChar) throw "The password must contain at least one uppercase letter, one number, and one of the following special characters: !@#$%^&*.";
    return password;
};

function checkAge(age) {
    age = checkNum(age, "age");
    if (!Number.isInteger(age)) throw "The age is not a whole number.";
    if (age < 0 || age > 100) throw "The age is invalid.";
    if (age < 18) throw "We're sorry, but you're too young to access this application. Please contact a parent or guardian.";
    return age;
};

function checkEmail(email) {
    email = checkString(email, "email");
    if (!validator.validate(email)) throw "The email is invalid.";
    return email;
};

const checkNewEmail = async (email) => {
    email = checkEmail(email);
    const userCollection = await users();
    const oldEmail = await userCollection.findOne({email: email});
    if (oldEmail) throw "This email has already been used.";
    return email;
}

function checkName(name, nameVal) {
    name = checkString(name, nameVal);
    if (name.length < 2 || name.length > 25) throw "The " + nameVal + " is invalid.";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYXabcdefghijklmnopqrstuvwxyz\'";
    for (let i in name) {
        if (!chars.includes(name[i])) throw "The " + nameVal + " is invalid.";
    }
    name = name[0].toUpperCase() + name.slice(1);
    return name;
};

function checkLogin(login) {
    login = checkString(login, "username or email");
    if (login.includes(" ")) throw "The username or email is invalid.";
    return login;
};

function checkRole(role) {
    role = checkString(role, "role");
    if (role !== "admin" && role !== "user") throw "The role is invalid.";
    return role;
};

function checkObject(object) {
    if (!object) throw "The update object was not provided.";
    if (typeof object !== 'object' || Array.isArray(object)) throw "The update object is not an actual object.";
    if (Object.keys(object).length === 0) throw "The update object is empty.";
    return object;
};

function checkId(id, name) {
    id = checkString(id, name);
    if (!ObjectId.isValid(id)) throw "The id is not a valid object ID.";
    return id;
};

function checkContent(content) {
    content = checkString(content, "content");
    if(content.length < 10 || content.length > 1000) throw 'Journal entry must be at least 10 characters and no more than 1000.';
    return content;
};

function checkBool(boolean, name) {
    if (boolean === undefined) throw "The " + name + " was not provided.";
    if (typeof boolean !== 'boolean') throw "The " + boolean + " was not a boolean.";
    return boolean;
};

function checkDate(date) {
    date = checkString(date, "date");
    if (date.length !== 10 || date[2] !== '/' || date[5] !== '/') throw 'The date released must be in the format \'mm/dd/yyyy.\' (excluding quotations).';
    let monthString = date.substr(0, 2);
    let dayString = date.substr(3, 2);
    let yearString = date.substr(6, 4);
    if (isNaN(monthString) || isNaN(dayString) || isNaN(yearString)) throw "The date released is not a valid date.";
    let month = Number(monthString);
    let day = Number(dayString);
    let year = Number(yearString);
    let currDate = new Date();
    let currMonth = currDate.getMonth() + 1;
    let currDay = currDate.getDate();
    let currYear = currDate.getFullYear();
    if (month < 1 || day < 1 || year < 1 || month > 12) throw "The date released is not a valid date.";
    if (year > currYear) throw "The date released is not a valid date.";
    if (year === currYear && month > currMonth) throw "Error: The date released is not a valid date.";
    if (year === currYear && month === currMonth && day > currDay) throw "The date released is not a valid date.";
    if (month === 2 && day > 28) throw "The date released is not a valid date.";
    let longMonths = [1, 3, 5, 7, 8, 10, 12]
    if (longMonths.includes(month) && day > 31) throw "The date released is not a valid date.";
    if (!longMonths.includes(month) && day > 30) throw "The date released is not a valid date.";
    return date;
};

export { checkString, checkNewUsername, checkPassword, checkAge, checkNewEmail, checkName, checkEmail, checkUsername, checkLogin, 
    checkRole, checkObject, checkId, checkContent, checkBool, checkDate };