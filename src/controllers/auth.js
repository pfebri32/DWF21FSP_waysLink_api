// Imports.
const Joi = require('joi');
const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');

// Models.
const { User } = require('../../models');

exports.login = async (req, res) => {
  try {
    // Initials.
    const { body } = req;

    // Validate inputs.
    const schema = new Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().alphanum().min(6).max(24).required(),
    });
    const { error } = schema.validate(body);

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Validates login.
    const user = await User.findOne({ where: { email: body.email } });

    if (!user) {
      return res.status(401).send({
        status: 'invalid',
        message: 'Your email and password are incorrect.',
      });
    }

    // Validate password.
    const isValid = await Bcrypt.compare(body.password, user.password);

    if (!isValid) {
      return res.status(401).send({
        status: 'invalid',
        message: 'Your email and password are incorrect.',
      });
    }

    // Create token.
    const token = Jwt.sign({ id: user.id }, process.env.SECRET_KEY);

    res.send({
      status: 'success',
      message: 'Login is success.',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};

exports.register = async (req, res) => {
  try {
    // Initials.
    const { body } = req;

    // Validate inputs.
    const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().alphanum().min(6).max(24).required(),
    });
    const { error } = schema.validate(body);

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Validate email existence.
    const user = await User.findOne({ where: { email: body.email } });

    if (user) {
      return res.status(409).send({
        status: 'invalid',
        message: 'This email is already exist.',
      });
    }

    // Create hash.
    const hash = await Bcrypt.hash(body.password, 10);

    // Create new user.
    const newUser = await User.create({
      ...body,
      password: hash,
    });

    // Create token.
    const token = Jwt.sign({ id: newUser.id }, process.env.SECRET_KEY);

    res.send({
      status: 'success',
      message: 'Your account has been created.',
      data: {
        token,
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};

// Req. Authenticated middleware
exports.validate = async (req, res) => {
  try {
    // Initials.
    console.log(req.user);
    const id = parseInt(req.user.id);

    // Validate user.
    const validUser = await User.findOne({
      where: { id },
      attributes: ['name', 'email'],
    });

    if (!validUser) {
      return res.status(401).message({
        status: 'invalid',
        message: "User doesm't exist",
      });
    }

    res.send({
      status: 'success',
      message: 'Your account is valid.',
      data: { user: validUser },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};
