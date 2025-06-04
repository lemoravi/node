const express = require('express');
const cors = require('cors');
const app = express();
require('./config/db');

app.use(express.json());
app.use(cors());

const routes = require('./routes');
app.use('/', routes);

app.listen(5002, () => {
    console.log("Server is running on port 5002");
});
