/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function getAllData(prime) {
    let list = getList();
    let recipientData = new FormData(recipientForm);
    let recipient = formToObj(recipientData);
    let orderData = new FormData(orderForm);
    let order = formToObj(orderData);
    order['recipient'] = recipient;
    return { prime, order, list };
}

function formToObj(form) {
    let obj = {};
    form.forEach((el, key) => {
        obj[key] = el;
    });
    return obj;
}

function getList() {
    let orderList = document.getElementsByClassName('product');
    let list = [];
    for (let item of orderList) {
        let obj = getRow(item);
        list.push(obj);
    }
    return list;
}

function getRow(row) {
    let obj = {};
    obj.color = {};
    let itemInfo = row.innerText.split(';');
    obj['id'] = itemInfo[0];
    obj['name'] = itemInfo[1];
    obj['price'] = itemInfo[2];
    obj['color']['name'] = itemInfo[3];
    obj['color']['code'] = itemInfo[4];
    obj['size'] = itemInfo[5];
    obj['qty'] = itemInfo[6];
    return obj;
}