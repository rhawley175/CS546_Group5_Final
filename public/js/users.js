(function($) {

    let loginForm = $("#login-form"),
    errorList = $("#errors"),
    updateForm = $("#update-form"),
    registrationForm = $("#registration-form"),
    searchForm = $("#search-form"),
    dataObject;

    let requestConfig = {
        method: "POST",
        url: "/users/json",
        success: function(data) {
            dataObject = data;
        }
    }

    $(document).ready(function() {
        $.ajax(requestConfig).then(function(){
        });
    });

    $(loginForm).submit(function(event) {
        let errors = [];
        let login = $("#loginInput").val(),
        password = $("#passwordInput").val();
        let valid = false;
        try {
            login = checkString(login, "username or email");
            for (let i in dataObject) {
                if (dataObject[i].username.toLowerCase() === login.toLowerCase()) {
                    valid = true;
                }
            }
            if (!valid) throw "Username or password is incorrect.";
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
                for (let i in dataObject) {
                    if (dataObject[i].email === email) throw "This email has already been used.";
                }
                email = checkString(email, "email");
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
            for (let i in dataObject) {
                if (dataObject[i].username.toLowerCase() === username.toLowerCase()) throw "This username has already been used.";
            }
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
            email = checkString(email, "email");
            for (let i in dataObject) {
                if (dataObject[i].email === email) throw "This email has already been used.";
            }
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

    $(searchForm).submit(function(event) {
        let errors = [],
        keyword = $("#keywordInput").val(),
        date1 = $("#date1Input").val(),
        date2 = $("#date2Input").val();
        if (keyword) {
            try {
                keyword = checkString(keyword, "search term");
            } catch(e) {
                errors.push(e);
            }
        }
        else if (date1 && date2) {
            try {
                date1 = checkDate(date1);
                date2 = checkDate(date2);
                let newDate1 = Date.parse(date1);
                let newDate2 = Date.parse(date2);
                if (newDate1 > newDate2) throw "The earlier date is later than the later date.";
            } catch(e) {
                errors.push(e);
            }
        }
        else errors.push("You must enter a keyword or two dates.");
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