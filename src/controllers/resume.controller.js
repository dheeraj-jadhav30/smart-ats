import { extractTextFromPDF } from "../services/resume-parser.service.js";
import {generateResumeAnalysis} from '../services/resume-analysis.services.js'
import matchReportModel from "../models/matchReport.model.js";
import mongoose from 'mongoose' // Add at the top if not present

export const analyzeResume = async (req , res) => {
    try{
        const {jobDescription , jobTitle , companyName} = req.body 

        if (!jobDescription || jobDescription.trim().length < 30) {
            return res.status(400).json({
                success: false,
                message: 'A job description with at least 30 characters is required'
            })
        }

        let resumeText = ''

        if(req.file) {
            resumeText = await extractTextFromPDF(req.file.buffer)
        }else if(req.body.resumeText) {
            resumeText = req.body.resumeText.trim()
        }else{
            return res.status(400).json({
                success:false ,
                message:"Please provide either a pdf resume file or resume text in body"
            })
        }

        if(resumeText.length < 50) {
            return res.status(400).json({
                success:false ,
                message:"resume text to short to perfome meaningfull analysis"
            })
        }

        const analysisResult = await generateResumeAnalysis({
            resumeText,
            jobDescription,
            jobTitle,
            companyName
        })


        
        
        const savedReport = await matchReportModel.create({
        user: req.user,
        jobTitle: jobTitle || 'Not specified',
        companyName: companyName || 'Not specified',
        ...analysisResult
        })

        return res.status(201).json({
        success: true,
        message: 'Resume analyzed and report saved successfully',
        data: savedReport
        })

    }catch(error) {
        return res.status(400).json({
            success:false ,
            message:error.message
        })
    }
}

export const historyController = async (req, res) => {
    try {
        // 1. Sanitize page and limit (prevent negative numbers or huge limits)
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 5))
        const skip = (page - 1) * limit

        // 2. Fetch reports for the logged-in user (newest first)
        const reports = await matchReportModel.find({ user: req.user })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        // 3. Count total reports for this candidate
        const totalReports = await matchReportModel.countDocuments({ user: req.user })
        const totalPages = Math.ceil(totalReports / limit)

        // 4. Calculate candidate's average match score across all scans
        const stats = await matchReportModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user) } },
            { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
        ])
        const averageScore = stats.length > 0 ? Math.round(stats[0].avgScore) : 0

        // 5. Send clean paginated response
        return res.status(200).json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: page,
                    limit,
                    totalReports,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                averageScore
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



export const getReportByIdController = async ( req , res) => {
    try{
        const {id} = req.params

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success:false ,
                message:"Invalid report Id format"
            })
        }
    

    const report = await matchReportModel.findOne({
        _id:id ,
        user:req.user
    })

    if(!report) {
        return res.status(404).json({
            success:false ,
            message:"Report not found"
        })
    }

    return res.status(200).json({
            success: true,
            data: report
    })

    }catch(error) {
        return res.status(500).json({
            success:false ,
            message:error.message
        })
    }
}



export const deleteReportController = async (req, res) => {
    try {
        const { id } = req.params
        // 1. Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report ID format'
            })
        }
        // 2. Delete only if it belongs to this user
        const deletedReport = await matchReportModel.findOneAndDelete({
            _id: id,
            user: req.user
        })
        if (!deletedReport) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or already deleted'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}