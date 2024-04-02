import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
    let _col = undefined;

    return async () => {
        if (!_col) {
            const db = await dbConnection();
            _col = await db.collection(collection);
        }

        return _col;
    };
};

//You will need to add each collection here to your mongoDB database.
export const users = getCollectionFn('users');
export const journals = getCollectionFn('journals');
export const sections = getCollectionFn('sections');
export const posts = getCollectionFn('posts');