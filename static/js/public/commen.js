/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
async function getData(endpoint) {
    let response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'method': 'GET'
        }
    });
    response = response.json();
    return response;
}

function getUrlVars() {
    let obj = {};
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        let hash = hashes[i].split('=');
        obj[hash[0]] = hash[1];
    }
    return obj;
}

function colorCreate(item) {
    let color = document.createElement('div');
    $(color).addClass('color');
    $(color).attr('id', item['code']);
    $(color).css('backgroundColor', '#' + item['code']);
    return color;
}
const IMG_HOST = 'https://d2482qdi0l0aam.cloudfront.net';

$('.logo a img').attr('src', IMG_HOST + '/img/icon/logo.png');
$('.feature .cart').css('background-image', 'url(' + IMG_HOST + '/img/icon/cart.png' + ')');
$('.feature input.search').css('background-image', 'url(' + IMG_HOST + '/img/icon/search.png' + ')');
$('.member a img').attr('src', IMG_HOST + '/img/icon/member.png');
$('#line').attr('src', IMG_HOST + '/img/icon/line.png');
$('#twitter').attr('src', IMG_HOST + '/img/icon/twitter.png');
$('#facebook').attr('src', IMG_HOST + '/img/icon/facebook.png');
