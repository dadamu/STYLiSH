/* global localStorage document $ alert fetch */
let list =[];
function renderCart(list) {
    if (list.length === 0) {
        let emptyItem = document.createElement("h4");
        $(emptyItem).css("margin-left", "20px");
        $(emptyItem).text("購物車空空的耶");
        $("#cartList").append(emptyItem);
        return;
    }
    for (let item of list) {
        let row = document.createElement("div");
        $(row).addClass("row");
        let variantItem = variantCreate(item);
        let qtyItem = qtyCreate(item);
        let priceItem = priceCreate(item);
        let subtotalItem = subtotalCreate(item);
        let removeItem = removeCreate(item);
        $(row).append(variantItem, qtyItem, priceItem, subtotalItem, removeItem);
        $("#cartList").append(row);
    }
}

function removeCreate(item) {
    let id = item["id"];
    let size = item["size"];
    let color = item["color_code"];
    let removeItem = document.createElement("div");
    let removeImg = document.createElement("img");
    $(removeItem).addClass("remove");
    $(removeItem).attr("id", `remove-${id}-${size}-${color}`);
    $(removeImg).attr("src", "/img/icon/cart-remove.png");
    $(removeItem).append(removeImg);
    return removeItem;
}

function subtotalCreate(item) {
    let subtotal = item["price"] * item["qty"];
    let subtotalItem = document.createElement("div");
    $(subtotalItem).text("NT." + subtotal);
    $(subtotalItem).addClass("subtotal");
    return subtotalItem;
}

function priceCreate(item) {
    let price = item["price"];
    let priceItem = document.createElement("div");
    $(priceItem).text("NT." + price);
    $(priceItem).addClass("price");
    return priceItem;
}

function variantCreate(item) {
    let image = item["image"];
    let name = item["name"];
    let id = item["id"];
    let size = item["size"];
    let colorName = item["color_name"];

    let variantItem = document.createElement("div");
    let pictureItem = document.createElement("div");
    let imageItem = document.createElement("img");

    let detailItem = document.createElement("div");
    let idItem = document.createElement("div");
    let nameItem = document.createElement("div");
    let sizeItem = document.createElement("div");
    let colorItem = document.createElement("div");

    $(variantItem).addClass("variant");
    $(pictureItem).addClass("picture");
    $(imageItem).attr("src", image);
    $(detailItem).addClass("detail");
    $(nameItem).text(name).addClass("name");
    $(idItem).text(id).addClass("id p-end");
    $(colorItem).text("顏色 : " + colorName).addClass("color");
    $(sizeItem).text("尺寸 : " + size).addClass("size");

    $(pictureItem).append(imageItem);
    $(detailItem).append(nameItem, idItem, colorItem, sizeItem);
    $(variantItem).append(pictureItem, detailItem);
    return variantItem;
}

function qtyCreate(item) {
    let id = item["id"];
    let size = item["size"];
    let color = item["color_code"];
    let qty = item["qty"];
    let stock = item["stock"];
    let qtyItem = document.createElement("div");
    let selector = document.createElement("select");
    $(selector).attr("id", `select-${id}-${size}-${color}`);
    $(qtyItem).addClass("qty");
    for (let i = 1; i <= stock; i++) {
        let option = document.createElement("option");
        $(option).val(i);
        $(option).text(i);
        $(selector).append(option);
        $(qtyItem).append(selector);
    }
    $(selector).val(qty);
    return qtyItem;
}

function qtyChange() {
    $(".qty select").each((key, select) => {
        $(select).change(() => {
            let selectId = $(select).attr("id");
            let qty = $(select).val();
            let info = selectId.split("-");
            let id = info[1];
            let size = info[2];
            let color = info[3];
            //change list
            let newList = list.map(el => {
                let check = el["id"] === id && el["size"] === size && el["color_code"] === color;
                if (check) {
                    el["qty"] = qty;
                    return el
                }
                return el
            });

            list = newList;
            localStorage.setItem("cart", JSON.stringify({ list }));
            $("#cartList").empty();
            renderCart(list);
            removeClick();
            qtyChange();
            priceCalc();
        });
    });
}


function removeClick() {
    $(".remove").each((key, remove) => {
        $(remove).click(() => {
            alert("已從購物車移除");
            let removeId = $(remove).attr("id");
            let info = removeId.split("-");
            let id = info[1];
            let size = info[2];
            let color = info[3];
            let newList = list.filter(el => el["id"] != id || el["size"] != size || el["color_code"] != color);
            list = newList;
            localStorage.setItem("cart", JSON.stringify({ list }));
            $("#cartList").empty();
            renderCart(list);
            removeClick();
            qtyChange();
            priceCalc();
            $("#cart-qty").text(list.length);
        });
    })
}

function priceCalc() {
    let subtotal = list.reduce((acc, cur) => {
        return acc + cur["price"] * cur["qty"];
    }, 0);
    $("#subtotal").text(subtotal);
    if (subtotal > 0) {
        $("#total").text(subtotal + 60);
    }
    else{
        $("#total").text(0);
    }
}

async function getProfile(token) {
    let endpoint = "/api/1.0/user/profile";
    let headers = {
        authorization: "bearer " + token
    };
    let profile = await fetch(endpoint, {
        headers: headers,
        method: "GET"
    });
    profile = await profile.json();
    return profile;
}

async function renderProfile(){
    let token = localStorage.getItem("token") || "";
    if(token){
        let profile = await getProfile(token);
        console.log(profile);
        $("#recipientName").val(profile["data"]["name"]);
        $("#recipientEmail").val(profile["data"]["email"]);
    }
}

async function webDo() {
    let cartObj = localStorage.getItem("cart");
    if(cartObj){
        list =  JSON.parse(cartObj)["list"];
    }
    $("#cart-qty").text(list.length);
    renderProfile();
    renderCart(list);
    removeClick();
    qtyChange();
    priceCalc();
}

webDo();