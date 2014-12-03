'use strict';

var common = require('./common');

var randoms = Bacon.fromPoll(10, common.randomBigNumber);
var primes = randoms.filter(function (n) { return n.isPrime(); });

// p and q pairs stream
var pqpairs = primes.skipDuplicates(function (x, y) {
    return x.eq(y);
}).slidingWindow(2, 2);

var n = pqpairs.map(function (pair) {
    return common.generateN(pair[0], pair[1]);
});

var e = n.map(common.generateE);
var d = Bacon.combineWith(common.generateD, n, e);
var m = pqpairs.map(function (pair) {
    return common.generateM(pair[0], pair[1]);
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

module.exports = {
    rsa: rsa,
    encryptor: function (stream, rsa) {
        return Bacon.combineWith(common.encrypt, stream, rsa, symbols);
    },
    decryptor: function (stream) {
        return Bacon.combineWith(common.decrypt, stream, rsa, symbols);
    }
};