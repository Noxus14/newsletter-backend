const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors());
app.use( express.json());

app.use('/newsletter', require('./routes/register'));
app.use('/newsletter', require('./routes/newsletter'));

app.listen( process.env.PORT, () => {
    console.log(`Server listen: ${ process.env.PORT}`)
});