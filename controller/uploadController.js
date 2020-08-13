const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const { AWSS3 } = require('../config/config');


const infoModel = require("../models/productInfoModel")
const asyncHandler = require("../module/asyncHandler");
const imageModel = require("../models/imageModel");

const imageCreate = asyncHandler(async (req, res, next) => {
    let productId = req.params.id;
    let check = await infoModel.check(productId);
    if (check === 0) {
        let err = new Error("Info id not Exists");
        err.status = 400;
        next(err);
    }
    else {
        let storage = storageSet(AWSS3, productId);
        //set upload limits
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
        }).fields([{ name: 'main_image' }, { name: 'other_images' }]);

        //get main image and other images path obj
        let uploadData = await uploadImages(req, res, upload);

        //update main image to product_info where id
        let update = infoModel.updateImage( [uploadData.mainImage, productId]);

        //upload all otherImages to image table
        let insert = imageModel.create( { otherImages: uploadData.otherImages, productId });

        await Promise.all([update, insert]);
        
        res.status(201).json({ status: 201 });
    }
});


/*
    upload images
    input : req, res, multer upload
    return : main image and other images url
*/
function uploadImages(req, res, upload) {
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(err);
            }
            else {
                let files = req.files;
                let mainImage = `/img/product/${req.params.id}/${files["main_image"][0].key.split('/').pop()}`;
                let otherImages = files["other_images"];
                for (let i = 0; i < otherImages.length; i++) {
                    otherImages[i] = `/img/product/${req.params.id}/${otherImages[i].key.split('/').pop()}`;
                }
                resolve({ mainImage, otherImages });
            }
        });
    });
}

//set storage
function storageSet(s3, productId){
    return multerS3({
        s3: s3,
        bucket: 'stylish-image',
        acl: 'public-read',
        key: function (req, file, cb) {
            crypto.pseudoRandomBytes(16, function (err, raw) {
                if (err) return cb(err)
                let destination = `img/product/${productId}/`
                // set dir for img and let file with extname
                cb(null, destination + raw.toString('hex') + path.extname(file.originalname))
            });
        }
    })
}

module.exports = { imageCreate };