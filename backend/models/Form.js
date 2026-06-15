import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'slider', 'radio', 'checkbox', 'textarea'],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: [{ type: String, trim: true }],
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    fields: { type: [fieldSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Form', formSchema);
