'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Template.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'userId',
      });
      Template.hasMany(models.TemplateContent, {
        as: 'contents',
        foreignKey: 'templateId',
      });
    }
  }
  Template.init(
    {
      name: DataTypes.STRING,
      img: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Template',
    }
  );
  return Template;
};
