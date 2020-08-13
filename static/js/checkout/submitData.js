/* eslint-disable no-undef */
const TPSubmit = document.getElementById("TPSubmit");
const cardError = document.getElementById("cardError");
TPSubmit.addEventListener('click', async () => {
    event.preventDefault()

    // get TapPay Fields status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // check getPrime
    if (tappayStatus.canGetPrime === false) {
        cardError.innerText = 'can not get prime';
        return
    }

    // Get prime and send data
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            cardError.innerText = 'get prime error ' + result.msg;
            return
        }
        let prime = result["card"]["prime"];
        let allData = getAllData(prime);
        allData = JSON.stringify(allData);
        let endpoint = `/api/1.0/order/checkout`;
        let conType = 'application/json';
        console.log(allData);
        postData(endpoint, allData, conType, cardError, TPSubmit)
    })
})