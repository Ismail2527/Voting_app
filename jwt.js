const jwt = require('jsonwebtoken');

// JWT authentication middleware
const jwtAuthMiddleware = (req, res, next) => {
    // Check if authorization header exists
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token not found' });

    // Extract JWT token from header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Verify JWT token using the secret from the environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Corrected
        req.user = decoded; // Attach decoded token to request
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Function to generate a JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30000m' }); // Corrected
};

module.exports = { jwtAuthMiddleware, generateToken };
