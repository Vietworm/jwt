"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let helmet = require('helmet');
let fs = require('fs');

let app = express();
let key = fs.readFileSync('./private.key');
let port = 1337;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(helmet.hidePoweredBy({
    setTo: 'PHP 4.2.0'
}));
var users = [
    {
        id: 1, name: 'lephuhai', username: 'hailp', password: '123123'
    }, {
        id: 2, name: 'Nothing', username: 'user', password: '123123'
    }
];

function findByUsername(user) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username == user) {
            return users[i];
        }
    }
    return null;
}

app.route('/login')
    .get(function (req, res) {
        res.json({
            message: 'Vui lòng đăng nhập hệ thống'
        })
    }).post(function (req, res) {
        var user = findByUsername(req.body.username);
        if (user && user.password == req.body.password) {
            // define jwt to generate token
            let token = jwt.sign({
                name: user.name,
                username: user.username
            }, key, {
                expressIn: '1h',
                algorithm: 'HS512',
                headers: 'x-vietworm-access'
            });

            res.json({
                message: 'Đăng nhập thành công',
                token: token
            })
        } else {
            res.json({
                message: 'Sai tên truy cập hoặc mật khẩu.'
            })
        }
    });

function checkAuthentication(req, res, next) {
    let token = req.body.token || req.params.token || req.headers['x-vietworm-access'];
    if (token) {
        jwt.verify(token, key, function(err, decoded) {
            if (err) {
                return res.json({
                    message: 'Chưa xác thực'
                })
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.json({
            message: 'Chưa xác thực'
        })
    }
}

app.get('/', checkAuthentication, function(req, res) {
    res.send(users);
});

app.listen(port, function() {
    console.log('Server running at port: ' + port + ', ProcessId: ' + process.pid);
});

