const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use('/api', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/apply', require('./routes/apply'));

app.get('/', (req, res) => {
  res.send("Backend Running 🚀");
});

mongoose.connect('mongodb://127.0.0.1:27017/nexhire')
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});