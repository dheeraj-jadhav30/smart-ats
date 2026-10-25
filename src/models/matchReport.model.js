import mongoose from 'mongoose'

const matchReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    jobTitle: {
      type: String,
      default: 'Not specified',
      trim: true
    },
    companyName: {
      type: String,
      default: 'Not specified',
      trim: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    matchingSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    },
    tailoredCoverLetter: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

// Compound Index: Makes fetching a user's recent report history lightning-fast (PRD 5.2)
matchReportSchema.index({ user: 1, createdAt: -1 })

const matchReportModel = mongoose.model('MatchReport', matchReportSchema)

export default matchReportModel
