// Imports.
const Joi = require('joi');

// Models.
const { Template } = require('../../models');

// Req. Auth and Upload middleware.
exports.addTemplate = async (req, res) => {
  try {
    // Initials.
    const { body, files, user } = req;

    // Validate inputs.
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
    });
    const { error } = schema.validate(body);

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Validate data.
    if (!files.img) {
      return res.status(422).send({
        status: 'invalid',
        message: 'You need to pick image to use.',
      });
    }

    // Create new template.
    await Template.create({
      ...body,
      img: files.img[0].filename,
      userId: user.id,
    });

    res.send({
      status: 'success',
      message: 'New template has been created.',
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
exports.getAllTemplates = async (req, res) => {
  try {
    // Get all templates.
    const templates = await Template.findAll({
      attributes: ['id', 'name', 'img'],
    });

    // Refactor.
    const result = templates.map((template) => {
      if (template.dataValues['img']) {
        template.dataValues['img'] =
          process.env.UPLOADS_URL + template.dataValues['img'];
      }
      return template;
    });

    res.send({
      status: 'success',
      message: 'Getting all the templates successfully.',
      data: {
        templates: result,
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

// :id as parameters.
// Req. Auth middleware.
exports.getTemplateById = async (req, res) => {
  try {
    // Initials.
    const { params } = req;

    // Get template.
    const template = await Template.findOne({
      where: { id: params.id },
      attributes: ['id', 'name', 'img'],
    });

    // Validate template.
    if (!template) {
      return res.status(400).send({
        status: 'invalid',
        message: "Template doesn't exist",
      });
    }

    // Refactor.
    if (template.dataValues['img']) {
      template.dataValues['img'] =
        process.env.UPLOADS_URL + template.dataValues['img'];
    }

    res.send({
      status: 'success',
      message: 'Get template successfully.',
      data: {
        template,
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
