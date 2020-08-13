/* global window FB */

/* global document postData FormData */
let form = document.getElementById("signInForm");
let signIn = document.getElementById("signIn");
let errorMsg = document.getElementById("errorMsg");

let endpoint = "/api/1.0/user/signin";
let conType = "application/json";

window.fbAsyncInit = function () {
    FB.init({
        appId: '2510454669265670',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v7.0'
    });
};

signIn.addEventListener("click", () => {
    let formData = new FormData(form);
    formData.append("provider", "native");
    let data = JSON.stringify(Object.fromEntries(formData));
    postData(endpoint, data, conType, errorMsg, signIn);
})

// eslint-disable-next-line no-unused-vars
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        let data = {};
        data["provider"] = "facebook";
        data["access_token"] = response.authResponse.accessToken;
        data = JSON.stringify(data);
        postData(endpoint, data, conType, errorMsg, signIn);
    });
}