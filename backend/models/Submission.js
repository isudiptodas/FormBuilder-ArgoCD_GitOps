import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, default: '' },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

submissionSchema.index({ form: 1, email: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
