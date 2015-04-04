'use strict';

var BigNumber = require('./BigNumber');

function randomBigNumber() {
    var str = '' +(Math.random() * 9 + 1).toFixed(0);
    for (var i = 0; i < 2 - 1; i++) str += (Math.random() * 9).toFixed(0);
    return BigNumber(str);
}

function generateE(n) {
    var e = BigNumber(3);
    while (!e.gcd(n).eq(1)) e = e.plus(1);
    return e;
}

function generateD(n, e) {
    var E = [
        [BigNumber(1), BigNumber(0)],
        [BigNumber(0), BigNumber(1)]
    ];

    var a = n;
    var b = e;

    var r = a.mod(b);
    while (!r.eq(0)) {
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
        r = a.mod(b);
    }
    return E[1][1];
}

function createKey() {
    var p = BigNumber.randomPrime(7);
    var q = BigNumber.randomPrime(7);
    var n = p.minus(1).times(q.minus(1));

    var e = generateE(n);
    var d = generateD(n, e);
    var m = p.times(q);
}

var randoms = Bacon.fromPoll(10, randomBigNumber);
var primes = randoms.filter(function (n) { return n.isPrime(); });

// p and q pairs stream
var pqpairs = primes.skipDuplicates(function (x, y) {
    return x.eq(y);
}).slidingWindow(2, 2);

var n = pqpairs.map(function (pair) {
    var p = pair[0], q = pair[1];
    return p.minus(1).times(q.minus(1));
});

var e = n.map(generateE);
var d = Bacon.combineWith(generateD, n, e);
var m = pqpairs.map(function (pair) {
    var p = pair[0], q = pair[1];
    return p.times(q);
});

var rsa = Bacon.combineTemplate({ e: e, d: d, m: m })
    .filter(function (rsa) {
        return rsa.d.gt(0);
    })
    .filter(function (rsa) {
        return !rsa.e.eq(rsa.d);
    })
    .take(1)
    .toProperty();

rsa.onValue(function (obj) {
    console.log('e:', obj.e.toString());
    console.log('d:', obj.d.toString());
    console.log('m:', obj.m.toString());
});

var symbols = Bacon.constant('qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ');

function encrypt(str, rsa, symbols) {
    return _.map(str, function (char) {
        var i = symbols.indexOf(char);
        i = BigNumber(i);
        return i.powm(rsa.e, rsa.m).toString();
    });
}

function decrypt(data, rsa, symbols) {
    return _.reduce(data, function (memo, el) {
        el = BigNumber(el);
        var i = el.powm(rsa.d, rsa.m);
        return memo + symbols[i];
    }, '');
}

module.exports = {
    rsa: rsa,
    encryptor: function (stream, rsa) {
        return Bacon.combineWith(encrypt, stream, rsa, symbols);
    },
    decryptor: function (stream) {
        return Bacon.combineWith(decrypt, stream, rsa, symbols);
    }
};
