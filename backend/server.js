// Development or Production build?
const environment = process.env.NODE_ENV || 'development';

// Make Mongoose use `findOneAndUpdate()`.
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

// Opt in to using the new topology engine
mongoose.set('useUnifiedTopology', true);

// Connecting mongoDB Database
mongoose.Promise = global.Promise;

const dbConfig = require('./database/dbConfig');
mongoose.connect(dbConfig.db, {
    useNewUrlParser: true
}).then(() => {
    console.log('Database sucessfully connected!');
},
    error => {
        console.log('Could not connect to database : ' + error);
    }
);

// Express Routes
const app = require('express')();

// Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Cors
let cors = require('cors');
app.use(cors());

// API
const apiRoute = require('../backend/routes/api.route');
app.use('/api', apiRoute);

// PORT
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log('Connected to port ' + port);
});

