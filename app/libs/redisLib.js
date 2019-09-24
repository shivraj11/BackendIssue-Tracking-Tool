const check = require('./checkLib')
const redis = require('redis')
let client = redis.createClient({
    port: 12894,
    host: 'redis-12894.c12.us-east-1-4.ec2.cloud.redislabs.com',
    password: '6tzBkMSHIPxFGD997Z0174PDvC3KB5b9'

})

client.on('connect', () => {
    console.log('redis connection successfully opened')

})
let getAllUsersInAHash = (hashName, callback) => {
    client.HGETALL(hashName, (err, result) => {
        if (err) {
            console.log(err)
            callback(err, null)
        }
        else if (check.isEmpty(result)) {
            console.log('Oline user list is empty')
            console.log(result)

            callback(null, {})

        } else {
            console.log(result)
            callback(null, result)
        }
    })
} // end get all users in hash

// function to set new online user
let setANewOnlineUserInHash = (hashName, key, value, callback) => {
    client.HMSET(hashName, [
        key, value
    ], (err, result) => {
        if (err) {
            console.log(err)
            callback(err, null)
        } else {
            console.log('user has been set in the hash map')
            console.log(result)
            callback(null, result)
        }
    })
}

let deleteUserFromHash = (hashName, key) => {
    client.HDEL(hashName, key)
    return true;
}


module.exports = {
    getAllUsersInAHash: getAllUsersInAHash,
    setANewOnlineUserInHash: setANewOnlineUserInHash,
    deleteUserFromHash: deleteUserFromHash
}