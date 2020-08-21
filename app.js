var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require ('mercadopago');
 
var app = express();

mercadopago.configure({
    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    'x-integrator-id': 'dev_24c65fb163bf11ea96500242ac130004',
});
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/pending', function (req, res) {
    console.log('pending');
    res.render('pending');
});

app.get('/failure', function (req, res) {
    console.log('failure');
    res.render('failure');
});


app.get('/webhook', function (req, res) {
    console.log(res.query);
    res.status(200).json({});
});

app.get('/success', function (req, res) {
    console.log('success');
    console.log(res.query);
    res.render('sucess', {
        ...res.query,
    });
});

function getUrl(path) {
    return process.env.BASE_URL + path;
}

app.get('/detail', function (req, res) {
    // Crea un objeto de preferencia
    let preference = {
        items: [
            {
                id: 1234,
                title: req.query.title,
                description: 'Dispositivo móvil de Tienda e-commerce',
                currency_id: "ARS",
                quantity: +req.query.unit,
                unit_price: +req.query.price,
                picture_url: req.query.img,
            },
        ],
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_63274575@testuser.com",
            phone: {
                area_code: "11",
                number: 22223333
            },
            address: {
                street_name: "False",
                street_number: 123,
                zip_code: "1111"
            },
        },
        back_urls: {
            success: getUrl("success"),
            failure: getUrl("failure"),
            pending: getUrl("pending"),
        },
        auto_return: "approved",
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "amex"
                }
            ],
            excluded_payment_types: [
                {
                    id: "atm",
                },
            ],
            installments: 6,
        },
        auto_return: 'approved',
        "notification_url": getUrl("webhook"),
        "external_reference": "facujgg@gmail.com",
    };
    console.log(preference);
    mercadopago.preferences.create(preference)
    .then(function(response) {
        var global_id = response.body.id;
        console.log({
            preferencia_de_pago: global_id,
        });
        res.render('detail', {
            ...req.query,
            global_id,
        });
    }).catch(function(error){
        console.log(error);
        res.status(500);
        res.render('error', { error: error });
    });
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

var port = process.env.PORT || 3000;

app.listen(port);

console.log(`Listening on port ${port}`);