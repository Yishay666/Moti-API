const express = require('express');
const app = express();
const cors = require('cors');
const Datastore = require('nedb');

global.database = new Datastore('database.db');
database.loadDatabase();

app.use(cors())
app.use(express.json())
app.use('/api', require('./api.js'))

app.listen(3000, () => console.log('App Is Up!'))