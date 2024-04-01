import {ObjectId} from 'mongodb';

const exportedMethods = {
    checkString(stringVal, varName) {
        if (!stringVal) throw "The " + varName + " was not supplied or was empty.";
        if (typeof stringVal !== 'string') throw "The " + varName + " was not a string.";
        stringVal = stringVal.trim();
        if (stringVal.length === 0) throw "The " + varName + " was an empty string or contained only spaces.";
    }
}