/* global getData $ colorCreate */
async function getCompaign() {
    let endpoint = '/api/1.0/marketing/campaigns';
    let response = await getData(endpoint);
    return response['data'];
}

function renderCampaign(campaigns) {
    let step = document.createElement('div');
    $(step).attr('id', 'step');
    campaigns.forEach((el, key) => {
        let campaign = createCampaign(el);
        let circle = createCircle(key);

        $(campaign).addClass('visual');
        if (key === 0)
            $(campaign).addClass('current');
        $('#keyvisual').append(campaign);
        $(step).append(circle);
    });
    $('#keyvisual').append(step);
}

function createCampaign(item) {
    let campaign = document.createElement('a');
    let story = document.createElement('div');
    $(campaign).attr('href', '/product.html?id=' + item['product_id']);
    $(campaign).css('backgroundImage', `url(${item['picture']})`);

    $(campaign).addClass('visual');
    $(story).addClass('story');

    story.innerText = item['story'];

    campaign.appendChild(story);

    return campaign;
}

async function getProducts(category, paging) {
    let endpoint = `/api/1.0/products/${category}?paging=${paging}`;
    let response = await getData(endpoint);
    return response;
}

async function searchProducts(keyword, paging) {
    let endpoint = `/api/1.0/products/search?keyword=${keyword}&paging=${paging}`;
    let response = await getData(endpoint);
    return response;
}

async function renderProduct(products) {
    products['data'].forEach(el => {
        let product = createProduct(el);
        $('#products').append(product);
    });
}

function createProduct(item) {
    let product = document.createElement('a');
    let image = document.createElement('img');
    let colors = document.createElement('div');
    let name = document.createElement('div');
    let price = document.createElement('div');

    $(colors).addClass('colors');
    $(product).addClass('product');
    $(name).addClass('name');
    $(price).addClass('price');

    $(name).text(item['title']);
    $(price).text('TWD.' + item['price']);
    $(image).attr('src', item['main_image']);
    item['colors'].forEach(el => {
        let color = colorCreate(el);
        $(colors).append(color);
    });

    $(product).append(image);
    $(product).append(colors);
    $(product).append(name);
    $(product).append(price);

    $(product).attr('href', `product.html?id=${item['id']}`);
    return product;
}

function createCircle(key) {
    let circle = document.createElement('a');
    $(circle).addClass('circle');
    $(circle).addClass('circle-' + key);
    if (key === 0)
        $(circle).addClass('current');
    return circle;
}

function animateCampaign(count, number) {
    let current = $('.visual.current').get(0);
    $(current).removeClass('current');
    count = count % number;
    let next = $('.visual').get(Math.floor(count));
    $(next).addClass('current');

    let currentCircle = $('.circle.current').get(0);
    let nextCircle = $('.circle').get(count);
    $(currentCircle).removeClass('current');
    $(nextCircle).addClass('current');
    return count;
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


async function webDo() {
    let cart = localStorage.getItem('cart');
    let cartObj = JSON.parse(cart);
    let list = [];
    if (cartObj) {
        list = cartObj['list'];
    }

    $('#cart-qty').text(list.length);

    let query = getUrlVars();
    let count = 0;
    let paging = 0;
    let category = query['tag'] || 'all';
    let products;
    if (category != 'men' && category != 'women' && category != 'accessories' && category != 'all') {
        products = await searchProducts(category, paging);
        if(products['data'].length === 0){
            alert('找不到商品');
            window.location = '/';
        }
    }
    else {
        products = await getProducts(category, paging);
    }
    let campaigns = await getCompaign();
    let campaignNum = campaigns.length;
    renderProduct(products);
    renderCampaign(campaigns);

    $('.circle').each((key, el) => {
        $(el).click(() => {
            count = el.classList[1].replace('circle-', '');
            animateCampaign(count, campaignNum);
        });
    });

    $(window).scroll(async () => {
        let differ = $(document).height() - $(window).height() - $(window).scrollTop();
        if (differ < 100 && products['next_paging']) {
            products = await getProducts(category, ++paging);
            renderProduct(products);
        }
    });

    setInterval(() => {
        animateCampaign(++count, campaignNum);
    }, 5000);
}

webDo();