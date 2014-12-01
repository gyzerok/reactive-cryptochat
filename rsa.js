'use strict';

require('./BigNumber');

// Log for debugging
var log = function (value) { console.log(value.toString()); };

var numbers = Bacon.fromPoll(10, function () {
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
    });

var pqpairs = primes.skipDuplicates(eq).slidingWindow(2, 2);

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
    })
    .filter(function (obj) {
        return obj.d.gt(0);
    })
    .filter(function (obj) {
        return !obj.e.eq(obj.d);
    })
    .take(1);

rsa.onValue(function (obj) {
    console.log(obj.e.toString(), obj.d.toString(), obj.m.toString())
});

module.exports = rsa;