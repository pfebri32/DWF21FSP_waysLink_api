// Imports.
const Jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  // Initials.
  let header, token;

  if (
    !(header = req.header('Authorization')) ||
    !(token = header.replace('Bearer ', ''))
  ) {
    return res.status(401).send({
      status: 'failed',
      status: 'Access Denied',
    });
  }

  try {
    const verified = Jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send({
      status: 'failed',
      message: 'Authorization failed.',
    });
  }
};
