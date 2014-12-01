'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(1337, function () {
    console.log('Listening');
});

app.use(express.static(__dirname + '/public'));

require('./BigNumber');
var Bacon = require('baconjs').Bacon;

// Log for debugging
var log = function (value) { console.log(value.toString()); };

var numbers = Bacon.fromPoll(100, function () {
    var str = '' + Math.floor(Math.random() * 9 + 1);
    for (var i = 0; i < 2 - 1; i++) str += Math.floor(Math.random() * 9);
    return BigNumber(str);
});

var eq = function (a, b) { return a.eq(b) };
var primes = numbers.skipDuplicates(eq)
    .filter(function (n) {
        var i = BigNumber(2);
        while (i < 13) {
            if (!i.powm(n, n).eq(i.mod(n))) return false;
            i = i.plus(1);
        }
        return true;
    }).skipDuplicates(eq);

var pqpairs = primes.slidingWindow(2, 2);

var m = pqpairs.map(function (pair) {
    return pair[0].times(pair[1]);
});

var n = pqpairs.map(function (pair) {
    return pair[0].minus(1).times(pair[1].minus(1));
});

var e = n.map(function (n) {
    var e = BigNumber(3);
    while (!e.gcd(n).eq(1)) e = e.plus(1);
    return e;
});

var d = Bacon.combineWith(function (n, e) {
    var E = [
        [BigNumber(1), BigNumber(0)],
        [BigNumber(0), BigNumber(1)]
    ];

    var a = n;
    var b = e;

    while (true) {
        var r = a.mod(b);
        if (r.eq(0)) return E[1][1];
        var q = a.div(b).floor();
        var tmp = [
            [BigNumber(0), BigNumber(0)],
            [BigNumber(0), BigNumber(0)]
        ];
        var newE = [
            [BigNumber(0), BigNumber(1)],
            [BigNumber(1), q.neg()]
        ];
        for (var i = 0; i < 2; i++)
            for (var j = 0; j < 2; j++)
                for (var k = 0; k < 2; k++)
                    tmp[i][j] = tmp[i][j].plus(E[i][k].times(newE[k][j]));
        E = tmp;
        a = b;
        b = r;
    }
}, n, e);

var rsa = Bacon.combineTemplate({
    e: e,
    d: d,
    m: m
});
rsa.filter(function (obj) {
        return obj.d.gt(0);
    })
    .filter(function (obj) {
        return !obj.e.eq(obj.d);
    })
    .take(1).onValue(function (obj) {
        console.log(obj.e.toString(), obj.d.toString(), obj.m.toString())
    });

/*var p = primes.take(1).toProperty();
var q = primes.skip(1).take(1).toProperty();

var m = Bacon.combineWith(function (p, q) {
    return p.times(q);
}, p, q);

var n = Bacon.combineWith(function (p, q) {
    return p.minus(1).times(q.minus(1));
}, p, q);

// Public key
var e = n.map(function (n) {
    var e = BigNumber(3);
    while (!e.gcd(n).eq(1)) e = e.plus(1);
    return e;
});

var d = Bacon.combineWith(function (n, e) {
    var E = [
        [BigNumber(1), BigNumber(0)],
        [BigNumber(0), BigNumber(1)]
    ];

    var a = n;
    var b = e;

    while (true) {
        var r = a.mod(b);
        if (r.eq(0)) return E[1][1];
        var q = a.div(b).floor();
        var tmp = [
            [BigNumber(0), BigNumber(0)],
            [BigNumber(0), BigNumber(0)]
        ];
        var newE = [
            [BigNumber(0), BigNumber(1)],
            [BigNumber(1), q.neg()]
        ];
        for (var i = 0; i < 2; i++)
            for (var j = 0; j < 2; j++)
                for (var k = 0; k < 2; k++)
                    tmp[i][j] = tmp[i][j].plus(E[i][k].times(newE[k][j]));
        E = tmp;
        a = b;
        b = r;
    }
}, n, e);

/*var conns = Bacon.fromBinder(function (sink) {
    io.on('connect', sink);
});

var ecryptedMessages = conns.flatMap(function (socket) {
    return Bacon.fromBinder(function (sink) {
        socket.on('message', sink);
    });
});

var _ = require('lodash');

var e = 3;
var d = 7;
var m = 33;
var symbols = Bacon.constant('qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ');

var encrypt = function (str, e, m) {
    var symbols = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ';
    return _.map(str, function (char) {
        var i = symbols.indexOf(char);
        i = BigNumber(i);
        return i.powm(e, m).toString();
    });
};

var decrypt = function (data, d, m) {
    var symbols = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ';
    return _.reduce(data, function (memo, el) {
        el = BigNumber(el);
        var i = el.powm(d, m);
        return memo + symbols[i];
    }, '');
};

var decryptedMessages = ecryptedMessages.map(function (data) {
    data = encrypt(data, e, m);
    return decrypt(data, d, m);
});

var primes = Bacon.from

decryptedMessages.onValue(function (text) {
    console.log(text);
});*/