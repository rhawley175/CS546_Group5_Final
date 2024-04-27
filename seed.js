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
