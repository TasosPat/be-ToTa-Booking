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

      req.user.dbUser = result.rows[0];
      req.body = { ...req.body, ...req.user };
      // Attach user from DB
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

  const checkBookingAccess = async (req, res, next) => {
    let targetUserId;
    const reqUser = req.user.dbUser;
    const { user_id, service_id, booking_id } = req.query;

    if(reqUser.role === "admin") {
      return next();
    }

    if(user_id) targetUserId = Number(user_id);
    else if(booking_id) {
      const { rows } = await db.query('SELECT user_id FROM bookings WHERE booking_id = $1', [booking_id]);
      targetUserId = rows[0].user_id;
    }
    else if(service_id) {
      targetUserId = reqUser.user_id;
      req.query.user_id = targetUserId;
    }
    
    if (!req.user || !req.user.dbUser) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    if(reqUser.user_id !== targetUserId) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    return next();
  }
  const checkProfileAccess = async (req, res, next) => {
  
    const user_id = req.params.user_id ?? req.body.user_id;
    const reqUser = req.user.dbUser;
    console.log(user_id)
  
    if(reqUser.role === "admin") {
      return next();
    }
    
    if (!req.user || !req.user.dbUser) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    if(reqUser.user_id !== Number(user_id)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    return next();
  }
  
module.exports = { authenticate, restrictTo, checkBookingAccess, checkProfileAccess, };
