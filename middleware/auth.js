const admin = require("../firebase");
const db = require('../db/connection');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  
  if (!token) return res.status(401).send({ msg: "No token provided" });

  admin.auth().verifyIdToken(token)
    .then((decodedToken) => {

      req.user = decodedToken;

      return db.query('SELECT * FROM users WHERE firebase_uid = $1', [
        decodedToken.uid,
      ]);
    })
    .then((result) => {
        if (!result?.rows) {
            console.error('❌ Database error');
            return res.status(500).json({ msg: 'Database error' });
          }
            // If user does not exist, allow only POST /users to proceed
      if (result.rows.length === 0) {
        // console.log('User not found, allowing POST request to create user');
        req.body = { ...req.user }; // Pass decoded user to request body

        // If the request is a POST to create a new user, proceed
        // console.log(req.method, req.originalUrl);
        if (req.method === 'POST' && req.originalUrl === '/api/users') {
          return next();
        }

        // Otherwise, block access
        return res
          .status(404)
          .json({ msg: 'User not found, please register first' });
      }

      req.user.dbUser = result.rows[0]; // Attach user from DB
      // console.log(
      //   `🔹 Authenticated as: id=${req.user.dbUser.id}, role=${req.user.dbUser.role}`
      // );
      next();
    })
    .catch(() => {
      res.status(401).send({ msg: "Invalid or expired token" });
    });
}

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !req.user.dbUser) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    if (!roles.includes(req.user.dbUser.role)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    next();
  };
module.exports = { authenticate, restrictTo };
