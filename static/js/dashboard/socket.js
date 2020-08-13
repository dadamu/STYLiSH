app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    return new Promise((resolve, reject) => {
        try {
            app.socket.emit(event, Obj);
            resolve();
        }
        catch (e) {
            resolve({ error: e });
        }
    });
};

app.socketInit = () => {
    app.socket = io();
    app.ioListen();
};

app.ioListen = () => {
    app.on('refresh', ()=>{
        app.render();
    });
};

$(document).ready(app.socketInit);