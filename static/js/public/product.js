/* global getData getUrlVars $ colorCreate */
let colorCurrent = '';
let sizeCurrent = '';
let image = '';
let map = new Map();
let stockCurrent;
let id = 0;
let name = '';
let list = [];
let price = 0;
let colorMap = new Map();

//product
async function getProduct(id) {
    let endpoint = '/api/1.0/products/details?id=' + id;
    let response = await getData(endpoint);
    return response['data'];
}

function renderProduct(product) {
    $('#mainImage').attr('src', product['main_image']);
    $('#title').text(product['title']);
    $('#id').text(product['id']);
    $('#price').text('TWD.' + product['price']);
    $('#note').text(product['note']);
    $('#texture').text(product['texture']);
    $('#description').html(product['description'].replace(/\n/g, '<br>'));
    $('#wash').text(product['wash']);
    $('#place').text(product['place']);
    $('#story').text(product['story']);

    product['colors'].forEach(el => {
        let color = colorCreate(el);
        $('#colors').append(color);
    });

    product['images'].forEach(el => {
        let image = imagesCreate(el);
        $('#conclude').append(image);
    });
}


//size
function renderSize(map, color) {
    let items = map.get(color);
    let sizes = sizeSort(items);
    let currentSet = false;
    sizes.forEach((el) => {
        if (el) {
            let size = sizeCreate(el['size']);
            $(size).addClass('size');
            if (el['stock'] === 0) {
                $(size).addClass('disabled');
            }
            if (!currentSet && el['stock'] != 0) {
                $(size).addClass('current');
                currentSet = true;
            }
            $('#sizes').append(size);
        }
    });
}

function sizeSort(items) {
    let result = new Array(4).fill(false);
    let orderMap = { 'S': 0, 'M': 1, 'L': 2, 'XL': 3 };
    for (let [key, value] of Object.entries(items)) {
        let pos = orderMap[key];
        result[pos] = { size: key, stock: value };
    }

    return result;
}


function sizeCreate(item) {
    let size = document.createElement('div');
    $(size).addClass('size');
    $(size).text(item);
    return size;
}

//image
function imagesCreate(url) {
    let image = document.createElement('img');
    $(image).attr('src', url);
    $(image).addClass('p-end');
    return image;
}

function checkCartList(id, color, size) {
    for (let item of list) {
        if (item['id'] === id && item['color_code'] === color && item['size'] === size)
            return true;
    }
    return false;
}

function mapsCreate(product) {
    let map = new Map();
    let colorMap = new Map();
    for (let item of product['colors']) {
        let code = item['code'];
        let name = item['name'];
        if (!colorMap.get(code))
            colorMap.set(code, name);
    }
    for (let item of product['variants']) {
        let code = item['color_code'];
        let size = item['size'];
        let stock = item['stock'];
        let obj = {};
        if (!map.get(code)) {
            obj[size] = stock;
            map.set(code, obj);
        }
        else {
            map.get(code)[size] = stock;
        }
    }
    return [map, colorMap];
}


//click
function setSizeClick() {
    //click event with all size
    $('.size').each((key, size) => {
        $(size).click(() => {
            let isDisable = $(size).hasClass('disabled');
            if (!isDisable) {
                $('.size.current').removeClass('current');
                $(size).addClass('current');
                sizeCurrent = $(size).text();
                stockCurrent = map.get(colorCurrent)[sizeCurrent];
                $('#qty').text(1);
            }
        });
    });
}

function setAllClick() {
    //click event with all color
    $('.color').each((key, color) => {
        $(color).click(() => {
            let isDisable = $(color).hasClass('disabled');
            if (!isDisable) {
                $('.color.current').removeClass('current');
                $(color).addClass('current');
                colorCurrent = $(color).attr('id');
                $('.size').remove();
                renderSize(map, colorCurrent);
                sizeCurrent = $('.size.current').text();
                stockCurrent = map.get(colorCurrent)[sizeCurrent];
                $('#qty').text(1);

                setSizeClick();

            }
        });
    });

    setSizeClick();

    $('#minus').click(() => {
        let qty = $('#qty').text();
        if (qty != 0) {
            $('#qty').text(parseInt(qty) - 1);
        }
    });

    $('#plus').click(() => {
        let qty = $('#qty').text();
        if (qty < stockCurrent) {
            $('#qty').text(parseInt(qty) + 1);
        }
    });

    $('#add-cart-btn').click(() => {
        alert('已加入購物車');
        if (!checkCartList(id, colorCurrent, sizeCurrent)) {
            let qty = $('#qty').text();
            let colorName = colorMap.get(colorCurrent);
            let obj = {
                id,
                image,
                name,
                price,
                color_code: colorCurrent,
                color_name: colorName,
                size: sizeCurrent,
                qty: parseInt(qty),
                stock: stockCurrent
            };

            list.push(obj);
            localStorage.setItem('cart', JSON.stringify({ list }));
            $('#cart-qty').text(list.length);
        }
    });
}


//main do
async function webDo() {
    let cart = localStorage.getItem('cart');
    let cartObj = JSON.parse(cart);
    if(cartObj){
        list = cartObj['list'];
    }
    $('#cart-qty').text(list.length);
    //get id from url
    let query = getUrlVars();
    id = query['id'];

    let product = await getProduct(id);
    name = product['title'];
    price = product['price'];
    image = product['main_image'];
    renderProduct(product);

    //create check map
    let maps = mapsCreate(product);
    map = maps[0];
    colorMap = maps[1];


    //select current variant and check now stock
    let color = $('.color').get(0);
    $(color).addClass('current');
    colorCurrent = $(color).attr('id');

    renderSize(map, colorCurrent);
    sizeCurrent = $('.size.current').text();
    stockCurrent = map.get(colorCurrent)[sizeCurrent];

    setAllClick();
}

webDo();