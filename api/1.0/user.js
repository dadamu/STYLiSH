const express = require("express");
const router = express.Router();
const userController = require("../../controller/userController");


//signin post
router.post("/signin", userController.signIn);

//signup post
router.post("/signup", userController.signUp);


router.get("/profile", userController.profileGet);

module.exports = router;