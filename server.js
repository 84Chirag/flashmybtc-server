const express = require('express');
const connecttodb = require('./database');
const cors = require('cors')
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// all available routes
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

//connection to database check database.js for info
connecttodb();