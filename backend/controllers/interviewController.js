import Interview from '../models/Interview.js';

// SAVE INTERVIEW
export const saveInterview = async (req, res) => {
    try {
        const { role, difficulty, score, rating, status, feedback, strengths, weaknesses, conversation, duration } = req.body;

        const newInterview = new Interview({
            userId: req.user._id,
            role,
            difficulty,
            score,
            rating,
            status,
            feedback,
            strengths,
            weaknesses,
            conversation,
            duration
        });

        await newInterview.save();

        res.status(201).json({ 
            message: 'Interview saved successfully',
            interview: newInterview
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET ALL INTERVIEWS FOR LOGGED IN USER
export const getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({ interviews });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET SINGLE INTERVIEW BY ID
export const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.status(200).json({ interview });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};