var express = require('express');
var userValidator = require('./validator/userValidator');
var userControler = require('./controler/userControler');
var router = express.Router();


router.post('/signup_waterfall',userValidator.userSignup, userControler.userSignUpWaterFall);
router.post('/signup_auto',userValidator.userSignup, userControler.userSignUpAuto);
router.post('/signup_promise_continue',userValidator.userSignup, userControler.userSignUpPromiseContinue);
router.post('/signup_async_await',userValidator.userSignup, userControler.userSignUpAcyncAwait);
router.get('/promisefyall_demo', userControler.promisefyallDemo);


module.exports = router;
