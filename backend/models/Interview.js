import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    speaker: {
        type: String,
        enum: ['AI', 'User'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: String
    }
});

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Poor']
    },
    status: {
        type: String,
        enum: ['Passed', 'Failed']
    },
    feedback: {
        type: String
    },
    strengths: [String],
    weaknesses: [String],
    conversation: [messageSchema],
    duration: {
        type: Number  
    }
}, { timestamps: true });

export default mongoose.model('Interview', interviewSchema);