const bcrypt = require("bcrypt")
const saltRounds = 10


let logger = require('../libs/loggerLib')
let hashpassword = (myPlaintextPassword) => {
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(myPlaintextPassword, salt)
    return hash
}
let comparePassword = (oldPassword, hashpassword, cb) => {
    bcrypt.compare(oldPassword, hashpassword, (err, res) => {
        if (err) {
            logger.err(err.message, 'Comparison Error', 5)
            cb(err, null)

        } else {
            cb(null, res)
        }
    })
}

let comparePasswordSync = (myPlaintextPassword, hash) => {
    return bcrypt.compareSync(myPlaintextPassword, hash)
}

module.exports = {
    hashpassword: hashpassword,
    comparePassword: comparePassword,
    comparePasswordSync: comparePasswordSync
}