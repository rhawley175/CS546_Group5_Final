import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import helpers from '../helpers.js';

const create = async (
    username,
    password,
    age,
    email,
    firstName,
    lastName
) => {
    username = helpers.checkString(username);
}