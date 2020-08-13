/*global document fetch */
const recipientError = document.getElementById("recipientError");
const recipientSubmit = document.getElementById("recipientSubmit");
const name = document.getElementById("name");
const email = document.getElementById("email");

recipientSubmit.addEventListener('click', async () => {
    let cookies = document.cookie;
    cookies = cookies.split(', ');
    var result = {};
    for (var i = 0; i < cookies.length; i++) {
        var cur = cookies[i].split('=');
        result[cur[0]] = cur[1];
    }
    let token = result["access_token"];
    if (!token) {
        recipientError.innerText = "No Token!";
    }
    else {
        let endpoint = "/api/1.0/user/profile";
        let profile = await fetch(endpoint, {
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'authorization': 'bearer ' + token
            },
            method: 'GET',
        });
        profile = await profile.json();
        if(profile["error"])  recipientError.innerText = profile["error"];
        name.value = profile["data"]["name"];
        email.value = profile["data"]["email"];
        recipientError.style.color = "green";
        recipientError.innerText = "Success!";
    }
});