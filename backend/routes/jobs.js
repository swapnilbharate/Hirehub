const router = require('express').Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  type: String,
  experience: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', JobSchema);

// GET
router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// ADD (admin only)
router.post('/', auth, async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json(job);
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;