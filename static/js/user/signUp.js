/* global postData */
let form = document.getElementById('signUpForm');
let signUp = document.getElementById('signUp');
let errorMsg = document.getElementById('errorMsg');

signUp.addEventListener('click', () => {
    let formData = new FormData(form);
    let data = JSON.stringify(Object.fromEntries(formData));
    let endpoint = '/api/1.0/user/signup';
    let conType = 'application/json';
    postData(endpoint, data, conType, errorMsg, signUp);
});
