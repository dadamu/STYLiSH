/* eslint-disable no-undef */
const app = {};
app.init = async () => {
    const start = Date.now();
    await app.render();
    const end = Date.now();
    console.log( "Render Time: " +(end-start)/1000+ "s");
    app.UIListen();
    const order = {
        "total": 8607,
        "list": [
            {
                "id": 10,
                "price": 890,
                "color": {
                    "code": "#800080",
                    "name": "Purple"
                },
                "size": "M",
                "qty": 2
            },
            {
                "id": 8,
                "price": 747,
                "color": {
                    "code": "#00EEEE",
                    "name": "Aqua"
                },
                "size": "L",
                "qty": 7
            },
            {
                "id": 2,
                "price": 799,
                "color": {
                    "code": "#00EEEE",
                    "name": "Aqua"
                },
                "size": "L",
                "qty": 2
            }
        ]
    };
    $('#order').val(JSON.stringify(order))
};


app.render = async () => {
    const total = app.showTotal();
    const pie = app.showPie();
    const histo = app.showHisto();
    const stack = app.showStack();
    return Promise.all([total, pie, histo, stack]);
};

app.showTotal = async () => {
    let get = await app.get('/api/1.0/midterm/total');
    const total = get.data.total
    $('#number').html('Total Revenue: ' + total);
}

app.showPie = async () => {
    const pie = { values: [], labels: [], marker: { colors: [] }, type: 'pie' };
    const get = await app.get('/api/1.0/midterm/color-pie');
    const { data } = get;
    data.forEach(el => {
        pie.values.push(el.qty);
        pie.labels.push(el.color_name);
        pie.marker.colors.push(el.color_code);
    });
    const layout = {
        title: {
            text: 'Product sold percentage in different colors',
        },
        height: 350,
    };
    Plotly.newPlot('pie', [pie], layout);
};

app.showHisto = async () => {
    const get = await app.get('/api/1.0/midterm/price-histogram');
    const trace = { x: [], type: 'histogram' };
    const { data } = get;
    data.forEach(el => {
        for (let i = 0; i < el.qty; i++) {
            trace.x.push(el.price);
        }
    });
    const layout = {
        title: {
            text: 'Product sold quantity in different price range'
        },
        xaxis: {
            title: {
                text: 'Price Range'
            }
        },
        yaxis: {
            title: {
                text: 'Quantity'
            }
        }
    };
    Plotly.newPlot('histogram', [trace], layout);
};

app.showStack = async () => {
    const get = await app.get('/api/1.0/midterm/size-stack');
    const { data } = get;
    const traces = [makeTrace(data, 'L'), makeTrace(data, 'M'), makeTrace(data, 'S')];
    const layout = {
        barmode: 'stack',
        title: {
            text: 'Quantity of top 5 sold products in different sizes',
        },
        yaxis: {
            title: {
                text: 'Quantity',
            }
        }
    };

    Plotly.newPlot('bar', traces, layout);

    function makeTrace(data, size) {
        const list = data.filter(el => el.size === size);
        const trace = { x: [], y: [], name: size, type: 'bar' };
        list.forEach(el => {
            trace.x.push('product' + el.product_id);
            trace.y.push(el.qty);
        });
        return trace;
    }
}

app.get = async (endpoint) => {
    const get = await fetch(endpoint);
    const result = await get.json();
    return result;
};

app.UIListen = () => {
    $('#newOrder').click(async() => {
        const body = $("#order").val();
        const method = 'POST';
        const headers = {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        };
        const res = await fetch('/api/1.0/midterm/new-order', { body, headers, method });
        const result = await res.json();
        alert(result.msg);
    });

    $('#refresh').click(async () => {
        const pass = window.prompt("refreshing all data will take some time", "");
        const body = JSON.stringify({ pass });
        const method = 'POST';
        const headers = {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        };
        const res = await fetch('/api/1.0/midterm/refresh', { body, headers, method });
        const result = await res.json();
        alert(result.msg);
    });
}

$(document).ready(app.init);