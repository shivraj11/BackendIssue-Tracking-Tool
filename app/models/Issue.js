/**
 * module dependencies
 */
const mongoose = require('mongoose')

const Schema = mongoose.Schema

let issueSchema = new Schema({

    issueId: { type: String, unique: true, required: true },
    title: { type: String, default: '' },
    status: { type: String, default: '' },
    reporter: [],
    description: { type: String, default: '' },
    screenshot: { type: String, default: '' },
    assignee: [],
    watching: [],
    comments: [],
    createdOn: { type: Date, default: Date.now() },
    modifiedOn: { type: Date, default: Date.now() }

})

mongoose.model('Issue', issueSchema)