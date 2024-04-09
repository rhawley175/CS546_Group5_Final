import userRoutes from './users.js';
import journalRoutes from './journals.js';
import sectionRoutes from './sections.js';
import postRoutes from './posts.js';
import commentRoutes from './comments.js';

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
    app.use('/journals', journalRoutes);
    app.use('/sections', sectionRoutes);
    app.use('/posts', postRoutes);
    app.use('/comments', commentRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: 'Route Not Found'});
    });
};

export default constructorMethod;