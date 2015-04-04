/* @flow */

var _ = require('lodash');

var IP = [
    57, 49, 41, 33, 25, 17, 9,  1, 59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
    56, 48, 40, 32, 24, 16, 8,  0, 58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6
];

var IP1 = [
    39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9,  49, 17, 57, 25, 32, 0, 40, 8,  48, 16, 56, 24
];

var E = [
    31, 0,  1,  2,  3,  4,
    3,  4,  5,  6,  7,  8,
    7,  8,  9,  10, 11, 12,
    11, 12, 13, 14, 15, 16,
    15, 16, 17, 18, 19, 20,
    19, 20, 21, 22, 23, 24,
    23, 24, 25, 26, 27, 28,
    27, 28, 29, 30, 31, 0
];

var P = [
    15, 6,  19, 20, 28, 11, 27, 16,
    0,  14, 22, 25, 4,  17, 30, 9,
    1,  7,  23, 13, 31, 26, 2,  8,
    18, 12, 29, 5,  21, 10, 3,  24
];

var S = [
    [
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
        [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
        [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
        [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
    ],
    [
        [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
        [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
        [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
        [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
    ],
    [
        [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
        [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
        [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
        [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
    ],
    [
        [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
        [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
        [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
        [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
    ],
    [
        [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
        [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
        [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
        [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
    ],
    [
        [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
        [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
        [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
        [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
    ],
    [
        [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
        [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
        [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
        [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
    ],
    [
        [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
        [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
        [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
        [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
    ]
];

var CD = [
    56, 48, 40, 32, 24, 16, 8,  0,  57, 49, 41, 33, 25, 17,
    9,  1,  58, 50, 42, 34, 26, 18, 10, 2,  59, 51, 43, 35,
    62, 54, 46, 38, 30, 22, 14, 6,  61, 53, 45, 37, 29, 21,
    13, 5,  60, 52, 44, 36, 28, 20, 12, 4,  27, 19, 11, 3
];
var CP = [
    13, 16, 10, 23, 0,  4,  2,  27, 14, 5,  20, 9,  22, 18, 11, 3,
    25, 7,  15, 6,  26, 19, 12, 1,  40, 51, 30, 36, 46, 54, 29, 39,
    50, 44, 32, 47, 43, 48, 38, 55, 33, 52, 45, 41, 49, 35, 28, 31
];

type Binary = Array<number>;

/**
* Splits integer into array of bits
*/
function splitInt(num: number, bits: number = 8): Binary {
    var ret = [];

    for (var i = bits - 1; i >= 0; i--) {
        ret[i] = num & 1;
        num >>= 1;
    }

    return ret;
}

/**
* Splits string into array of bits
*/
function splitStr(str: string): Binary {
    var ret = _.map(str, char => splitInt(char.charCodeAt(0)));
    return _.flatten(ret);
}

/**
* Converts array of bits into string
*/
function joinInt(bits: Binary): number {
    return _.reduce(bits, (memo, bit, index) => {
        return memo + bit * Math.pow(2, bits.length - index - 1);
    }, 0);
}

/**
* Converts array of binaries into string
*/
function joinStr(code: Array<Binary>): string {
    var xs = _.flatten(code);
    var chunks = _.chunk(xs, 8);
    chunks = _.map(chunks, chunk => String.fromCharCode(joinInt(chunk)));
    return chunks.join('');
}

/**
* Permutes an array
*/
function permute(source: Binary, perm: Array<number>): Binary {
    var ret = [];

    for (var i = 0; i < perm.length; i++) {
        ret[i] = source[perm[i]];
    }

    return ret;
}

function createSubkey(key: string, round: number): Binary {
    var bitkey = splitStr(key);
    var cd = permute(bitkey, CD);
    cd = _.chunk(bitkey, 28);
    var c = cd[0];
    var d = cd[1];

    var shiftsLeft = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
    var shiftsRight = [0, 1, 3, 5, 7, 9, 11, 13, 14, 16, 18, 20, 22, 24, 26, 27];
    var shifts = encrypt ? shiftsLeft : _.map(shiftsRight, x => -x);

    var newC = [], newD = [];
    for (var i = 0; i < 16; i++) {
        var index = (28 + (i - shifts[i] % 28)) % 28;
        newC[index] = c[i];
        newD[index] = d[i];
    }

    var subkey = newC.concat(newD);
    return permute(subkey, CP);
}

function xor(xs: Binary, ys: Binary): Binary {
    return _.map(xs, (x, i) => x ^ ys[i]);
}

function feistelFunc(bits: Binary, subkey: Binary): Binary {
    bits = permute(bits, E);
    var bs = _.chunk(bits, 6);
    bs = _.map(bs, (b, bi) => {
        var x = joinInt([b[0], b[5]]);
        var y = joinInt([b[1], b[2], b[3], b[4]]);

        return splitInt(S[bi][x][y]);
    });
    bs = _.flatten(bs);
    return permute(bs, P);
}

function feistelRound(bits: Binary, key: string, round: number, encrypt: boolean): Binary {
    var subkey = createSubkey(key, round, encrypt);
    var lr = _.chunk(bits, 32);

    var left, right;
    if (encrypt) {
        left = lr[1];
        right = xor(lr[0], feistelFunc(lr[1], subkey));
    }
    else {
        right = lr[0];
        left = xor(lr[1], feistelFunc(lr[0], subkey));
    }

    return left.concat(right);
}

function desChunk(chunk: Binary, key: string, ecnrypt: boolean): Binary {
    var bits = permute(chunk, IP);

    for (var i = 0; i < 16; i++) {
        bits = feistelRound(bits, key, i, ecnrypt);
    }

    return permute(bits, IP1);
}

function encrypt(str: string, key: string): string {
    var mod = 8 - str.length % 8;
    for (var i = 0; i < mod; i++) str += '.';
    var bits = splitStr(str);
    var chunks = _(bits)
        .chunk(64)
        .map(chunk => desChunk(chunk, key, true))
        .value();
    return _.trim(joinStr(chunks));
}

function decrypt(str: string, key: string): string {
    var bits = splitStr(str);
    var chunks = _(bits)
        .chunk(64)
        .map(chunk => desChunk(chunk, key, false))
        .value();
    return _.trim(joinStr(chunks));
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
};

var key = 'hello!!!';
var a = encrypt('hello', key);
console.log(a);
var b = decrypt(a, key);
console.log(b);
