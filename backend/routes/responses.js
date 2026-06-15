import express from 'express';
import {connectDB} from '../config/db.js';
import Form from '../models/Form.js';
import Submission from '../models/Submission.js';
import { requireAuth } from './auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { search = '', sort = 'latest' } = req.query;
    const order = sort === 'oldest' ? 1 : -1;
    const forms = await Form.aggregate([
      { $match: { owner: req.user._id, title: { $regex: search, $options: 'i' } } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'form',
          as: 'submissions',
        },
      },
      { $match: { 'submissions.0': { $exists: true } } },
      { $addFields: { responseCount: { $size: '$submissions' } } },
      { $project: { submissions: 0 } },
      { $sort: { createdAt: order } },
    ]);

    return res.json({ forms });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load responses' });
  }
});

router.get('/:formId', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const form = await Form.findOne({ _id: req.params.formId, owner: req.user._id });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const submissions = await Submission.find({ form: form._id }).sort({ createdAt: -1 });
    return res.json({ form, submissions });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load response details' });
  }
});

export default router;
