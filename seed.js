
// import * as userMethods from './data/users.js';
// import * as postMethods from './data/posts.js';
// import * as journalMethods from './data/journals.js';
// import * as connection from './config/mongoConnection.js';
// import * as sectionMethods from './data/sections.js';
// import {users, posts, sections, journals} from './config/mongoCollections.js';

// const userCollection = await users();
// const postCollection = await posts();
// const sectionCollection = await sections();
// const journalCollection = await journals();

// //Seed user 1
// try {
//     console.log(await userMethods.createUser("username1", "P@ssw0rd", 18, "email1@email.com", "Firstname", "Lastname"));
//     const user1 = await userCollection.findOne({username: "username1"});
//     const user1Id = user1._id.toString();
//     console.log(await journalMethods.createJournal(user1Id, "username1", "username1Journal1"));
//     console.log(await journalMethods.createJournal(user1Id, "username1", "username1Journal2"));
//     console.log(await journalMethods.createJournal(user1Id, "username1", "username1Journal3"));
//     const user1journal1 = await journalCollection.findOne({title: "username1Journal1"});
//     const user1journal2 = await journalCollection.findOne({title: "username1Journal2"});
//     const user1journal3 = await journalCollection.findOne({title: "username1Journal3"});
//     const user1journal1Id = user1journal1._id.toString();
//     const user1journal2Id = user1journal2._id.toString();
//     const user1journal3Id = user1journal3._id.toString();
//     console.log(await sectionMethods.createSection(user1journal1Id, "username1journal1section1", user1Id));
//     console.log(await sectionMethods.createSection(user1journal1Id, "username1journal1section2", user1Id));
//     console.log(await sectionMethods.createSection(user1journal1Id, "username1journal1section3", user1Id));
//     console.log(await sectionMethods.createSection(user1journal2Id, "username1journal2section1", user1Id));
//     console.log(await sectionMethods.createSection(user1journal2Id, "username1journal2section2", user1Id));
//     console.log(await sectionMethods.createSection(user1journal2Id, "username1journal2section3", user1Id));
//     console.log(await sectionMethods.createSection(user1journal3Id, "username1journal3section1", user1Id));
//     console.log(await sectionMethods.createSection(user1journal3Id, "username1journal3section2", user1Id));
//     console.log(await sectionMethods.createSection(user1journal3Id, "username1journal3section3", user1Id));
//     const user1journal1section1 = await sectionCollection.findOne({title: "username1journal1section1"});
//     const user1journal1section2 = await sectionCollection.findOne({title: "username1journal1section2"});
//     const user1journal1section3 = await sectionCollection.findOne({title: "username1journal1section3"});
//     const user1journal2section1 = await sectionCollection.findOne({title: "username1journal2section1"});
//     const user1journal2section2 = await sectionCollection.findOne({title: "username1journal2section2"});
//     const user1journal2section3 = await sectionCollection.findOne({title: "username1journal2section3"});
//     const user1journal3section1 = await sectionCollection.findOne({title: "username1journal3section1"});
//     const user1journal3section2 = await sectionCollection.findOne({title: "username1journal3section2"});
//     const user1journal3section3 = await sectionCollection.findOne({title: "username1journal3section3"});
//     const user1journal1section1Id = user1journal1section1._id.toString();
//     const user1journal1section2Id = user1journal1section2._id.toString();
//     const user1journal1section3Id = user1journal1section3._id.toString();
//     const user1journal2section1Id = user1journal2section1._id.toString();
//     const user1journal2section2Id = user1journal2section2._id.toString();
//     const user1journal2section3Id = user1journal2section3._id.toString();
//     const user1journal3section1Id = user1journal3section1._id.toString();
//     const user1journal3section2Id = user1journal3section2._id.toString();
//     const user1journal3section3Id = user1journal3section3._id.toString();
//     console.log(await postMethods.addPost(user1journal1section1Id, "username1journal1section1post1", "This is the content for post 1 in section 1 in journal 1, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal1section1Id, "username1journal1section1post2", "This is the content for post 2 in section 1 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal1section1Id, "username1journal1section1post3", "This is the content for post 3 in section 1 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal1section2Id, "username1journal1section2post1", "This is the content for post 1 in section 2 in journal 1, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal1section2Id, "username1journal1section2post2", "This is the content for post 2 in section 2 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal1section2Id, "username1journal1section2post3", "This is the content for post 3 in section 2 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal1section3Id, "username1journal1section3post1", "This is the content for post 1 in section 3 in journal 1, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal1section3Id, "username1journal1section3post2", "This is the content for post 2 in section 3 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal1section3Id, "username1journal1section3post3", "This is the content for post 3 in section 3 in journal 1, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section1Id, "username1journal2section1post1", "This is the content for post 1 in section 1 in journal 2, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal2section1Id, "username1journal2section1post2", "This is the content for post 2 in section 1 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section1Id, "username1journal2section1post3", "This is the content for post 3 in section 1 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section2Id, "username1journal2section2post1", "This is the content for post 1 in section 2 in journal 2, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal2section2Id, "username1journal2section2post2", "This is the content for post 2 in section 2 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section2Id, "username1journal2section2post3", "This is the content for post 3 in section 2 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section3Id, "username1journal2section3post1", "This is the content for post 1 in section 3 in journal 2, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal2section3Id, "username1journal2section3post2", "This is the content for post 2 in section 3 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal2section3Id, "username1journal2section3post3", "This is the content for post 3 in section 3 in journal 2, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section1Id, "username1journal3section1post1", "This is the content for post 1 in section 1 in journal 3, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal3section1Id, "username1journal3section1post2", "This is the content for post 2 in section 1 in journal 3, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section1Id, "username1journal3section1post3", "This is the content for post 3 in section 1 in journal 3, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section2Id, "username1journal3section2post1", "This is the content for post 1 in section 2 in journal 3, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal3section2Id, "username1journal3section2post2", "This is the content for post 2 in section 2 in journal 3, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section2Id, "username1journal3section2post3", "This is the content for post 3 in section 2 in journal 3, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section3Id, "username1journal3section3post1", "This is the content for post 1 in section 3 in journal 3, authored by user 1.", "public", "username1"));
//     console.log(await postMethods.addPost(user1journal3section3Id, "username1journal3section3post2", "This is the content for post 2 in section 3 in journal 3, authored by user 1.", "private", "username1"));
//     console.log(await postMethods.addPost(user1journal3section3Id, "username1journal3section3post3", "This is the content for post 3 in section 3 in journal 3, authored by user 1.", "private", "username1"));
// } catch(e) {
//     console.log(e);
// }

