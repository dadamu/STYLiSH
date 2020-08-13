/* global getUrlVars $ */

function webDo() {
    let cart = localStorage.getItem('cart');
    let cartObj = JSON.parse(cart);
    let query = getUrlVars();
    let number = query['number'];
    
    let list = [];
    if (cartObj) {
        list = cartObj['list'];
    }
    $('#cart-qty').text(list.length);
    $('#number').text(number);
}

webDo();