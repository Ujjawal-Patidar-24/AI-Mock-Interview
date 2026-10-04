import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.split(' ')[1];

        
        if (!token) {
            return res.status(401).json({ 
                message: 'Access denied — no token provided' 
            });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user from database using decoded userId
        const user = await User.findById(decoded.userId);

        
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid token — user not found' 
            });
        }

        
        req.user = user;

        
        next();

    } catch (error) {
        return res.status(401).json({ 
            message: 'Invalid token' 
        });
    }
};

export default authMiddleware;