/* global document postData */
const productInfoList = ['id', 'title', 'category', 'description', 'price', 'texture', 'wash', 'place', 'note', 'story'];
const createInfoButton = document.getElementById("createInfo");
const createInfoErrorMsg = document.getElementById("createInfoErrorMsg");

createInfoButton.addEventListener('click', async () => {
    let productInfo = {};
    let productInfoId = document.getElementsByClassName('product_info_id');
    for (let i = 0; i < productInfoList.length; i++) {
        let newData = document.getElementById(productInfoList[i]).value;
        if (newData === "") {
            createInfoErrorMsg.innerText = "Can not be empty with product info!";
            return;
        }
        productInfo[productInfoList[i]] = newData;
    }
    let data = JSON.stringify(productInfo);
    let conType = 'application/json';
    let endpoint = `/api/1.0/product_info`;

    postData(endpoint, data, conType, createInfoErrorMsg, createInfoButton);

    //set other product_info id = current id
    for (let i = 0; i < productInfoId.length; i++) {
        productInfoId[i].value = productInfo['id'];
    }
});

