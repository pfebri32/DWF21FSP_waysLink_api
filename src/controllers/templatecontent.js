// Imports.
const Joi = require('joi');

// Models.
const { TemplateContent, Link } = require('../../models');

exports.addContent = async (req, res) => {
  try {
    // Initials.
    const { body, user } = req;
    console.log(body.title);

    // Validate inputs.
    const schema = Joi.object({
      title: Joi.string().required(),
      img: Joi.string(),
      description: Joi.string(),
      templateId: Joi.number().required(),
      links: Joi.array().items(
        Joi.object({
          img: Joi.string(),
          title: Joi.string(),
          link: Joi.string(),
        })
      ),
    });
    const { error } = schema.validate(body);

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    const content = await TemplateContent.create({
      title: body.title,
      img: body.img,
      description: body.description,
      userId: user.id,
      templateId: body.templateId,
      uniqueLink: 'a',
    });

    let bulk = [];
    for (let i = 0; i < body.links.length; i++) {
      bulk.push({
        title: body.links[i].title,
        link: body.links[i].link,
        img: body.links[i].img,
        contentId: content.id,
      });
    }

    await Link.bulkCreate(bulk);

    res.send({
      status: 'success',
      message: 'Content has been created.',
    });
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};

exports.getContent = async (req, res) => {
  try {
    const { params } = req;

    const content = await TemplateContent.findOne({
      include: [
        {
          model: Link,
          as: 'links',
        },
      ],
      where: { id: params.id },
    });

    res.send({
      status: 'success',
      message: 'Get content is success.',
      data: {
        content,
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

exports.getContentsByUserId = async (req, res) => {
  try {
    const { user } = req;

    const contents = await TemplateContent.findAll({
      where: { userId: user.id },
    });

    res.send({
      status: 'success',
      message: 'Get all contents by id are success.',
      data: {
        contents,
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

exports.deleteContentById = async (req, res) => {
  try {
    await TemplateContent.destroy({ where: { id: req.params.id } });
    res.send({
      status: 'success',
      message: 'The content has been deleted.',
    });
  } catch (error) {
    console.log(error);
  }
};
