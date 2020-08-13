const { IMG_HOST, KEY, DEFALTPWD } = require("../config/config");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const https = require('https');
const userModel = require('../models/userModel');
const regex = require('../module/regex');
let asyncHandler = require("../module/asyncHandler");

let Check = Object.prototype.hasOwnProperty;
let expiringTime = 3600;
const signIn =
    asyncHandler(async (req, res, next) => {
        let user = req.body;
        let { provider } = user;
        let emailCheck = Check.call(user, "email") && regex.emailRegex.test(user["email"]);
        let passwordCheck = Check.call(user, "password") && regex.passRegex.test(user["password"]);
        //check form sign in data
        if (provider === "native" && emailCheck && passwordCheck) {
            let data = await nativeSignIn(user);
            if (data["err"]) {
                next(data["err"]);
            }
            else {
                res.cookie('access_token', data["access_token"]);
                res.json({ data });
            }
        }
        else if (provider === "facebook") {
            let data = await fbSignIn(user);
            res.cookie('access_token', data["access_token"]);
            res.json({ data });
        }
        else {
            let err = new Error("Invalid Input");
            err.status = 400;
            next(err);
        }
    });

const nativeSignIn = async (user) => {
    let select = await userModel.get(user['email']);
    //check password exist
    if (user["password"])
        user["password"] = cryptoPassword(user.password);
    else
        user["password"] = "";
    //check password correct
    if (select.length > 0 && user["password"] === select[0].password) {
        //update user from select
        user = select[0];
        let playload = playloadJWT(user);
        delete user["password"];
        //set access response
        let access_token = jwt.sign(playload, KEY);
        let access_expired = expiringTime;

        let data = { access_token, access_expired, user };
        return data;
    }
    else {
        let err = new Error("Wrong Email or Password!");
        err.status = 400;
        return { err };
    }
};


const fbSignIn = async (user) => {
    let token = user["access_token"];
    let provider = user["provider"];
    //update user from fb
    let fBData = await getFbInfo(token);
    user = JSON.parse(fBData);
    if (user["error"]) {
        let error = new Error(user["error"]["message"]);
        error.status = 400;
        return { error };
    }
    user["picture"] = user["picture"]["data"]["url"];
    user["provider"] = provider;
    let email = user["email"];
    let getUser = await userModel.get(email);
    if (getUser.length === 0) {
        let newUser = user;
        delete newUser["id"];
        newUser["password"] = cryptoPassword(DEFALTPWD);
        let insert = await userModel.create(newUser);
        user["id"] = insert.insertId;
    }
    else {
        user["id"] = getUser[0].id
    }

    //jwt token encrypt set
    let playload = playloadJWT(user);
    let access_token = jwt.sign(playload, KEY);
    let access_expired = expiringTime;

    return { access_token, access_expired, user };
};

const signUp =
    asyncHandler(async (req, res, next) => {
        let { password } = req.body;
        let user = req.body;
        let nameCheck = Check.call(user, "name") && regex.nameRegex.test(user["name"]);
        let emailCheck = Check.call(user, "email") && regex.emailRegex.test(user["email"]);
        let passCheck = Check.call(user, "password") && regex.passRegex.test(user["password"]);
        //emailRule
        // eslint-disable-next-line no-useless-escape
        if (nameCheck && emailCheck && passCheck) {

            user["password"] = cryptoPassword(password);
            //set user info
            user["picture"] = "/img/profiles/default.jpg";
            user["provider"] = "native";
            //input sql
            let insert = await userModel.create(user);

            user["picture"] = IMG_HOST + "/img/profiles/default.jpg";
            user["id"] = insert.insertId;
            delete user["password"];
            user["expired"] = Date.now() + expiringTime * 1000;

            //jwt token encrypt set
            let playload = playloadJWT(user);
            let access_token = jwt.sign(playload, KEY);

            delete user["expired"];
            let access_expired = expiringTime;
            let data = { access_token, access_expired, user };
            res.cookie('access_token', access_token);
            res.json({ data });
        }
        else {
            let err = new Error("Invalid Input");
            err.status = 400;
            next(err);
        }
    });

const profileGet =
    asyncHandler(async (req, res, next) => {
        let headers = req.headers;
        if (Object.prototype.hasOwnProperty.call(headers, "authorization")) {
            let token = headers["authorization"].split(' ')[1];
            try {
                //decoded it has name email provider picture
                let data = jwt.verify(token, KEY);
                //check isexpired
                let expiredErr = checkExpired(data);
                if (expiredErr) {
                    next(expiredErr);
                }
                else {
                    //delete key no use
                    delete data['iat'];
                    delete data['expired'];
                    res.json({ data });
                }
            }
            catch (error) {
                //decoded failed
                let err = new Error("Invalid Access!");
                err.status = 403;
                next(err);
            }
        }
        else {
            //no input
            let err = new Error("No Sign In!");
            err.status = 400;
            next(err);
        }
    });


/*
    encrypt password
    input : password string
    return : encrypt pass string
*/
function cryptoPassword(password) {
    let hashPassword = crypto.createHash('sha1');
    hashPassword.update(password);
    return hashPassword.digest('hex');
}

/*
    generate playload to JWT
    input : user
    return : playload obj
*/
function playloadJWT(user) {
    return {
        id: user["id"],
        name: user["name"],
        email: user["email"],
        provider: user["provider"],
        picture: user["picture"],
        expired: Date.now() + expiringTime * 1000
    };
}

function checkExpired(data) {
    let now = Date.now();
    if (now > data.expired) {
        let err = new Error("Expired");
        err.status = 401;
        return err;
    }
    return false;
}

/*
    input : fb access token
    return : fb profile obj with name, email
*/
function getFbInfo(token) {
    let endpoint = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + token;
    return new Promise((resolve, reject) => {
        https.get(endpoint, (res) => {
            res.on('data', (data) => {
                resolve(data);
            });
        }).on('error', () => {
            let err = new Error("Invalid Access");
            err.status(400);
            reject(err);
        });
    });
}

module.exports = { signIn, signUp, profileGet };