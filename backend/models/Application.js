const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: String,
  userId: String
});

module.exports = mongoose.model('Application', ApplicationSchema);