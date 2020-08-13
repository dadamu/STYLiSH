/* global postData */
const uploadButton = document.getElementById('uploadImage');
const uploadForm = document.getElementById('uploadForm');
const uploadErrorMsg = document.getElementById('uploadErrorMsg');
const uploadInfoId = document.getElementById('uploadInfoId');
var mainImage = document.getElementById('mainImage');
var otherImages = document.getElementById('otherImages');

uploadButton.addEventListener('click', async () => {
    let productInfoId = document.getElementById('uploadInfoId').value;

    if (uploadInfoId.value == '' || mainImage.value == '' || otherImages.value == '') {
        uploadErrorMsg.innerText = 'Can not be empty';
    }
    else {
        let endpoint = `/api/1.0/upload/${productInfoId}`;
        let data = new FormData(uploadForm);
        let conType = 'multipart/form-data';
        postData(endpoint, data, conType, uploadErrorMsg, uploadButton);
    }
});