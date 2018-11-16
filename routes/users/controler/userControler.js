let Promise = require('bluebird');
let acync = require('acync');
let _ = require('underscore');
let lodash = require('lodash');
let md5 = require('md5');
let userServices = require('../services/userServices');
let commonFunctions = require('../../../utilities/commonFunctions');


exports.userSignUpPromiseContinue                 =            userSignUpPromiseContinue;
exports.userSignUpWaterFall                       =            userSignUpWaterFall;
exports.userSignUpAuto                            =            userSignUpAuto;
exports.userSignUpAcyncAwait                      =            userSignUpAcyncAwait;
exports.promisefyallDemo                          =            promisefyallDemo;




function  userSignUpPromiseContinue(req,res) {
    Promise.coroutine(function* () {
        let userDetailsOptions = { user_name: req.body.user_name };
        let getUserDetails = yield userServices.getUserDetails(userDetailsOptions);

        if (!_.isEmpty(getUserDetails)) {
            return {
                message : "User Already Exist",
                status  : 100
            };
        }

        let userDetails = {
            name        : req.body.name,
            user_name   : req.body.user_name,
            password    : md5(req.body.password)
        };

        var createUser = yield userServices.createUser(userDetails);

        if(!createUser || !createUser.insertId){
            return {
                message : "Something went wrong",
                status  : 100
            };
        } 
        
        var accessToken = commonFunctions.generateAccessToken();        
        yield userServices.createUserSession({user_id: createUser.insertId, access_token: accessToken});

        delete userDetails.password;
        userDetails.access_token = accessToken;

        return {
            message : "Sucess",
            data    : userDetails,
            status  : 200
        };

    })().then((result) => {
        console.log("SIGNUP RESPONCE =>>>>",JSON.stringify(result));
        return res.send({message: result.message, data: result.data||{}, status : result.status});
    }, (error) => {
        console.log("SIGNUP ERR =>>>>",JSON.stringify(error));
        return res.send({message: lodash.isEmpty(error.message) ? "" : error.message, status : 0});
    });
}


