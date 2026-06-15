import express from 'express';
import dns from 'dns/promises';
import {connectDB} from '../config/db.js';
import Form from '../models/Form.js';
import Submission from '../models/Submission.js';
import { requireAuth } from './auth.js';

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = async (email) => {
  if (!emailRegex.test(email)) {
    return false;
  }

  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    return false;
  }
};

const cleanFields = (fields = []) => {
  return fields.map((field) => ({
    id: field.id,
    type: field.type,
    label: field.label,
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options.filter(Boolean) : [],
    min: Number.isFinite(Number(field.min)) ? Number(field.min) : 0,
    max: Number.isFinite(Number(field.max)) ? Number(field.max) : 100,
  }));
};

router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { search = '', sort = 'latest' } = req.query;
    const order = sort === 'oldest' ? 1 : -1;
    const query = {
      owner: req.user._id,
      title: { $regex: search, $options: 'i' },
    };

    const forms = await Form.find(query).sort({ createdAt: order });
    return res.json({ forms });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load forms' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { title, description, fields } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Form title is required' });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'Add at least one form section before publishing' });
    }

    const form = await Form.create({
      owner: req.user._id,
      title,
      description,
      fields: cleanFields(fields),
      published: true,
    });

    return res.status(201).json({ form, message: 'Form published successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not publish form' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const form = await Form.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    await Submission.deleteMany({ form: form._id });
    return res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete form' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    await connectDB();
    const form = await Form.findOne({ _id: req.params.id, published: true }).select('-owner');
    if (!form) {
      return res.status(404).json({ message: 'This form is not available' });
    }

    return res.json({ form });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load form' });
  }
});

router.post('/public/:id/submit', async (req, res) => {
  try {
    await connectDB();
    const { email, answers = {} } = req.body;
    const form = await Form.findOne({ _id: req.params.id, published: true });

    if (!form) {
      return res.status(404).json({ message: 'This form is not available' });
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const emailIsValid = await validateEmail(normalizedEmail);
    if (!emailIsValid) {
      return res.status(400).json({ message: 'Enter a valid email address with active mail records' });
    }

    const existingSubmission = await Submission.findOne({ form: form._id, email: normalizedEmail });
    if (existingSubmission) {
      return res.status(409).json({ message: 'This email has already submitted this form' });
    }

    for (const field of form.fields) {
      const value = answers[field.id];
      const missingArray = Array.isArray(value) && value.length === 0;
      if (field.required && (value === undefined || value === '' || missingArray)) {
        return res.status(400).json({ message: `${field.label} is required` });
      }
    }

    const answerList = form.fields.map((field) => ({
      fieldId: field.id,
      label: field.label,
      value: answers[field.id] ?? '',
    }));

    const submission = await Submission.create({
      form: form._id,
      email: normalizedEmail,
      answers: answerList,
    });

    return res.status(201).json({ submission, message: 'Form submitted successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email has already submitted this form' });
    }
    return res.status(500).json({ message: 'Could not submit form' });
  }
});

export default router;
