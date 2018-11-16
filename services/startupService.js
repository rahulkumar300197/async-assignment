var Promise                                     = require('bluebird');
var _                                           = require('underscore');
var envProperties                               = require('./../properties/envProperties');
var mysqlLib                                    = require('./../database/mysqlLib');

exports.initializeServer                        = initializeServer;

function initializeServer() {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function* () {
      connection          = yield mysqlLib.initializeConnectionPool(envProperties.databaseSettings.mysql);


    })().then((data) => {
      resolve(data);
    }, (error) => {
      console.log("initializeServer==========",error);
      reject(error);
    });
  });
}

