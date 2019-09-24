const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('request')
const Auth = mongoose.model('Auth')

const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAuthorized = (req, res, next) => {
    if (req.params.authToken || req.body.authToken || req.query.authToken || req.header('authToken')) {
        Auth.findOne({ authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken }, (err, authDetails) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'AuthorizationMiddleware', 10)
                let apiResponse = responseLib.generate(true, 'failed to Authorized', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(authDetails)) {
                logger.error('No Authorization key is present', 'AuthorizationMiddleware', 10)
                let apiResponse = responseLib.generate(true, 'invalid or expired Authorization key', 404, null)
                res.send(apiResponse)
            } else {
                token.verifyToken(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
                    if (err) {
                        logger.error(err.message, 'Authorization middleware', 10)
                        let apiResponse = responseLib.generate(true, 'failed to authorize', 500, null)
                        res.send(apiResponse)
                    } else {
                        req.user = { userId: decoded.data.userId }
                        next()
                    }
                })
            }
        })

    } else {
        logger.error('Authorizationtoken is missing', 'AuthorizationMiddleware', 5)
        let apiResponse = responseLib.generate(true, 'Authorization token is missing in request', 400, null)
        res.send(apiResponse)
    }
}

module.exports = { isAuthorized: isAuthorized }