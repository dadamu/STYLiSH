/* global $ FB */
let cart = localStorage.getItem('cart');
let cartObj = JSON.parse(cart);
let list = [];
if (cartObj) {
    list = cartObj['list'];
}
$('#cart-qty').text(list.length);

window.fbAsyncInit = function () {
    FB.init({
        appId: '2510454669265670',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v7.0'
    });
};

// eslint-disable-next-line no-unused-vars
function fbLogin() {
    FB.login((response) => {
        if (response.authResponse) {
            let data = {};
            data['provider'] = 'facebook';
            data['access_token'] = response.authResponse.accessToken;
            data = JSON.stringify(data);
            postFbData(data);
        }
        else {
            alert('登入失敗');
        }
    });
}

async function postFbData(data) {
    let res = await postData('/api/1.0/user/signin', data);
    if (res['error']) {
        alert('登入失敗');
    }
    else {
        localStorage.setItem('token', res['data']['access_token']);
        window.location = '/';
        alert('登入成功');
    }
}

$('.message a').click(() => {
    $('main form').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
});

$('#create').click(async () => {
    let form = $('#registerForm')[0];
    let data = new FormData(form);
    data.append('provider', 'native');

    var object = {};
    data.forEach((value, key) => { object[key] = value; });
    var json = JSON.stringify(object);
    let res = await postData('/api/1.0/user/signup', json);
    if (res['error'])
        alert('註冊失敗');
    else {
        alert('註冊成功');
        localStorage.setItem('token', res['data']['access_token']);
        window.location = '/';
    }
});

$('#login').click(async () => {
    let form = $('#loginForm')[0];
    let data = new FormData(form);
    data.append('provider', 'native');

    var object = {};
    data.forEach((value, key) => { object[key] = value; });
    var json = JSON.stringify(object);
    let res = await postData('/api/1.0/user/signin', json);
    if (res['error'])
        alert('登入失敗');
    else {
        alert('登入成功');
        localStorage.setItem('token', res['data']['access_token']);
        window.location = '/';
    }
});

async function postData(endpoint, data) {
    let res = await fetch(endpoint, {
        'body': data,
        'method': 'POST',
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        }
    });
    res = await res.json();
    return res;
}