// //Seed user 2
// try {
//     console.log(await userMethods.createUser("username2", "P@ssw0rd", 18, "email2@email.com", "Firstname", "Lastname"));
//     const user2 = await userCollection.findOne({username: "username2"});
//     const user2Id = user2._id.toString();
//     console.log(await journalMethods.createJournal(user2Id, "username2", "username2Journal1"));
//     console.log(await journalMethods.createJournal(user2Id, "username2", "username2Journal2"));
//     console.log(await journalMethods.createJournal(user2Id, "username2", "username2Journal3"));
//     const user2journal1 = await journalCollection.findOne({title: "username2Journal1"});
//     const user2journal2 = await journalCollection.findOne({title: "username2Journal2"});
//     const user2journal3 = await journalCollection.findOne({title: "username2Journal3"});
//     const user2journal1Id = user2journal1._id.toString();
//     const user2journal2Id = user2journal2._id.toString();
//     const user2journal3Id = user2journal3._id.toString();
//     console.log(await sectionMethods.createSection(user2journal1Id, "username2journal1section1", user2Id));
//     console.log(await sectionMethods.createSection(user2journal1Id, "username2journal1section2", user2Id));
//     console.log(await sectionMethods.createSection(user2journal1Id, "username2journal1section3", user2Id));
//     console.log(await sectionMethods.createSection(user2journal2Id, "username2journal2section1", user2Id));
//     console.log(await sectionMethods.createSection(user2journal2Id, "username2journal2section2", user2Id));
//     console.log(await sectionMethods.createSection(user2journal2Id, "username2journal2section3", user2Id));
//     console.log(await sectionMethods.createSection(user2journal3Id, "username2journal3section1", user2Id));
//     console.log(await sectionMethods.createSection(user2journal3Id, "username2journal3section2", user2Id));
//     console.log(await sectionMethods.createSection(user2journal3Id, "username2journal3section3", user2Id));
//     const user2journal1section1 = await sectionCollection.findOne({title: "username2journal1section1"});
//     const user2journal1section2 = await sectionCollection.findOne({title: "username2journal1section2"});
//     const user2journal1section3 = await sectionCollection.findOne({title: "username2journal1section3"});
//     const user2journal2section1 = await sectionCollection.findOne({title: "username2journal2section1"});
//     const user2journal2section2 = await sectionCollection.findOne({title: "username2journal2section2"});
//     const user2journal2section3 = await sectionCollection.findOne({title: "username2journal2section3"});
//     const user2journal3section1 = await sectionCollection.findOne({title: "username2journal3section1"});
//     const user2journal3section2 = await sectionCollection.findOne({title: "username2journal3section2"});
//     const user2journal3section3 = await sectionCollection.findOne({title: "username2journal3section3"});
//     const user2journal1section1Id = user2journal1section1._id.toString();
//     const user2journal1section2Id = user2journal1section2._id.toString();
//     const user2journal1section3Id = user2journal1section3._id.toString();
//     const user2journal2section1Id = user2journal2section1._id.toString();
//     const user2journal2section2Id = user2journal2section2._id.toString();
//     const user2journal2section3Id = user2journal2section3._id.toString();
//     const user2journal3section1Id = user2journal3section1._id.toString();
//     const user2journal3section2Id = user2journal3section2._id.toString();
//     const user2journal3section3Id = user2journal3section3._id.toString();
//     console.log(await postMethods.addPost(user2journal1section1Id, "username2journal1section1post1", "This is the content for post 1 in section 1 in journal 1, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal1section1Id, "username2journal1section1post2", "This is the content for post 2 in section 1 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal1section1Id, "username2journal1section1post3", "This is the content for post 3 in section 1 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal1section2Id, "username2journal1section2post1", "This is the content for post 1 in section 2 in journal 1, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal1section2Id, "username2journal1section2post2", "This is the content for post 2 in section 2 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal1section2Id, "username2journal1section2post3", "This is the content for post 3 in section 2 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal1section3Id, "username2journal1section3post1", "This is the content for post 1 in section 3 in journal 1, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal1section3Id, "username2journal1section3post2", "This is the content for post 2 in section 3 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal1section3Id, "username2journal1section3post3", "This is the content for post 3 in section 3 in journal 1, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section1Id, "username2journal2section1post1", "This is the content for post 1 in section 1 in journal 2, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal2section1Id, "username2journal2section1post2", "This is the content for post 2 in section 1 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section1Id, "username2journal2section1post3", "This is the content for post 3 in section 1 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section2Id, "username2journal2section2post1", "This is the content for post 1 in section 2 in journal 2, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal2section2Id, "username2journal2section2post2", "This is the content for post 2 in section 2 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section2Id, "username2journal2section2post3", "This is the content for post 3 in section 2 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section3Id, "username2journal2section3post1", "This is the content for post 1 in section 3 in journal 2, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal2section3Id, "username2journal2section3post2", "This is the content for post 2 in section 3 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal2section3Id, "username2journal2section3post3", "This is the content for post 3 in section 3 in journal 2, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section1Id, "username2journal3section1post1", "This is the content for post 1 in section 1 in journal 3, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal3section1Id, "username2journal3section1post2", "This is the content for post 2 in section 1 in journal 3, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section1Id, "username2journal3section1post3", "This is the content for post 3 in section 1 in journal 3, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section2Id, "username2journal3section2post1", "This is the content for post 1 in section 2 in journal 3, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal3section2Id, "username2journal3section2post2", "This is the content for post 2 in section 2 in journal 3, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section2Id, "username2journal3section2post3", "This is the content for post 3 in section 2 in journal 3, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section3Id, "username2journal3section3post1", "This is the content for post 1 in section 3 in journal 3, authored by user 2.", "public", "username2"));
//     console.log(await postMethods.addPost(user2journal3section3Id, "username2journal3section3post2", "This is the content for post 2 in section 3 in journal 3, authored by user 2.", "private", "username2"));
//     console.log(await postMethods.addPost(user2journal3section3Id, "username2journal3section3post3", "This is the content for post 3 in section 3 in journal 3, authored by user 2.", "private", "username2"));
//     const user2journal1section1post3 = await postCollection.findOne({title: "username2journal1section1post3"});
//     const user2journal1section2post3 = await postCollection.findOne({title: "username2journal1section2post3"});
//     const user2journal1section3post3 = await postCollection.findOne({title: "username2journal1section3post3"});
//     const user2journal2section1post3 = await postCollection.findOne({title: "username2journal2section1post3"});
//     const user2journal2section2post3 = await postCollection.findOne({title: "username2journal2section2post3"});
//     const user2journal2section3post3 = await postCollection.findOne({title: "username2journal2section3post3"});
//     const user2journal3section1post3 = await postCollection.findOne({title: "username2journal3section1post3"});
//     const user2journal3section2post3 = await postCollection.findOne({title: "username2journal3section2post3"});
//     const user2journal3section3post3 = await postCollection.findOne({title: "username2journal3section3post3"});
//     const user2journal1section1post3Id = user2journal1section1post3._id.toString();
//     const user2journal1section2post3Id = user2journal1section2post3._id.toString();
//     const user2journal1section3post3Id = user2journal1section3post3._id.toString();
//     const user2journal2section1post3Id = user2journal2section1post3._id.toString();
//     const user2journal2section2post3Id = user2journal2section2post3._id.toString();
//     const user2journal2section3post3Id = user2journal2section3post3._id.toString();
//     const user2journal3section1post3Id = user2journal3section1post3._id.toString();
//     const user2journal3section2post3Id = user2journal3section2post3._id.toString();
//     const user2journal3section3post3Id = user2journal3section3post3._id.toString();
//     console.log(await postMethods.updatePost(user2journal1section1post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal1section2post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal1section3post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal2section1post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal2section2post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal2section3post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal3section1post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal3section2post3Id, "username2", "user", {pub: "private", username: "username1"}));
//     console.log(await postMethods.updatePost(user2journal3section3post3Id, "username2", "user", {pub: "private", username: "username1"}));
// } catch(e) {
//     console.log(e);
// }