function  userSignUpWaterFall(req,res) {
    var name        = req.body.name;
    var user_name   = req.body.user_name;
    var password    = md5(req.body.password);
    var accessToken;
    acync.waterfall([
        function(cb) {
            var sql = "SELECT * FROM tb_users WHERE user_name = ? LIMIT 1";
            connection.query(sql, [user_name], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        },
        function(data,cb) {
            if(!_.isEmpty(data)) {
                var responce = {
                    message : "User Already Exist",
                    status  : 100
                };
                cb(responce,null);
            }
            var sql = "INSERT INTO tb_users (name,user_name,password) VALUES (?,?,?)";
            connection.query(sql, [name,user_name,password], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        },
        function(data,cb) {
            if(!data || !data.insertId){
                var responce = {
                    message : "Something went wrong",
                    status  : 100
                };
                cb(responce,null);
            }
            accessToken = commonFunctions.generateAccessToken();
            var sql = "INSERT INTO tb_user_sessions (access_token,user_id) VALUES (?,?)";
            connection.query(sql, [accessToken,data.insertId], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        },
        function(data,cb) {
            if(!data || !data.insertId){
                var responce = {
                    message : "Something went wrong in creating session",
                    status  : 100
                };
                cb(responce,null);
            }
            var responce = {
                message : "Success",
                data    : {
                    name : name,
                    user_name : user_name,
                    access_token : accessToken
                },
                status  : 200
            };
            cb(null,responce);
        }
    ],function(err,result) {
        if(err) {
            console.log("SIGNUP ERR =>>>>",JSON.stringify(error));
            return res.send({message: lodash.isEmpty(error.message) ? "" : error.message, status : 0});
        }
        console.log("SIGNUP RESPONCE =>>>>",JSON.stringify(result));
        return res.send({message: result.message, data: result.data||{}, status : result.status});
    });
}


async function  userSignUpAcyncAwait(req,res) {
    try {
        let userDetailsOptions = { user_name: req.body.user_name };
        let getUserDetails = await userServices.getUserDetails(userDetailsOptions);

        if (!_.isEmpty(getUserDetails)) {
            throw {
                message : "User Already Exist",
                status  : 100
            };
        }

        let userDetails = {
            name        : req.body.name,
            user_name   : req.body.user_name,
            password    : md5(req.body.password)
        };

        var createUser = await userServices.createUser(userDetails);

        if(!createUser || !createUser.insertId){
            throw {
                message : "Something went wrong",
                status  : 100
            };
        } 
        
        var accessToken = commonFunctions.generateAccessToken();        
        await userServices.createUserSession({user_id: createUser.insertId, access_token: accessToken});

        delete userDetails.password;
        userDetails.access_token = accessToken;

        var responce = {
            message : "Sucess",
            data    : userDetails,
            status  : 200
        };
        console.log("SIGNUP RESPONCE =>>>>",JSON.stringify(responce));
        return res.send(responce);

    } catch(error) {
        console.log("SIGNUP ERR =>>>>",JSON.stringify(error));
        return res.send({message: lodash.isEmpty(error.message) ? "" : error.message, status : 0});
    };
}

function  userSignUpAuto(req,res) {
    var name        = req.body.name;
    var user_name   = req.body.user_name;
    var password    = md5(req.body.password);
    var accessToken;
    acync.auto({
        checkUser : function(cb) {
            var sql = "SELECT * FROM tb_users WHERE user_name = ? LIMIT 1";
            connection.query(sql, [user_name], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        },
        createUser : ['checkUser',function(data,cb) {
            if(!_.isEmpty(data)) {
                var responce = {
                    message : "User Already Exist",
                    status  : 100
                };
                cb(responce,null);
            }
            var sql = "INSERT INTO tb_users (name,user_name,password) VALUES (?,?,?)";
            connection.query(sql, [name,user_name,password], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        }],
        createSession : ['createUser',function(data,cb) {
            if(!data || !data.insertId){
                var responce = {
                    message : "Something went wrong",
                    status  : 100
                };
                cb(responce,null);
            }
            accessToken = commonFunctions.generateAccessToken();
            var sql = "INSERT INTO tb_user_sessions (access_token,user_id) VALUES (?,?)";
            connection.query(sql, [accessToken,data.insertId], function (sqlError, sqlResult) {
                if (sqlError) {
                    cb(err,null);
                }
                cb(null,sqlResult);
            });
        }],
        sendUserData: ['createSession',function(data,cb) {
            if(!data || !data.insertId){
                var responce = {
                    message : "Something went wrong in creating session",
                    status  : 100
                };
                cb(responce,null);
            }
            var responce = {
                message : "Success",
                data    : {
                    name : name,
                    user_name : user_name,
                    access_token : accessToken
                },
                status  : 200
            };
            cb(null,responce);
        }]
    },function(err,result) {
        if(err) {
            console.log("SIGNUP ERR =>>>>",JSON.stringify(error));
            return res.send({message: lodash.isEmpty(error.message) ? "" : error.message, status : 0});
        }
        console.log("SIGNUP RESPONCE =>>>>",JSON.stringify(result));
        return res.send({message: result.message, data: result.data||{}, status : result.status});
    });
}


function promisefyallDemo (req,res) {
    var userId = req.query.user_id;
    var userName  = req.query.user_name;
    var promises = [];

    promises.push(userServices.getUserDetails({user_name : userName}));   
    promises.push(userServices.getAllMessages({user_id: userId}));   // This is in my chat app assigment
    //Promise.all is work as async.parallel() with much clear code
    Promise.all(promises).then((result)=> {
        var responce = {
            user_details : result[0],
            messages : result[1]
        }
        res.send(responce);
    }, (error)=> {
        res.send(error);
    });
}
