import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    next();
};

app.use(cookieParser());
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(session({
    name:"AuthState",
    secret: "Secret string!",
    resave: false,
    saveUninitialized: false
}));

configRoutes(app);

app.listen(3000, () => {
    console.log("Now we've got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});

// If you need to do work other than run the server, comment out the above code, and write your new code below:

// import * as users from './data/users.js';
// import * as posts from './data/posts.js';
// import * as journals from './data/journals.js';
// import * as connection from './config/mongoConnection.js';

// try {
//     console.log(await posts.getAllUserPosts("username", "username", "user"));
// } catch(e) {
//     console.log(e);
// }

// await connection.closeConnection();
