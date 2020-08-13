let fetch = require("node-fetch");
let endpoint1 = "http://localhost:3000/api/1.0/products/search?keyword=20";
let endpoint2 = "http://localhost:3000/api/1.0/products/details?id=2015555";
let endpoint3 = "http://localhost:3000/api/1.0/products/all?paging=200";
let ends = [endpoint1, endpoint2, endpoint3];
async function test(){
    let start = Date.now();
    for(let i = 0; i < 1; i++){
        await fetch(ends[2]);
    }
    let end = Date.now();
    let time = end-start;
    console.log(time+' ms');
}

test();