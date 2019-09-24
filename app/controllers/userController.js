const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib')
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const AuthModel = mongoose.model('Auth')

/* Models */
const UserModel = mongoose.model('User')

// Get all user details
let getAllUser = (req, res) => {
    UserModel.find()
        .select('-_id -__v')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller:getAllUser', 10)
                let apiResponse = response.generate(true, 'failed to find user details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('no user found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'no user found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All user detail found', 200, result)
                res.send(apiResponse)
            }
        })
}


let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-_v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'failed to find user details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('no user found', 'User Controller: getSingleUser')
                let apiResponse = response.generate(true, 'no user found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'user detail found', 200, result)
                res.send(apiResponse)
            }
        })
}


let deleteUser = (req, res) => {
    UserModel.findOneAndRemove({ 'userId': req.params.userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: deleteUser', 10)
            let apiResponse = response.generate(true, 'failed to delete user', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('no user found', 'User Controller: deleteUser')
            let apiResponse = response.generate(true, 'no user found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted user successfully', 200, result)
            res.send(apiResponse)
        }

    })
}

let editUser = (req, res) => {
    let options = req.body;
    UserModel.update({ 'userId': req.params.userId }, options).select('-password -__v -_id').exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: editUser', 10)
            let apiResponse = response.generate(true, 'failed to edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('no user found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'no user found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'user detail edited', 200, result)
            res.send(apiResponse)
        }
    })
}

// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email doesnot meet the requiremwnt', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field missing During user creation', 'userController:createUser()', 5)
                let apiResponse = response.generate(true, 'one or more parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController:createUser', 10)
                        let apiResponse = response.generate(true, 'Failed to create user', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            type: req.body.type,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController:createUser', 10)
                                let apiResponse = response.generate(true, 'failed to create new user', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('user cannot be created.user Already present', 'userController:createUser', 4)
                        let apiResponse = response.generate(true, 'user already present with this email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    
    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }


    validateUserInput(req, res)
        .then(createUser)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            delete resolve.password
            let apiresponse = response.generate(false, 'user created', 200, resolve)
            res.send(apiresponse)
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
}
// end user signup function 
// start of login function 
let loginFunction = (req, res) => {
    findUser = () => {
        console.log('find user');
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there")
                console.log('req.body')
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed to retrieve user data', 'UserController:findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No user found', 'userController:findUser()', 7)
                        let apiResponse = response.generate(true, 'No user detail found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('user found', 'userController:findUser()', 10)
                        resolve(userDetails)
                    }
                });
            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");

        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController:validatePassword()', 10)
                    let apiResponse = response.generate(true, 'login failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj._v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info("login failed due to invalid password", 'userController:validatePassword()', 10)
                    let apiResponse = response.generate(true, 'wrong password.login Faied', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }
    let generateToken = (userDetails) => {
        console.log('generate token')
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = reponse.generate(true, 'failed to generate token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController:saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController:saveToken', 10)
                            let apiResponse = response.generate(true, 'failed to generate token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }

                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController:saveToken', 10)
                            let apiResponse = response.generate(true, 'failed to generate token', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })

    }


    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'login successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log('errorhandler')
            console.log(err)
            res.status(err.status)
            res.send(err)
        })
}


// end of the login function 


let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'userController:logout', 10)
            let apiResponse = response.generate(true, `error occured:${err.message}`, 500, null)
            res.send(apiresponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already logged out or invalid userId', 404, null)
            res.send(apiResponse)

        } else {
            let apiResponse = response.generate(false, 'logged out successfully', 200, null)
            res.send(apiResponse)
        }
    })

} // end of the logout function.


module.exports = {

    signUpFunction: signUpFunction,
    getAllUser: getAllUser,
    editUser: editUser,
    deleteUser: deleteUser,
    getSingleUser: getSingleUser,
    loginFunction: loginFunction,
    logout: logout

}// end exports