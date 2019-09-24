const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser)
    /**
	* @api {post} /api/v1/users/view/all View all users
	* @apiVersion 1.0.0
    * @apiGroup users
	*
	* @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
	*
	* @apiSuccessExample {json} Success-Response:
	*    
	*   {
	*		"error": false,
	*		"message": "All User Details Found",
	*		"status": 200,
	*		"data": [
    *                  {
	*                        "createdOn": "Date",
    *                        "email": "String",
    *                        "lastName": "String",
    *                        "firstName": "String",
    *                        "type": "String",
    *                        "userId": "String",
	*                  }
	*                ]
	*   }
	*
	* @apiErrorExample {json} Error-Response:
	*
	* {
	*   "error": true,
	*   "message": "Failed To Find User Details",
	*   "status": 500,
	*   "data": null
	* }
	*/


    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser)
    /**
     * @api {get} /api/v1/users/:userId/details User detail
     * @apiGroup users
     * @apiVersion  1.0.0
     *
     * @apiParam {string} authToken The authToken for authentication. (Send authToken as query params)
     * @apiParam {string} userId User Id of the user. (params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *     {
     *        "error": false,
     *        "message": "User Details Found",
     *        "status": 200,
     *        "data": {
     *                 "createdOn": "Date",
     *                 "email": "String",
     *                 "lastName": "String",
     *                 "firstName": "String",
     *                 "type": "String",
     *                 "userId": "String"
     *        }
     *    }
     * @apiErrorExample {json} Error-Response:
     *
     * {
     *   "error": true,
     *   "message": "Failed To Find User Details",
     *   "status": 500,
     *   "data": null
     * }
     */
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
    * @api {post} /api/v1/users/signup Signup
    * @apiGroup users
    * @apiVersion  1.0.0
    *
    * @apiParam {string} email Email of the user. (body params) (required)
    * @apiParam {string} password password of the user. (body params) (required)
    * @apiParam {string} firstName First Name of the user. (body params) (required)
    * @apiParam {string} lastName Last Name of the user. (body params) (required)
    * @apiParam {string} type Signup type of the user. (body params) (required)
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
    *     {
    *        "error": false,
    *        "message": "User created",
    *        "status": 200,
    *        "data": {
    *           "authToken": "String",
    *            "userDetails": {
    *            "createdOn":"Date",    
    *            "mobileNumber": "String",
    *            "email": "String",
    *            "lastName": "String",
    *            "firstName": "String",
    *            "userId": "String"
    *       }
    * 
    *    }
    * @apiErrorExample {json} Error-Response:
	*
	* {
	*   "error": true,
	*   "message": "Failed To Create User",
	*   "status": 500,
	*   "data": null
	* }
    */


    app.post(`${baseUrl}/login`, userController.loginFunction);
    /**
	* @api {post} /api/v1/users/login Login
    * @apiVersion 1.0.0
    * @apiGroup users
	*
	* @apiParam {string} email email of the user. (body params) (required)
    * @apiParam {string} password password of the user. (body params) (required)
    *
	* @apiSuccessExample {json} Success-Response:
	*    
	*   {
	*		"error": false,
	*		"message": "Login Successful",
	*		"status": 200,
	*		"data":  {
    *                "authToken": "String",
    *                "userDetails": {
    *                    "email": "String",
    *                    "type": "String",
    *                    "lastName": "String",
    *                    "firstName": "String",
    *                    "userId": "String",
    *                }
	*   }
	*
	* @apiErrorExample {json} Error-Response:
	*
	* {
	*   "error": true,
	*   "message": "Error in Login",
	*   "status": 500,
	*   "data": null
	* }
	*/

    app.put(`${baseUrl}/:userId/edit`, auth.isAuthorized, userController.editUser)
    /**
   * @api {put} /api/v1/users/:userId/edit Edit
   * @apiGroup users
   * @apiVersion  1.0.0
   *
   * @apiParam {string} email Email of the user. (body params) (required)
   * @apiParam {string} firstName First Name of the user. (body params) (required)
   * @apiParam {string} lastName Last Name of the user. (body params) (required)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
   *     {
   *        "error": false,
   *        "message": "User details edited",
   *        "status": 200,
   *        "data": {
   *           "authToken": "String",
   *            "userDetails": {
   *            "createdOn":"Date",    
   *            "type": "String",
   *            "email": "String",
   *            "lastName": "String",
   *            "firstName": "String",
   *            "userId": "String"
   *       }
   * 
   *    }
   * @apiErrorExample {json} Error-Response:
   *
   * {
   *   "error": true,
   *   "message": "Failed To edit user details",
   *   "status": 500,
   *   "data": null
   * }
   */
    app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUser)
    /**
  * @api {post} /api/v1/users/:userId/delete Delete
  * @apiGroup users
  * @apiVersion  1.0.0
  *
  * @apiParam {string} authToken The authToken for authentication. (Send authToken as query params)
  * @apiParam {string} userId User Id of the user. (params) (required)
  *
  * @apiSuccess {object} myResponse shows error status, message, http status code, result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *     {
  *        "error": false,
  *        "message": "Deleted the user successfully",
  *        "status": 200,
  *        "data":{
  *                 "createdOn":"Date",    
  *                 "type": "String",
  *                 "email": "String",
  *                 "lastName": "String",
  *                 "firstName": "String",
  *                 "userId": "String"
  *               }
  *      }
  * 
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed To delete user",
  *   "status": 500,
  *   "data": null
  * }
  */
    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout)
    /**
     * @api {post} /api/v1/users/logout Logout
     * @apiGroup users
     * @apiVersion  1.0.0
     *
     * @apiParam {string} authToken The authToken for authentication. (Send authToken as query params)
     * @apiParam {string} userId User Id of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *     {
     *        "error": false,
     *        "message": "Logged Out Successfully",
     *        "status": 200,
     *        "data": null
     *     }
     * 
     * @apiErrorExample {json} Error-Response:
     *
     * {
     *   "error": true,
     *   "message": "error occured",
     *   "status": 500,
     *   "data": null
     * }
     */
}
