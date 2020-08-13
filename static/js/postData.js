// eslint-disable-next-line no-unused-vars
async function postData(endpoint, data, contentType, errMsg, button) {
    let headers = {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': contentType
    };
    if (contentType === 'multipart/form-data')
        headers = {
            'user-agent': 'Mozilla/4.0 MDN Example'
        };
    let response = await fetch(endpoint, {
        body: data,
        headers: headers,
        method: 'POST',
    });
    response = await response.json();
    console.log(response);
    if (response.error) {
        errMsg.style.color = 'red';
        errMsg.innerHTML = response.error;
    }
    else {
        errMsg.innerText = 'Success!';
        errMsg.style.color = 'green';
        //button.remove();
    }
}