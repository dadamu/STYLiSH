/* global postData */
const createButton = document.getElementById('create');
const createErrorMsg = document.getElementById('createErrorMsg');
const variantInfoId = document.getElementById('variantInfoId');

//ready post data obj {productInfo, variants, mainImage, OtherImages}
createButton.addEventListener('click', async () => {
    let variants = [];
    let productInfoId = variantInfoId.value;
    variants = getVariant();
    if (variants.length === 0) {
        createErrorMsg.innerText = 'Can not be empty with variant!';
        return;
    }

    let sendData = { variants };
    let data = JSON.stringify(sendData);
    let endpoint = `/api/1.0/products/${productInfoId}`;
    let conType = 'application/json';

    postData(endpoint, data, conType, createErrorMsg, createButton);
});

function getVariant() {
    let varaints = document.getElementsByClassName('variantRow');
    let variantList = [];
    for (let item of varaints) {
        let data = item.innerHTML;
        let result = {};
        data = data.split(';');
        data.pop();
        result = { size: data[0], colorName: data[1], colorCode: data[2], stock: data[3] };
        variantList.push(result);
    }
    return variantList;
}