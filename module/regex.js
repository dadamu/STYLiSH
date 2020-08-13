/* eslint-disable no-useless-escape */
module.exports.emailRegex = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
module.exports.nameRegex = /^[\w\d\u4e00-\u9fa5]+$/;
module.exports.passRegex = /^[\w\d]{3,}$/;
