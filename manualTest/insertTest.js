let {query} = require("../module/mysql");


async function insertInfo(times, start){
    let sql = "INSERT INTO product_info VALUES ?;";
    let inserts = [];
    for(let i = start; i < times+start; i++){
        inserts.push([i,i,i,i,i,i,i,i,i,i,i]);
    }
    await query(sql, [inserts]);
    console.log("info success");
    return;
}

async function insertImage(times, start){
    let sql = "INSERT INTO image VALUES ?";
    let inserts = [];
    for(let i = start; i < times+start; i++){
        inserts.push([i,i,i]);
    }
    await query(sql, [inserts]);
    console.log("image success");
    return;
}

async function insertProduct(times, start){
    let sql = "INSERT INTO product VALUES ?";
    let inserts = [];
    for(let i = start; i < times+start; i++){
        inserts.push([i,'M',i,i,12]);
        inserts.push([i,'S',i,i,12]);
    }
    await query(sql, [inserts]);
    console.log("product success");
    return;
}

async function insertDo(times, start){
    try{
        await insertInfo(times, start);
    }
    catch(err){
        console.log("error");
        return
    }
    try{
        let i1 = insertImage(times, start);
        let i2 = insertProduct(times, start);
        await Promise.all([i1,i2]);
    }
    catch(err){
        console.log("error");
        return;
    }
}


async function insertStart(times, start){
    let ps = [];
    for(let i =0; i<times; i++){
        ps.push(insertDo(10000, start+ i*10000));
    }
    await Promise.all(ps);
    return;
}

async function start(times, start){
    let startTime = Date.now();
    await insertStart(times, start);
    let endTime = Date.now();
    console.log("success", (endTime-startTime)/1000);
}

//10,000 per 1
start(50, 4000001);