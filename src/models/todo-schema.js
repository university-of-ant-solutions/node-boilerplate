import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import {
  connectPrimaryData,
} from '../connect/mongo';
const { Schema } = mongoose;

const TodoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    required: true,
  },
});

// indexes
// TodoSchema.index({
//   'title': 1
// });

// plugins
TodoSchema.plugin(timestamps);

// methods
// TodoSchema.statics.createANewToken = function () {}

let model = null;
export default function (mongoose) {
  if (!model) {
    if (!mongoose) {
      mongoose = connectPrimaryData();
    }
    model = mongoose.model('Todo', TodoSchema);
  }
  return model;
}
