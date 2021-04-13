// Imports.
const Joi = require('joi');

// Models.
const { User } = require('../../models');

// Req. Auth middleware.
exports.updateSelf = async (req, res) => {
  try {
    // Initials.
    const { body, user } = req;

    // Validate inputs.
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
    });
    const { error } = schema.validate(body);

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Update user.
    await User.update(body, {
      where: { id: user.id },
      fields: ['name'],
    });

    res.send({
      status: 'success',
      message: 'Your account has been updated.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};

// Req. Auth middleware.
exports.deleteSelf = async (req, res) => {
  try {
    // Initials.
    const { id } = req.user;

    // Delete user.
    await User.destroy({ where: { id } });

    res.send({
      status: 'success',
      message: 'Your account has been deleted.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};
