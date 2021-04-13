'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TemplateContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TemplateContent.hasMany(models.Link, {
        as: 'links',
        foreignKey: 'contentId',
      });
      TemplateContent.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'userId',
      });
    }
  }
  TemplateContent.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      img: DataTypes.STRING,
      uniqueLink: DataTypes.STRING,
      templateId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      views: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'TemplateContent',
    }
  );
  return TemplateContent;
};