// await connection.closeConnection();


import {dbConnection, closeConnection} from './config/mongoConnection.js';
import * as users from './data/users.js';
import * as journals from './data/journals.js';
import * as sections from './data/sections.js';
import * as posts from './data/posts.js';
import {ObjectId} from 'mongodb';

const db = await dbConnection();
await db.dropDatabase();

//user1
const user1 = await users.createUser('iamuser1', 'ABC12345!','ABC12345!', 23, 'iamuser1@gmail.com', 'George', 'Cat' );
const userId1 = (await db.collection('users').findOne({ username: 'iamuser1' }, { _id: 1 }))._id;


const user1Journal = await journals.createJournal(userId1, 'iamuser1', 'Trip');

const journalId1 = user1Journal._id.toString();

const user1Section = await sections.createSection(journalId1, "New York", userId1);
const sectionId1 = user1Section._id.toString();
const user1Post = await posts.addPost(sectionId1, "Ate Dinner", "Enjoyed some food at downtown NYC.", 'Private', '', '');


//user2
const user2 = await users.createUser('iamuser2', 'ABC123456!','ABC123456!', 30, 'iamuser2@gmail.com', 'Jimmy', 'Dog' );
const userId2 = (await db.collection('users').findOne({ username: 'iamuser2' }, { _id: 1 }))._id;


