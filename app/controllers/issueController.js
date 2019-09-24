const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const fs = require("fs");

/* Models */
const IssueModel = mongoose.model('Issue');


/* Get all Issue Details */
let getAllIssue = (req, res) => {

    IssueModel.find()
        .count((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'IssueController: getAllIssue', 10)
                let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Issue Found', 'IssueController: getAllIssue')
                let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                res.send(apiResponse)
            } else {

                let count = result
                let pageNumber = parseInt(req.query.pageIndex)
                let nPerPage = parseInt(req.query.pageSize)
                let key = req.query.sort.split('.')[0]
                let order = parseInt(req.query.sort.split('.')[1])

                IssueModel.find()
                    .select(' -__v -_id')
                    .sort({ [key]: order })
                    .skip(pageNumber > 0 ? ((pageNumber) * nPerPage) : 0)
                    .limit(nPerPage)
                    .lean()
                    .exec((err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'IssueController: getAllIssue', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                            res.send(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No Issue Found', 'IssueController: getAllIssue')
                            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                            res.send(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result);
                            apiResponse.count = count
                            res.send(apiResponse);
                        }
                    })
            }
        })
}// end get all Issues



let getIssueById = (req, res) => {
    IssueModel.findOne({ 'issueId': req.params.issueId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'IssueController: getSingleIssue', 10)
                let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Issue Found', 'IssueController:getSingleIssue')
                let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Issue Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single Issue


let createIssue = (req, res) => {

    let assigneeArray = JSON.parse(req.body.assignee)
    let reporterArray = JSON.parse(req.body.reporter)


    if (req.file) {

        let fileName = req.file.path.split('\\')[1]
        let newIssue = new IssueModel({
            issueId: shortid.generate(),
            title: req.body.title,
            status: req.body.status,
            reporter: reporterArray,
            description: req.body.description,
            assignee: assigneeArray,
            screenshot: req.file.filename,
            createdOn: time.now()
        })


        newIssue.save((err, newIssue) => {
            if (err) {
                //  console.log(err)
                logger.error(err.message, 'IssueController: createIssue', 10)
                let apiResponse = response.generate(true, 'Failed to create new Issue', 500, null)
                res.send(apiResponse)
            } else {
                let newIssueObj = newIssue.toObject();
                let apiResponse = response.generate(false, 'Issue Created successfully', 200, newIssueObj)
                res.send(apiResponse)
            }
        })

    } else {

        let apiResponse = response.generate(true, 'Please make sure you have selected an Image', 500, null)
        res.send(apiResponse)

    }

}
// end create Issue function


// search Issue
let searchIssue = (req, res) => {
    IssueModel.count().exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'IssueController: getAllIssue', 10)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else {
            let count = result
            let text = req.params.description
            regex = new RegExp(text);

            IssueModel.find({ $or: [{ "description": { $regex: regex, $options: 'i' } }, { "title": { $regex: regex, $options: 'i' } }] })
                .select(' -__v -_id')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'IssueController: getAllIssue', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                        res.send(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No Issue Found', 'IssueController: getAllIssue')
                        let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                        res.send(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'All Issue Details Found', 200, result);
                        apiResponse.count = count
                        res.send(apiResponse);
                    }
                })
        }
    })


}//end of get all


/* edit single Issue details */
let editIssue = (req, res) => {
    req.body.assignee = JSON.parse(req.body.assignee)
    req.body.reporter = JSON.parse(req.body.reporter)
    if (req.file) {
        fs.unlinkSync('./uploads/' + req.body.previous);
        let options = req.body;
        options.screenshot = req.file.filename

        IssueModel.update({ 'issueId': req.params.issueId }, options)
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    if (err.code === 11000) {
                        let apiResponse = response.generate(true, 'Issue should be unique', 400, null)
                        res.send(apiResponse)

                    } else {

                        logger.error(err.message, 'IssueController: getSingleIssue', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                        res.send(apiResponse)

                    }
                } else if (check.isEmpty(result)) {
                    logger.info('No Issue Found', 'IssueController:getSingleIssue')
                    let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Issue Details Updated', 200, result)
                    res.send(apiResponse)
                }
            })



    } else {

        let options = req.body;
        options.screenshot = `${req.body.previous}`;

        IssueModel.update({ 'issueId': req.params.issueId }, options)
            .select('-__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    if (err.code === 11000) {
                        let apiResponse = response.generate(true, 'Issue should be unique', 400, null)
                        res.send(apiResponse)

                    } else {

                        logger.error(err.message, 'IssueController: getSingleIssue', 10)
                        let apiResponse = response.generate(true, 'Failed To Edit Issue Details', 500, null)
                        res.send(apiResponse)

                    }
                } else if (check.isEmpty(result)) {
                    logger.info('No Issue Found', 'IssueController:getSingleIssue')
                    let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Issue Details Updated', 200, result)
                    res.send(apiResponse)
                }
            })
    }
}// end get single Issue


// Pushing COmments to comment array
let addComment = (req, res) => {
    req.body.comment = JSON.parse(req.body.comment)

    let options = { $push: { comments: req.body.comment } }
    IssueModel.update({ 'issueId': req.params.issueId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'issueController: Database error', 10)
            let apiResponse = response.generate(true, 'Failed To Posted comment', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Successfully Posted comment', 200, null)
            res.send(apiResponse)
        }
    });// end issue model update

}


// Adding Assignee
let addAssignee = (req, res) => {
    req.body.assignee = JSON.parse(req.body.assignee)

    let options = { $set: { assignee: req.body.assignee } }
    IssueModel.update({ 'issueId': req.params.issueId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'issueController: Database error', 10)
            let apiResponse = response.generate(true, 'Failed to add Assignee', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Successfully Added Assignee', 200, null)
            res.send(apiResponse)
        }
    });// end issue model update

}


// Pushing COmments to comment array
let addWatchee = (req, res) => {
    req.body.watching = JSON.parse(req.body.watching)

    let options = { $push: { watching: req.body.watching } }
    IssueModel.update({ 'issueId': req.params.issueId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'issueController: Database error', 10)
            let apiResponse = response.generate(true, 'Failed To Add as Watching', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Successfully Add as Watching', 200, result)
            res.send(apiResponse)
        }
    });// end issue model update

}

let deleteIssue = (req, res) => {

    IssueModel.findOneAndRemove({ 'issueId': req.params.issueId }).select(' -__v -_id -password').exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'IssueController: deleteIssue', 10)
            let apiResponse = response.generate(true, 'Failed To delete Issue', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Issue Found', 'IssueController: deleteIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            req.body.previous = req.body.previous.split('/uploads/')[1]
            fs.unlinkSync('./uploads/' + req.body.previous);

            let apiResponse = response.generate(false, 'Deleted the Issue successfully', 200, result)
            res.send(apiResponse)
        }
    });// end Issue model find and remove


}// end delete Issue



module.exports = {
    getAllIssue: getAllIssue,
    getIssueById: getIssueById,
    createIssue: createIssue,
    searchIssue: searchIssue,
    editIssue: editIssue,
    addComment: addComment,
    addAssignee: addAssignee,
    addWatchee: addWatchee,
    deleteIssue: deleteIssue
}