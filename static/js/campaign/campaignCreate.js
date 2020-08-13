/* global document fetch */
const campaignForm = document.forms['campaignForm'];
const search = document.getElementById('search');
const idSelector = document.getElementById('idSelector');
const picture = document.getElementById('picture');
const preview = document.getElementsByClassName('img_preview')[0];

const errorMsg = document.getElementById('errorMsg');
const createButton = document.getElementById('create');

search.addEventListener('change', async () => {
    if (search.value != '') {
        idSelector.innerHTML = "<option value=''>Select One Product by Search</option>";
        let endpoint = `/api/1.0/products/search?keyword=${search.value}`;
        let response = await fetch(endpoint, {
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example'
            },
            method: 'GET',
        });
        response = await response.json();
        if (response.error) errorMsg.innerText = response.error;
        else if (response.data.length == 0) errorMsg.innerText = "No Similar Info Id!";
        else {
            errorMsg.innerText = "";
            response.data.map((el) => {
                let newoption = document.createElement('option');
                newoption.value = el["id"];
                newoption.innerText = `${el["title"]}/${el["id"]}`;
                idSelector.appendChild(newoption);
            });
        }
    }
    else {
        idSelector.innerHTML = "<option value=''>Select One Product by Search</option>";
    }
});

picture.addEventListener('change', () => {
    const image = picture.files[0];
    preview.src = URL.createObjectURL(image);
})

createButton.addEventListener('click', () => {
    let id = campaignForm.elements.idSelector.value;
    let picture = campaignForm.elements.picture.value;
    let story = campaignForm.elements.story.value;
    if (!id | !picture | !story) {
        errorMsg.innerText = "Can Not be Empty!";
    }
    else {
        // eslint-disable-next-line no-undef
        let data = new FormData(campaignForm);
        let endpoint = `/api/1.0/marketing/campaigns/${id}`;
        let conType = 'multipart/form-data';
        /* global postData */
        postData(endpoint, data, conType, errorMsg, createButton);
    }
})