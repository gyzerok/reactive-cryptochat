'use strict';

require('./BigNumber');

var randomBigNumber = function () {
    var str = '' + Math.floor(Math.random() * 9 + 1);
    for (var i = 0; i < 2 - 1; i++) str += (Math.random() * 9).toFixed(0);
    return BigNumber(str);
};

var randoms = Bacon.fromPoll(10, randomBigNumber);

var primes = randoms.filter(function (n) {
    return n.isPrime();
});

// p and q pairs stream
var pqpairs = primes.skipDuplicates(function (x, y) {
    return x.eq(y);
}).slidingWindow(2, 2);

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
}, n, e);

var m = pqpairs.map(function (pair) {
    return pair[0].times(pair[1]);
});

var rsa = Bacon.combineTemplate({ e: e, d: d, m: m })
    .filter(function (obj) {
        return obj.d.gt(0);
    })
    .filter(function (obj) {
        return !obj.e.eq(obj.d);
    })
    .take(1);

rsa.onValue(function (obj) {
    console.log('e:', obj.e.toString());
    console.log('d:', obj.d.toString());
    console.log('m:', obj.m.toString());
});

var symbols = Bacon.constant('qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ');

module.exports = {
    rsa: rsa,
    encryptor: function (stream, rsa) {
        return Bacon.combineWith(function (str, rsa, symbols) {
            return _.map(str, function (char) {
                var i = symbols.indexOf(char);
                i = BigNumber(i);
                return i.powm(rsa.e, rsa.m).toString();
            });
        }, stream, rsa, symbols);
    },

    decryptor: function (stream) {
        return Bacon.combineWith(function (data, rsa, symbols) {
            return _.reduce(data, function (memo, el) {
                el = BigNumber(el);
                var i = el.powm(rsa.d, rsa.m);
                return memo + symbols[i];
            }, '');
        }, stream, rsa, symbols);
    }
};