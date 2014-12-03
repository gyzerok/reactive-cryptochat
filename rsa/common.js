'use strict';

var BigNumber = require('./BigNumber');
var _ = require('lodash');

module.exports = {
    randomBigNumber: function randomBigNumber() {
        var str = '' +(Math.random() * 9 + 1).toFixed(0);
        for (var i = 0; i < 2 - 1; i++) str += (Math.random() * 9).toFixed(0);
        return BigNumber(str);
    },

    generateE: function generateE(n) {
        var e = BigNumber(3);
        while (!e.gcd(n).eq(1)) e = e.plus(1);
        return e;
    },

    generateD: function generateD(n, e) {
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
    },

    generateM: function generateM(p, q) {
        return p.times(q);
    },

    generateN: function generateN(p, q) {
        return p.minus(1).times(q.minus(1));
    },

    encrypt: function encrypt(str, rsa, symbols) {
        return _.map(str, function (char) {
            var i = symbols.indexOf(char);
            i = BigNumber(i);
            return i.powm(rsa.e, rsa.m).toString();
        });
    },

    decrypt: function decrypt(data, rsa, symbols) {
        return _.reduce(data, function (memo, el) {
            el = BigNumber(el);
            var i = el.powm(rsa.d, rsa.m);
            return memo + symbols[i];
        }, '');
    }
};







