# CS546_Group5_Final (Riley Hawley, Eddie Kuang, Jince Shi, Eric Tashji)
Group 5's repo for Final Project in CS-546

## Part One: Running the project

### Running the project: 
1. Navigate to the project folder (which contains package.json) using the command console. 
2. Type npm run start into the console. This will begin the project.
3. On your browser, navigate to localhost:3000/. You can now begin perusing the project.

### Seeding the project: (This is how to run the seed file for bug testing purposes. Skip if you are not bug testing.)
1. Navigate to the project folder (which contains package.json) using the command console.
2. Type npm run seed into the console. This will seed the project with data.
3. The seed will contain 3 users, each with 3 journals (9 journals total), each with 3 sections (27 sections total), each with 3 posts (81 posts total).
4. The three users have the username: "username1", "username2", and "username3", respectively. All three users have the same password: "P@ssw0rd".
5. The file will also make a fourth user: the admin user. The username for the admin user is "adminUser", and the password for the admin user is "T1mApPDgi@2A". This user will have no journals, sections, or posts.
6. When running the application, I recommend updating the admin user password to a password of your own making. However, this is not necessary for bug testing purposes.
7. Note that each journal, section, and post is marked according to the other parts of the database it belongs to. For example, a post marked with "u1j1s1" in its title means it belongs to user 1 (with the username: "username1"), is in that user's journal 1, and is in section 1 of that journal.
8. Also note that each section's posts will vary. Sections belonging to "username1" will contain 1 public post and 2 private posts each. Sections belonging to "username2" will contain 1 public post, 1 private post, and 1 shared post, all of which are shared only with "username1." Sections belonging to "username3" will also contain 1 public post, 1 private post, and 1 shared post, but all of their shared posts will be shared with both "username1" and "username2."

### Main Page:
1. Once on the main page (URL: "localhost:3000/"), you have several options:
2. If you do not have an account, you can click on "Sign Up" to create one.
3. If you have an account, you can click on "Log In" to log in to your account.
4. If you do not wish to create an account, you can click on "Search Public Posts" to search through any journal posts that others have made public. (Skip to part 5: Posts.)

## Part Two: Users

### Signing Up:
1. Once on the registration page (URL: "localhost:3000/users/register"), enter your credentials (explained below):
2. Username: Must be at least 8 characters and can only contain letters, numbers, and special characters: !@#$%^&*.
3. Password: Must be at least 8 characters and contain 1 capital letter, 1 number, and 1 special character: !@#$%^&*.
4. Confirm Password: Must match the password above.
5. Age: You must be at least 18 to use the application. If your age is over 100, it will be invalid.
6. Email: You must enter a valid email that has not been used by another user.
7. First name: You must enter a valid first name (contains only letters, at least 2 characters, may contain apostrophes.)
8. Last name: You must enter a valid first name (contains only letters, at least 2 characters, may contain apostrophes.)
9. When done, click "Register".
10. You can also navigate back to the main page by clicking, "Back to main page."
11. Alternatively, if you already have an account, you can click on "Click Here to Log In" to log in.

### Logging In:
1. Once on the login page (URL: "localhost:3000/users/login"), enter your credentials (explained below):
2. Username: Enter the username you used to create the account. Note that it does not take into account capital or lowercase letters.
3. Password: Enter the password you used to create the account. The password must be exact.
4. If your credentials are correct, you will be brought to the user page. If not, an error will be displayed explaining what went wrong.
5. You can also navigate back to the main page by clicking "Back to main page."
6. Alternatively, if you do not have an account, you can click on "Click here to Register" to create a new one.

### User Page:
1. Once on the user page (URL: "localhost:3000/users/(your username)") the page will be different based upon a number of circumstances:
2. If the page is navigated to by someone who does not have an account, it will only display that user's public posts, and a form to search that user's public posts (if they have any).
3. If the page is navigated to by someone who is logged in, but is not the user themself, it will display that user's public posts (if they have any), and any shared posts between those two users (if there are any), as well as a form to search that user's public posts (if they have any).
4. If the page is navigated to by the owning user, or the admin user, it will display the user's public posts (if they have any), shared posts (if they have any), and journals (if they have any). It will also contain an options menu that has three options:
5. If the you wish to update the user, click "Update User." This will then take you to the user's update page.
6. If you wish to delete the user, click "Delete User" This will then take you to the user's delete page.
7. If you wish to Logout, click "Logout." This will then log you out and take you back to the log in page.
8. Note that you can navigate to the journals page to create journals by clicking "View all Journals" under the journals section (Skip to Part Three: Journals).
9. Note that you may search the user's posts by either keyword or date. If you wish to search by keyword, enter a keyword. If you wish to search by date, DO NOT ENTER A KEYWORD, and instead enter an early date and a later date. Note that you must enter both early and later dates in order to search. Furthermore, your earlier date must be equal to or earlier than your later date. Once entered, click "search." This form will only give you all this user's posts that are available to you.

### Update Page:
1. Note that you cannot visit a user's update page unless you are logged in as that user.
2. Once on the user update page (URL: "localhost:3000/users/update/(your username)"), you will have options to update the user. Options are explained below:
3. Password: Must be at least 8 characters and contain 1 capital letter, 1 number, and 1 special character. You must also confirm the password in the "Confirm Password" field, and the passwords must match.
4. Age: You can enter the new age. Note that it must be between 18 and 100, or you will get an error, and it won't update.
5. Email: You must enter a valid email that has not been used by another user.
6. First Name: You must enter a valid first name (contains only letters, at least 2 characters, may contain apostrophes.)
7. Last Name: You must enter a valid first name (contains only letters, at least 2 characters, may contain apostrophes.)
8. Note that if you do not enter anything, or if everything you entered is the same as the original credentials, it will throw an error and will not update. You also do not have to enter credentials for everything, only those credentials that you wish to update.
9. If you decide that you do not wish to update anything, you can click "Back to user" to return to the user page.

### Delete Page:
1. Note that you cannot visit a user's delete page unless you are logged in as that user.
2. Once on the user delete page (URL: "localhost:3000/users/delete/(your username)"), you may delete the user by clicking the "Delete" button.
3. Note that deleting a user will delete all of its journals, sections, and posts. This will also remove any shared posts and public posts, so that they cannot be seen by anyone ever again.
4. If you decide that you do not wish to delete the user, you may click the "Back to user" button to return to the user page.

### Search Page:
1. If you use the search function, as explained in the "User Page" section, you will get a variety of results:
2. If you are not logged in, you will only be able to view that user's public posts within your search parameters (if they have any).
3. If you are logged in, but not searching your own posts, you will be able to view that user's public posts, as well as any posts they may have shared with you, within the search parameters.
4. If you are logged in and searching your own posts, you will be able to view all of your posts, including public, private, and shared posts, that fit within your search parameters.
5. Clicking on any of the post titles will take you to that post (explained in Part Five: Posts).
6. If you search by keyword, you will get any posts containing your keyword in their titles or content. If you search by date, you will get posts that were created or updated between or on the two dates entered.

