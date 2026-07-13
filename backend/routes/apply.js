const router = require('express').Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');

// apply job
router.post('/', auth, async (req,res)=>{
  const app = new Application({
    jobId: req.body.jobId,
    userId: req.user.id
  });

  await app.save();
  res.json({msg:"Applied"});
});

// get user applications
router.get('/', auth, async (req,res)=>{
  const apps = await Application.find({ userId: req.user.id });
  res.json(apps);
});

module.exports = router;