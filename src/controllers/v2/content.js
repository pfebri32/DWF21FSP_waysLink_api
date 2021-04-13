// Imports.
const Joi = require('joi');

// Models.
const { TemplateContent, Link } = require('../../../models');

// Get from Stacks.
function numToSSColumn(num) {
  var s = '';
  var t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = ((num - t) / 26) | 0;
  }
  return s || undefined;
}

// Req. Auth and Upload middlewares.
exports.addContent = async (req, res) => {
  try {
    // Initials.
    const { body, files, user } = req;

    // Validate inputs.
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow(''),
      templateId: Joi.number().required(),
      links: Joi.array().items(
        Joi.object({
          title: Joi.string().allow(''),
          link: Joi.string().allow(''),
        })
      ),
    });

    const links = JSON.parse(body.links);

    const { error } = schema.validate({
      title: body.title,
      description: body.description,
      templateId: body.templateId,
      links: links,
    });

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Create content.
    const contentCreateObj = {
      title: body.title,
      img: '',
      description: body.description,
      userId: user.id,
      templateId: parseInt(body.templateId),
      uniqueLink: 'empty',
    };

    if (files.img) {
      contentCreateObj.img = files.img[0].filename;
    }

    const content = await TemplateContent.create(contentCreateObj);

    // Create links.
    for (let i = 0; i < links.length; i++) {
      links[i].contentId = content.id;
    }

    if (links.length > 1) {
      body.imgIndex.map((index, i) => {
        links[parseInt(index)].img = files.imgLinks[i].filename;
      });
    } else if (files.imgLinks) {
      links[0].img = files.imgLinks[0].filename;
    }

    await Link.bulkCreate(links);

    // Generate unique link.
    let uniqueLink = numToSSColumn(content.id + (26 * 26 + 26));
    uniqueLink = uniqueLink.toLowerCase();
    await TemplateContent.update({ uniqueLink }, { where: { id: content.id } });

    res.send({
      status: 'success',
      message: 'Content has been created.',
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
exports.getContentsSelf = async (req, res) => {
  try {
    // Initials.
    const { user, query } = req;
    const option = {
      where: { userId: user.id },
    };

    if (query.limit) {
      option.limit = parseInt(query.limit);
      if (query.page) {
        option.offset = (parseInt(query.page) - 1) * parseInt(query.limit);
      }
    }

    // Get all contents.
    const contents = await TemplateContent.findAndCountAll(option);

    // Refactor.
    for (let i = 0; i < contents.rows.length; i++) {
      if (contents.rows[i].dataValues['img']) {
        contents.rows[i].dataValues['img'] =
          process.env.UPLOADS_URL + contents.rows[i].dataValues['img'];
      }
    }

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

// Req. Auth middleware.
exports.deleteContentById = async (req, res) => {
  try {
    // Initials.
    const { user, params } = req;
    const { id } = params;

    // Validate owner.
    const content = await TemplateContent.findOne({ where: { id } });

    if (content.userId !== user.id) {
      return res.status(401).send({
        status: 'invalid',
        message: "You don't have right to delete this.",
      });
    }

    // Delete content.
    await TemplateContent.destroy({
      where: { id },
    });

    res.send({
      status: 'success',
      message: 'The content has been deleted.',
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
exports.updateContentById = async (req, res) => {
  try {
    // Initials.
    const { user, body, files } = req;
    const { id } = req.params;

    // Validate inputs.
    const schema = Joi.object({
      isChange: Joi.boolean(),
      isImageChange: Joi.boolean(),
      title: Joi.string().required(),
      description: Joi.string().allow(''),
      links: Joi.array().items(
        Joi.object({
          id: Joi.number(),
          isChange: Joi.boolean(),
          isImageChange: Joi.boolean(),
          isNew: Joi.boolean(),
          title: Joi.string().allow(''),
          link: Joi.string().allow(''),
        })
      ),
    });

    const links = JSON.parse(body.links);

    const { error } = schema.validate({
      isChange: body.isChange,
      isImageChange: body.isImageChange,
      title: body.title,
      description: body.description,
      links: links,
    });

    if (error) {
      return res.status(422).send({
        status: 'invalid',
        message: error.details[0].message,
      });
    }

    // Validate owner.
    const content = await TemplateContent.findOne({ where: { id } });

    if (content.userId !== user.id) {
      return res.status(401).send({
        status: 'invalid',
        message: "You don't have right to update this.",
      });
    }

    // Update content.
    if (body.isChange) {
      const contentUpdateObj = {
        title: body.title,
        img: content.img,
        description: body.description,
      };

      if (files.img && body.isImageChange) {
        contentUpdateObj.img = files.img[0].filename;
      }

      await TemplateContent.update(contentUpdateObj, { where: { id } });
    }

    // Update links.
    if (links.length > 1) {
      if (Array.isArray(body.imgIndex)) {
        body.imgIndex.map((index, i) => {
          links[parseInt(index)].img = files.imgLinks[i].filename;
        });
      }
    } else if (files.imgLinks) {
      links[0].img = files.imgLinks[0].filename;
    }

    for (let i = 0; i < links.length; i++) {
      console.log(links[i]);
      if (links[i].isChange) {
        await Link.update(
          {
            title: links[i].title,
            link: links[i].link,
            img: links[i].img,
          },
          {
            where: { id: links[i].id },
          }
        );
      }
    }

    res.send({
      status: 'success',
      message: 'The content has been deleted.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};

exports.getContentByLink = async (req, res) => {
  try {
    // Initials.
    const { params } = req;

    // Get content by link.
    const content = await TemplateContent.findOne({
      include: [
        {
          model: Link,
          as: 'links',
          attributes: ['title', 'link', 'img'],
        },
      ],
      where: { uniqueLink: params.link },
      attributes: ['title', 'description', 'img', 'id', 'views', 'templateId'],
    });

    if (!content) {
      return res.status(400).send({
        status: 'invalid',
        message: "This content doesn't exist.",
      });
    }

    // Increase view.
    await TemplateContent.update(
      { views: content.views + 1 },
      {
        where: { id: content.id },
      }
    );

    // Refactor.
    if (content.dataValues['img']) {
      content.dataValues['img'] =
        process.env.UPLOADS_URL + content.dataValues['img'];
    }

    for (let i = 0; i < content.links.length; i++) {
      if (content.links[i].dataValues['img']) {
        content.links[i].dataValues['img'] =
          process.env.UPLOADS_URL + content.links[i].dataValues['img'];
      }
    }

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

exports.getContentById = async (req, res) => {
  try {
    // Initials.
    const { id } = req.params;

    // Get content by id.
    const content = await TemplateContent.findOne({
      include: [
        {
          model: Link,
          as: 'links',
          attributes: ['id', 'title', 'link', 'img'],
        },
      ],
      where: { id },
      attributes: ['title', 'description', 'img', 'id', 'views', 'templateId'],
    });

    if (!content) {
      return res.status(400).send({
        status: 'invalid',
        message: "This content doesn't exist.",
      });
    }

    // Refactor.
    if (content.dataValues['img']) {
      content.dataValues['img'] =
        process.env.UPLOADS_URL + content.dataValues['img'];
    }

    for (let i = 0; i < content.links.length; i++) {
      if (content.links[i].dataValues['img']) {
        content.links[i].dataValues['img'] =
          process.env.UPLOADS_URL + content.links[i].dataValues['img'];
      }
    }

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
