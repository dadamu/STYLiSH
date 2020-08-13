/* eslint-disable no-undef */
$("#checkout").click(async() => {
    event.preventDefault()

    // get TapPay Fields status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // check getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('無法得到信用卡資料');
        return
    }

    // Get prime and send data
    TPDirect.card.getPrime(async(result) => {
        if (result.status !== 0) {
            alert("信用卡輸入錯誤");
            return
        }
        let prime = result["card"]["prime"];
        let endpoint = `/api/1.0/order/checkout`;
        let conType = 'application/json';
        let data = dataGenerate(prime);
        if(data["list"].length === 0){
            alert("購物車空空喔");
            return;
        }
        let headers = {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': conType
        };
        let response = await fetch(endpoint, {
            body: JSON.stringify(data),
            headers: headers,
            method: 'POST',
        });
        response = await response.json();
        
        if(response["error"]){
            alert("付款失敗");
        }
        else{
            alert("付款成功");
            localStorage.removeItem("cart");
            window.location =  `/thankyou.html?number=${response["data"]["number"]}`;
        }
    })
});

function dataGenerate(prime){
    let data = {};
    data["prime"] = prime;
    data["order"] = orderGenerate();
    data["list"] = listGenerate();
    return data;
}

function orderGenerate(){
    let order = {};
    order["shipping"] = $("#shipping").val();
    order["payment"] = $("#payment").val();
    order["subtotal"]= parseInt($("#subtotal").text());
    order["freight"] = parseInt($("#freight").text());
    order["total"] = parseInt($("#freight").text());
    order["recipient"] = recipientGenerate();
    return order;
}

function recipientGenerate(){
    let recipient = {};
    recipient["name"] = $("#recipientName").val();
    recipient["phone"] = $("#recipientPhone").val();
    recipient["email"] = $("#recipientEmail").val();
    recipient["address"] = $("#recipientAddress").val();
    recipient["time"] = $("input[name='time']:checked").val();
    return recipient;
}

function listGenerate(){
    let cartInfo = localStorage.getItem("cart");
    sendlist = JSON.parse(cartInfo)["list"] || [];
    return sendlist.map((el)=>{
        colorCode = el["color_code"];
        colorName = el["color_name"];
        el["color"] = {
            name : colorName,
            code : colorCode
        };
        delete el["image"];
        delete el["stock"];
        delete el["color_name"];
        delete el["color_code"];
        return el;  
    });
}