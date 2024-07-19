import mongoose, { Schema } from "mongoose";

const questionBankSchema = new Schema(
    {
        subject: {
            type: String,
          },
          question: {
            type: String,
          },
          answer: {
            type: String,
          },
          options: {
            type: [String],
          },
          topic: {
            type: String,
          },
          difficulty_level: {
            type: String,
            enum: ['easy', 'medium', 'hard'] 
          }
    },
    {
        timestamps: true
    }
)


export const questionBank = mongoose.model("questionBank", questionBankSchema)