const con = require('../config/sqlConnection');
function query(sql, data) {
    return new Promise((resolve, reject) => {
        con.query(sql, data, (err, res) => {
            if (err) {
                console.log(err);
                let errRes = new Error('');
                if (err.errno === 1062) {
                    errRes.message = 'Has Existed!';
                    errRes.status = 403;
                }
                else if (err.errno === 1264) {
                    errRes.message = 'Out of Range!';
                    errRes.status = 403;
                }
                else {
                    errRes.message = err.errno + ' ' + err.message;
                    errRes.status = 500;
                }
                reject(errRes);
            }
            else {
                resolve(res);
            }
        });
    });
}

function beginQuery(pool, sql, data) {
    return new Promise((resolve, reject) => {
        pool.query(sql, data, (err, res) => {
            if(err){
                console.log(err);
                let errRes = new Error('');
                if (err.errno === 1264) {
                    errRes.message = 'Out of Range!';
                    errRes.status = 403;
                }
                else {
                    errRes.message = err.errno + ' ' + err.message;
                    errRes.status = 500;
                }
                reject(errRes);
            }
            else{
                resolve(res);
            }
        });
    });
}

function beginConnect() {
    return new Promise((resolve, reject) => {
        con.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                let errRes = new Error('');
                if (err.errno === 1264) {
                    errRes.message = 'Out of Range!';
                    errRes.status = 403;
                }
                else {
                    errRes.message = err.errno + ' ' + err.message;
                    errRes.status = 500;
                }
                reject(errRes);
            }
            else {
                resolve(connection);
            }
        });
    });
}

function beginRelease(pool) {
    pool.release();
}

function begin(pool) {
    return new Promise((resolve, reject) => {
        pool.beginTransaction(err => {
            if (err) {
                let error = new Error(err.message);
                error.status = 500;
                rollback(pool);
                beginRelease(pool);
                reject(error);
            }
            else {
                resolve({ status: 200 });
            }
        });
    });
}

function commit(pool) {
    pool.commit();
}

function rollback(pool) {
    pool.rollback();
}


module.exports = { query, beginConnect, begin, beginQuery, commit, rollback, beginRelease };

