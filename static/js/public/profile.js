/* global $ */

async function getProfile(token) {
    let endpoint = '/api/1.0/user/profile';
    let headers = {
        authorization: 'bearer ' + token
    };
    let profile = await fetch(endpoint, {
        headers: headers,
        method: 'GET'
    });
    profile = await profile.json();
    return profile;
}

function profileRender(profile){
    $('#image').attr('src', profile['picture']);
    $('#id').text(profile['id']);
    $('#name').text(profile['name']);
    $('#email').text(profile['email']);
}

async function webDo() {
    let cart = localStorage.getItem('cart');
    let cartObj = JSON.parse(cart);
    let list = [];
    if(cartObj){
        list = cartObj['list'];
    }
    $('#cart-qty').text(list.length);
    let token = localStorage.getItem('token') || '';
    if (token) {
        let profile = await getProfile(token);
        if (profile['error']) {
            window.location = '/sign.html';
        }
        else{
            profileRender(profile['data']);
            $('#logout').click(()=>{
                localStorage.setItem('token', '');
                alert('登出成功');
                window.location = '/';
            });
        }
    }
    else {
        window.location = '/sign.html';
    }
}

webDo();