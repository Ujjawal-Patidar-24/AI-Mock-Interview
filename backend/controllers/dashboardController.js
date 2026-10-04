import Interview from '../models/Interview.js';

export const getDashboardStats = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });

        const totalInterviews = interviews.length;

        let averageScore = 0;
        let successCount = 0;

        if (totalInterviews > 0) {
            const totalScore = interviews.reduce((sum, interview) => sum + interview.score, 0);
            averageScore = Math.round(totalScore / totalInterviews);

            successCount = interviews.filter(interview => interview.status === 'Passed').length;
        }

        const successRate = totalInterviews > 0 
            ? Math.round((successCount / totalInterviews) * 100) + '%' 
            : '0%';

        res.status(200).json({
            name: req.user.name,
            averageScore,
            totalInterviews,
            successRate,
            interviews
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};