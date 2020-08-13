const { client } = require('../config/redisConnection');

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.log('Error ' + err);
});

async function set(key, value) {
    return new Promise((resolve, reject) => {
        if (!client.ready) {
            resolve();
            return;
        }
        client.set(key, value, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

async function get(key) {
    return new Promise((resolve, reject) => {
        if (!client.ready) {
            resolve();
            return;
        }
        client.get(key, (err, result) => {
            console.log('get from cache');
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

async function del(key) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        if (!client.ready) {
            resolve();
            return;
        }
        client.del(key, (err) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

const redisAsync = { set, get, del };

module.exports = redisAsync;