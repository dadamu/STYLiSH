/*global getRow */
const search = document.getElementById('search');
const listForm = document.getElementById('listForm');
const idSelector = document.getElementById('idSelector');
const title = document.getElementById('title');
const price = document.getElementById('price');
const color = document.getElementById('color');
const code = document.getElementById('code');
const size = document.getElementById('size');
const qty = document.getElementById('qty');
const listError = document.getElementById('listError');
const listView = document.getElementById('listView');
const listSubmit = document.getElementById('listSubmit');

const subtotal = document.getElementById('subtotal');
const total = document.getElementById('total');
const freight = document.getElementById('freight');

let product;

search.addEventListener('change', async () => {
    if (search.value != '') {
        idSelector.innerHTML = '<option value=\'\'>Select One Product by Search</option>';
        let endpoint = `/api/1.0/products/search?keyword=${search.value}`;
        let response = await fetch(endpoint, {
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example'
            },
            method: 'GET',
        });
        response = await response.json();
        if (response['error']) listError.innerText = response.error;
        else if (response['data'].length == 0) listError.innerText = 'No Similar Info Id!';
        else {
            listError.innerText = '';
            response.data.map((el) => {
                let newoption = document.createElement('option');
                newoption.value = el['id'];
                newoption.innerText = `${el['id']}/${el['title']}`;
                idSelector.appendChild(newoption);
            });
        }
    }
    else {
        idSelector.innerHTML = '<option value="">Select One Product by Search</option>';
    }
});

idSelector.addEventListener('change', async () => {
    let id = idSelector.value;
    let endpoint = `/api/1.0/products/details?id=${id}`;
    let response = await fetch(endpoint, {
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example'
        },
        method: 'GET',
    });
    response = await response.json();
    if (response['error']) listError.innerText = response['error'];
    else {
        product = response['data'];
        listError.innerText = '';
        let colors = product['colors'];
        color.innerHTML = '';
        title.value = product['title'];
        price.value = product['price'];
        code.value = colors[0]['code'];
        colors.map((el) => {
            let newoption = document.createElement('option');
            newoption.value = el['name'];
            newoption.innerText = `${el['name']}`;
            color.appendChild(newoption);
        });
        let colorCode = code.value;
        size.innerHTML = '';
        for (let item of product['variants']) {
            if (item['color_code'] === colorCode) {
                let newoption = document.createElement('option');
                newoption.value = item['size'];
                newoption.innerText = `${item['size']}`;
                size.appendChild(newoption);
            }
        }
    }
});

color.addEventListener('change', async () => {
    let colorName = color.value;
    let colors = product.colors;
    let colorCode;
    size.innerHTML = '';
    for (let item of colors) {
        if (item.name === colorName) {
            colorCode = item.code;
            code.value = colorCode;
            break;
        }
    }
    for (let item of product.variants) {
        if (item['color_code'] === colorCode) {
            let newoption = document.createElement('option');
            newoption.value = item['size'];
            newoption.innerText = `${item['size']}`;
            size.appendChild(newoption);
        }
    }
});


listSubmit.addEventListener('click', () => {
    const newItem = document.createElement('div');
    const newDeleteButton = document.createElement('button');
    let form = new FormData(listForm);
    let text = '';
    for (let value of form) {
        if (value[1] === '') {
            listError.innerText = 'Cant Not be Empty!';
            return;
        }
        text += `${value[1]};`;
    }
    newDeleteButton.innerText = 'X';
    newDeleteButton.addEventListener('click', deleteItem);
    
    newItem.innerText = text;
    newItem.className = 'product';
    newItem.appendChild(newDeleteButton);
    listView.appendChild(newItem);
    subtotal.value = parseInt(subtotal.value) + parseInt(price.value) * parseInt(qty.value);
    total.value = parseInt(subtotal.value) + parseInt(freight.value);
});

//delete item data preparing to insert
function deleteItem() {
    const thisRow = this.parentElement;
    let rowData = getRow(thisRow);
    subtotal.value -= rowData['price'] * rowData['qty'];
    total.value -= rowData['price'] * rowData['qty'];
    thisRow.remove();
}