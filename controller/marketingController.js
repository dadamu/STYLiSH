const asyncHandler = require('../module/asyncHandler');
const infoModel = require('../models/productInfoModel');
const redisAsync = require('../module/redisAsync');
const campaignModel = require('../models/compaignModel');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const path = require('path');
const { AWSS3, IMG_HOST } = require('../config/config');



let storage = multerS3({
    s3: AWSS3,
    bucket: 'stylish-image',
    acl: 'public-read',
    key: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);
            let destination = 'img/campaign/';
            // set dir for img and let file with extname
            cb(null, destination + raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

const campaignCreate =
    asyncHandler(async (req, res, next) => {
        let productId = req.params.id;
        let check = await infoModel.check(productId);
        if (check === 0) {
            let err = new Error('Info id not Exists');
            err.status = 400;
            next(err);
        }
        else {
            let upload = multer({
                limits: { fileSize: 1024 * 1024 * 5 }, //limit one file 5MB
                storage: storage,
                fileFilter: function (req, file, cb) {
                    let ext = path.extname(file.originalname);
                    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                        let err = new Error('Image Only!');
                        return cb(err, false);
                    }
                    cb(null, true);
                }
            }).single('picture');

            //get main image and other images path obj
            let uploadData = await uploadImage(req, res, upload);
            await campaignModel.create(uploadData);
            redisAsync.del('campaigns');
            res.status(201).json({ status: 201 });
        }
    });

const campaignGet =
    asyncHandler(async (req, res) => {
        let cacheData = await redisAsync.get('campaigns');
        if (!cacheData) {
            let sqlData = await campaignModel.getAll();
            sqlData.forEach((el) => {
                el['picture'] = IMG_HOST + el['picture'];
            });
            let data = { data: sqlData };
            redisAsync.set('campaigns', JSON.stringify(data));
            res.json(data);
            return;
        }
        let campaigns = JSON.parse(cacheData);
        res.json(campaigns);
    });

/*
    upload image to directory
    input: req res multerSetting
    retun: picture_url and id and story
*/
function uploadImage(req, res, upload) {
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(err);
            }
            else {
                let otherInfo = req.body;
                let id = otherInfo['idSelector'];
                let story = otherInfo['story'];
                let file = req.file;
                let pictureUrl = `/img/campaign/${file.key.split('/').pop()}`;

                resolve({ pictureUrl, id, story });
            }
        });
    });
}


module.exports = { campaignCreate, campaignGet, };