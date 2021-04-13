'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TemplateContents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      img: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      uniqueLink: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      templateId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TemplateContents');
  },
};
