//for test
function sleep(time){
    console.log('start');
    return new Promise((resolve)=>{
        setTimeout(()=>{
            console.log('stop');
            resolve();
        }, time);
    });
}

module.exports = sleep;