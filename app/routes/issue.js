const express = require('express');
const router = express.Router();
const issueController = require("./../controllers/issueController");
const notifyController = require("./../controllers/notifyController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const multer = require('./../middlewares/multer');

module.exports.setRouter = (app) => {

  let baseUrl = `${appConfig.apiVersion}/issue`;


  app.post(`${baseUrl}/create`, multer.upload.single('image'), issueController.createIssue);
  /**
  * @api {post} /api/v1/issue/create Create issue
  * @apiVersion 1.0.0
  * @apiGroup issue
  *
  * @apiParam {String} title Title of the issue. (body) (required)
  * @apiParam {String} status Status of the issue. (body) (required)
  * @apiParam {Array} reporter Array containing UserName and UserId of user. (body) (required)
  * @apiParam {String} description Description of issue. (body) (required)
  * @apiParam {Array} assignee Array containing UserName and UserId of user. (body) (required)
  * @apiParam {String} screenshot The Screenshot of issue. (file) (required)
  *
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Issue Created successfully",
  *		"status": 200,
  *		"data":[
  *                {
  *                    "title": "String",
  *                    "createdOn": "Date",
  *                    "status": "String",
  *                    "reporter": Object.type(Array),
  *                    "assignee": Object.type(Array),
  *                    "description": "String",
  *                    "screenshot": "String",
  *                }
  *               ]
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed to create new Issue",
  *   "status": 500,
  *   "data": null
  * }
  */

  app.get(`${baseUrl}/all`, auth.isAuthorized, issueController.getAllIssue);
  /**
* @api {get} /api/v1/issue/all Get all issue
* @apiVersion 1.0.0
* @apiGroup issue
*
* @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
* @apiParam {String} pageIndex The Pageindex the page number. (Send pageIndex as query params)
* @apiParam {String} pageSize The Pagesize for no of results per page. (Send pageSize as query params)
* @apiParam {String} sort The Sort for Sortby and 1 or -1 for sort order. (Send sort as query params)
* 
* @apiSuccessExample {json} Success-Response:
*    
*   {
*		"error": false,
*		"message": "Issue Details found",
*		"count": "Number",
*		"status": 200,
*		"data":[
*                {
*                    "title": "String",
*                    "createdOn": "Date",
*                    "modifiedOn": "Date",
*                    "status": "String",
*                    "reporter": Object.type(Array),
*                    "assignee": Object.type(Array),
*                    "watching": Object.type(Array),
*                    "comments": Object.type(Array),
*                    "description": "String",
*                    "screenshot": "String",
*                    "issueId": "String"
*                },
*               .......
*               ]
*   }
* @apiErrorExample {json} Error-Response:
*
* {
*   "error": true,
*   "message": "Failed To Find Issue Details",
*   "status": 500,
*   "data": null
* }
*/

  app.get(`${baseUrl}/:description/search`, auth.isAuthorized, issueController.searchIssue);
  /**
    * @api {get} /api/v1/issue/:description/search Search issue
    * @apiVersion 1.0.0
    * @apiGroup issue
    *
    * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
    * @apiParam {String} description The String or part of string that is to be find. (params)
    * 
    * @apiSuccessExample {json} Success-Response:
    *    
    *   {
    *		"error": false,
    *		"message": "All Issue Details Found",
    *		"status": 200,
    *		"data":[
    *                {
    *                    "title": "String",
    *                    "createdOn": "Date",
    *                    "modifiedOn": "Date",
    *                    "status": "String",
    *                    "reporter": Object.type(Array),
    *                    "assignee": Object.type(Array),
    *                    "watching": Object.type(Array),
    *                    "comments": Object.type(Array),
    *                    "description": "String",
    *                    "screenshot": "String",
    *                    "issueId": "String"
    *                },
    *             
    *               ]
    *   }
    * @apiErrorExample {json} Error-Response:
    *
    * {
    *   "error": true,
    *   "message": "Failed To Find Issue Details",
    *   "status": 500,
    *   "data": null
    * }
    */


  app.get(`${baseUrl}/:issueId/view`, auth.isAuthorized, issueController.getIssueById);
  /**
* @api {get} /api/v1/issue/:issueId/view Get issue by Id
* @apiVersion 1.0.0
* @apiGroup issue
*
* @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
* @apiParam {String} issueId The issueId of the issue. (params)
* 
* @apiSuccessExample {json} Success-Response:
*    
*   {
*		"error": false,
*		"message": "Issue Details Found",
*		"status": 200,
*		"data":[
*                {
*                    "title": "String",
*                    "createdOn": "Date",
*                    "modifiedOn": "Date",
*                    "status": "String",
*                    "reporter": Object.type(Array),
*                    "assignee": Object.type(Array),
*                    "watching": Object.type(Array),
*                    "comments": Object.type(Array),
*                    "description": "String",
*                    "screenshot": "String",
*                    "issueId": "String"
*                }
*               ]
*   }
* @apiErrorExample {json} Error-Response:
*
* {
*   "error": true,
*   "message": "Failed To Find Issue Details",
*   "status": 500,
*   "data": null
* }
*/


  app.post(`${baseUrl}/:issueId/addComment`, auth.isAuthorized, issueController.addComment);

  /**
  * @api {post} /api/v1/issue/:issueId/addComment Add comment
  * @apiVersion 1.0.0
  * @apiGroup issue
  *
  * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
  * @apiParam {String} issueId The issueId of the issue. (params)
  * @apiParam {Array} comment The Comment array containing UserName, UserId and Comment. (body)
  * 
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Successfully Posted comment",
  *		"status": 200,
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed To Posted comment",
  *   "status": 500,
  *   "data": null
  * }
  */


  app.post(`${baseUrl}/:issueId/addAssignee`, auth.isAuthorized, issueController.addAssignee);

  /**
  * @api {post} /api/v1/issue/:issueId/addAssignee Add assignee
  * @apiVersion 1.0.0
  * @apiGroup issue
  *
  * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
  * @apiParam {String} issueId The issueId of the issue. (params)
  * @apiParam {Array} assignee The Assignee array containing UserName and UserId. (body)
  * 
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Successfully Added Assignee",
  *		"status": 200,
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed to add Assignee",
  *   "status": 500,
  *   "data": null
  * }
  */


  app.post(`${baseUrl}/:issueId/addWatchee`, auth.isAuthorized, issueController.addWatchee);

  /**
  * @api {post} /api/v1/issue/:issueId/addWatchee Add as watching
  * @apiVersion 1.0.0
  * @apiGroup issue
  *
  * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
  * @apiParam {String} issueId The issueId of the issue. (params)
  * @apiParam {Array} watching The Warching array containing UserName and UserId . (body)
  * 
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Successfully Add as Watching",
  *		"status": 200,
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed To Add as Watching",
  *   "status": 500,
  *   "data": null
  * }
  */

  app.post(`${baseUrl}/:issueId/delete`, auth.isAuthorized, issueController.deleteIssue);

  /**
   * @api {post} /api/v1/issue/:issueId/delete Delete issue by Id
   * @apiVersion 1.0.0
   * @apiGroup issue
   *
   * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
   * @apiParam {String} issueId The issueId of the issue. (params)
   * @apiParam {String} previous The name of screenshot to be deleted. (body) (required)
   * 
   * @apiSuccessExample {json} Success-Response:
   *    
   *   {
   *		"error": false,
   *		"message": "Successfully deleted Issue",
   *		"status": 200,
   *		"data":[
   *                {
   *                    "title": "String",
   *                    "createdOn": "Date",
   *                    "modifiedOn": "Date",
   *                    "status": "String",
   *                    "reporter": Object.type(Array),
   *                    "assignee": Object.type(Array),
   *                    "watching": Object.type(Array),
   *                    "comments": Object.type(Array),
   *                    "description": "String",
   *                    "screenshot": "String",
   *                    "issueId": "String"
   *                }
   *               ]
   *   }
   * @apiErrorExample {json} Error-Response:
   *
   * {
   *   "error": true,
   *   "message": "Failed To Delete Issue",
   *   "status": 500,
   *   "data": null
   * }
   */

  app.post(`${baseUrl}/:issueId/edit`, multer.upload.single('image'), issueController.editIssue);

  /**
  * @api {post} /api/v1/issue/:issueId/edit Edit issue
  * @apiVersion 1.0.0
  * @apiGroup issue
  *
  * @apiParam {String} title Title of the issue. (body) (required)
  * @apiParam {String} status Status of the issue. (body) (required)
  * @apiParam {Array} reporter Array containing UserName and UserId of user. (body) (required)
  * @apiParam {String} description Description of issue. (body) (required)
  * @apiParam {Array} assignee Array containing UserName and UserId of user. (body) (required)
  * @apiParam {String} screenshot The Screenshot of issue. (file) (required)
  * @apiParam {String} previous The name of screenshot to be replaced of issue. (body) (required)
  *
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Issue Details Updated",
  *		"status": 200,
  *	
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed To Edit Issue Details",
  *   "status": 500,
  *   "data": null
  * }
  */

  app.get(`${baseUrl}/:userId/notification`, auth.isAuthorized, notifyController.getNotifyById);
  /**
  * @api {get} /api/v1/issue/:userId/notification Get notifications
  * @apiVersion 1.0.0
  * @apiGroup notification
  *
  * @apiParam {String} authToken The authToken for authentication. (Send authToken as query params)
  * @apiParam {String} userId The userId of user. (params) (required)
  *
  * @apiSuccessExample {json} Success-Response:
  *    
  *   {
  *		"error": false,
  *		"message": "Notify Details Found",
  *		"status": 200,
  *		"data":[
  *                {
  *                    "notifyId": "String",
  *                    "createdOn": "Date",
  *                    "seen": "Boolean",
  *                    "message": "String",
  *                    "receiverId": Object.type(Array),
  *                    "receiverName": "String",
  *                    "senderId": "String",
  *                    "senderName": "String"
  *                },
  *               
  *               ]
  *   }
  * @apiErrorExample {json} Error-Response:
  *
  * {
  *   "error": true,
  *   "message": "Failed To Find Notify Details",
  *   "status": 500,
  *   "data": null
  * }
  */

}