(function($) {

    let loginForm = $("#login-form"),
    errorList = $("#errors"),
    updateForm = $("#update-form"),
    registrationForm = $("#registration-form");

    $(loginForm).submit(function(event) {
        let errors = [];
        let login = $("#loginInput").val(),
        password = $("#passwordInput").val();
        try {
            login = checkString(login, "username or email");
        } catch(e) {
            errors.push(e);
        }
        try {
            password = checkString(password, "password");
        } catch(e) {
            errors.push(e);
        }
        if (errors.length > 0) {
            event.preventDefault();
            errorList.empty();
            for (let i in errors) {
                errorList.append("<li>" + errors[i] + "</li>");
            }
            errorList.show();
        }
    });

    $(updateForm).submit(function(event) {
        let errors = [],
        username = $("#usernameInput").val(),
        password = $("#passwordInput").val(),
        confirmPassword = $("#confirmPasswordInput").val(),
        age = $("#ageInput").val(),
        email = $("#emailInput").val(),
        firstName = $("#firstNameInput").val(),
        lastName = $("#lastNameInput").val(),
        valid = false;
        if (username) {
            valid = true;
            try {
                username = checkUsername(username);
            } catch(e) {
                errors.push(e);
            }
        }
        if (password) {
            valid = true;
            try {
                password = checkPassword(password);
            } catch(e) {
                errors.push(e);
            }
            if (password !== confirmPassword) errors.push("Passwords must match.");
        }
        if (age) {
            valid = true;
            try {
                age = Number(age);
                age = checkAge(age);
            } catch(e) {
                errors.push(e);
            }
        }
        if (email) {
            valid = true;
            try {
                email = checkEmail(email);
            } catch(e) {
                errors.push(e);
            }
        }
        if (firstName) {
            valid = true;
            try {
                firstName = checkName(firstName, "first name");
            } catch(e) {
                errors.push(e);
            }
        }
        if (lastName) {
            valid = true;
            try {
                lastName = checkName(lastName, "last name");
            } catch(e) {
                errors.push(e);
            }
        }
        if (!valid) {
            event.preventDefault();
            errorList.empty();
            errorList.append("<li>No information entered.</li>");
            errorList.show();
        }
        if (errors.length > 0) {
            event.preventDefault();
            errorList.empty();
            for (let i in errors) {
                errorList.append("<li>" + errors[i] + "</li>");
            }
            errorList.show();
        }
    });

    $(registrationForm).submit(function(event) {
        let errors = [],
        username = $("#usernameInput").val(),
        password = $("#passwordInput").val(),
        confirmPassword = $("#confirmPasswordInput").val(),
        age = $("#ageInput").val(),
        email = $("#emailInput").val(),
        firstName = $("#firstNameInput").val(),
        lastName = $("#lastNameInput").val();
        try {
            username = checkUsername(username);
        } catch(e) {
            errors.push(e);
        }
        try {
            password = checkPassword(password);
        } catch(e) {
            errors.push(e);
        }
        if (password !== confirmPassword) errors.push("Passwords must match.");
        try {
            age = Number(age);
            age = checkAge(age);
        } catch(e) {
            errors.push(e);
        }
        try {
            email = checkEmail(email);
        } catch(e) {
            errors.push(e);
        }
        try {
            firstName = checkName(firstName, "first name");
        } catch(e) {
            errors.push(e);
        }
        try {
            lastName = checkName(lastName, "last name");
        } catch(e) {
            errors.push(e);
        }
        if (errors.length > 0) {
            event.preventDefault();
            errorList.empty();
            for (let i in errors) {
                errorList.append("<li>" + errors[i] + "</li>");
            }
            errorList.show();
        }
    });

})(window.jQuery);

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
import validator from 'email-validator';
function checkEmail(email) {
    email = checkString(email, "email");
    if (!validator.validate(email)) throw "The email is invalid.";
    return email;
};

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