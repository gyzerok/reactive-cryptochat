'use strict';

var BigNumber = require('bignumber.js');

BigNumber.prototype.powm = function (power, divisor) {
    power = new BigNumber(power);
    divisor = new BigNumber(divisor);

    var number = new BigNumber(this);

    var b = BigNumber(1);
    while (!power.eq(0)) {
        if (power.mod(2).eq(0)) {
            power = power.div(2);
            number = number.times(number).mod(divisor);
        }
        else {
            power = power.minus(1);
            b = b.times(number).mod(divisor);
        }
    }
    return b;
};

BigNumber.prototype.gcd = function (y) {
    y = new BigNumber(y);
    var x = new BigNumber(this);
    while (!y.eq(0)) {
        var c = x.mod(y);
        x = y;
        y = c;
    }
    return x.abs();
};

BigNumber.prototype.isPrime = function () {
    var n = new BigNumber(this);
    var i = BigNumber(2);
    while (i < 13) {
        if (!i.powm(n, n).eq(i.mod(n))) return false;
        i = i.plus(1);
    }
    return true;
};

module.exports = BigNumber;