const user2Journal = await journals.createJournal(userId2, 'iamuser2', 'Places');

const journalId2 = user2Journal._id.toString();

const user2Section = await sections.createSection(journalId2, "California", userId2);
const sectionId2 = user2Section._id.toString();
const user2Post = await posts.addPost(sectionId2, "Nice and Warm", "Very nice sun shine LA", 'public', '', '');


//user3
const user3 = await users.createUser('iamuser3', 'ABC12346!','ABC12346!', 44, 'iamuser3@gmail.com', 'Pat', 'Cat' );

const userId3 = (await db.collection('users').findOne({ username: 'iamuser3' }, { _id: 1 }))._id;


const user3Journal = await journals.createJournal(userId3, 'iamuser3', 'Education');

const journalId3 = user3Journal._id.toString();

const user3Section = await sections.createSection(journalId3, "Grad school", userId3);
const sectionId3 = user3Section._id.toString();
const user3Post = await posts.addPost(sectionId3, "Studies", "Majored in Computer Science.", 'public', '', '');

//user4
const user4 = await users.createUser('iamuser4', 'ABC12347!','ABC12347!', 27, 'iamuser4@gmail.com', 'Robin', 'Cat' );
const userId4 = (await db.collection('users').findOne({ username: 'iamuser4' }, { _id: 1 }))._id;


const user4Journal = await journals.createJournal(userId4, 'iamuser4', 'Job');

const journalId4 = user4Journal._id.toString();

const user4Section = await sections.createSection(journalId4, "My first job", userId1);
const sectionId4 = user4Section._id.toString();
const user4Post = await posts.addPost(sectionId4, "Developer", "My first job was a software engineer.", 'public', '', '');


//user5
const user5 = await users.createUser('iamuser5', 'ABC12348!','ABC12348!', 38, 'iamuser5@gmail.com', 'Ashley', 'Ran' );
const userId5 = (await db.collection('users').findOne({ username: 'iamuser5' }, { _id: 1 }))._id;


const user5Journal = await journals.createJournal(userId5, 'iamuser5', 'Favorite food');

const journalId5 = user5Journal._id.toString();

const user5Section = await sections.createSection(journalId5, "American food", userId5);
const sectionId5 = user5Section._id.toString();
const user5Post = await posts.addPost(sectionId5, "Burger", "My favorite american food is burgers with a coke.", 'public', '', '');






 console.log('Done seeding database');

await closeConnection();
