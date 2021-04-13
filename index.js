// Imports.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const router = require('./src/routes');
const routerV2 = require('./src/routes/v2');

// App.
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/', router);
app.use('/api/v2/', routerV2);
app.use('/uploads/', express.static('uploads'));

app.listen(process.env.PORT, () => {
  console.log(`Your server is start on port ${process.env.PORT}...`);
});
