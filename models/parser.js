'use strict';
module.exports = function(sequelize, DataTypes) {
  var Parser = sequelize.define('Parser', {
    key: {type: DataTypes.STRING, unique: true},
    value: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Parser;
};