'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First name required'
        },
        notEmpty:{
          msg: 'Provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Last name required'
        },
        notEmpty:{
          msg: 'Provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already in use',
      },
      validate: {
        notNull: {
          msg: 'Email required'
        },
        isEmail:{
          msg: 'Provide a valid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password required'
        },
        notEmpty:{
          msg: 'Provide a password'
        },
      }
    },
  }, { sequelize });
  User.associate = (models) => {
    User.hasMany(models.Course, {
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        },
    });
  };
    
  return User;
};