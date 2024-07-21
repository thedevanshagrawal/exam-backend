import mongoose, { Schema } from "mongoose";

const questionPaperSchema = new Schema(
  {
    question_id: {
      type: [String],
    },
    school_id: {
      type: String,
    },
    test_name: {
      type: String,
    },
    duration: {
      type: String,
    },
    total_marks: {
      type: String,
    },
    School_class: {
      type: String,
    },
    difficulty_level: {
      type: String,
    }
  },
  {
    timestamps: true
  }
)


export const questionPaper = mongoose.model("questionPaper", questionPaperSchema)