const jwt = require('jsonwebtoken');
const Site=require('../model/Site');
// Middleware for subdomain verification
const verifySubdomain = async (req, res, next) => {
  const subdomain = req.hostname.split('.')[0]; // Extract subdomain from hostname
  const associationId = req.user.associationId; // Extract association ID from JWT

  try {
    const site = await Site.findOne({ association_id: associationId });
    if (!site || site.url !== subdomain) {
      return res.status(403).json({ message: 'Forbidden Access' });
    }
    next(); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports = {verifySubdomain};