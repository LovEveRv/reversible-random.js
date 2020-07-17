// reversible-random.js
// ----------
// This JS module provides the class 'ReversibleRandom',
// which is a "reversible" PRNG with the ability to generate the previous random number.
// That is, you can use 'next' to move to the next state, and use 'prev' to move to the previous state.
// ----------
// This PRNG works with the Linear Congruence Algorithm.
// You are free to create a RNG with your own arguments (a, c, m and inv_a).
// If you did not provide inv_a, it will be calculated automatically.
// ----------
// As for detailed usage and more detailed description, please see README.md,
// or visit: https://github.com/LovEveRv/reversible-random.js


/*
==============
Util functions
==============
*/

// Extended Euclidean Algorithm.
// Note:
// this function uses the type 'BigInt',
// which may not be supported in early JS versions.
function exgcd (a, b, vec2) {
  if (b == 0) {
    vec2.x = BigInt(1);
    vec2.y = BigInt(0);
    return a;
  }
  var r = exgcd(b, a % b, vec2);
  var tmp = BigInt(vec2.y);
  vec2.y = vec2.x - (a / b) * vec2.y;
  vec2.x = tmp;
  return r;
}

// Find the inverses of a (mod n).
// That is, find x s.t. a * x % n = 1.
// Note:
// this function uses the type 'BigInt',
// which may not be supported in early JS versions.
function getInverses (a, n) {
  var vec2 = {
    x: BigInt(0),
    y: BigInt(0)
  };
  exgcd(BigInt(a), BigInt(n), vec2); // We don't need the gcd of a and n.
  let nn = BigInt(n);
  return (vec2.x % nn + nn) % nn;
}


/*
================
Class Definition
================
*/

// Note:
// The implementation of ReversibleRandom class uses the type 'BigInt',
// which may not be supported in early JS versions.
// However, the type of the return value is 'Number'
// so it's safe to directly do comparison, calculation and so on with the return value.
// ----------
// Note:
// If you manually provide inv_a, make sure IT IS the inverses of a (mod m).
// Also make sure a and m are coprime numbers.
// Otherwise, there will not be a certain inv_a, thus this RNG cannot work properly.
class ReversibleRandom {
  constructor (a, c, m, inv_a = undefined) {
    this.a = BigInt(a);
    this.c = BigInt(c);
    this.m = BigInt(m);
    this.RAND_MAX = BigInt(m - 1);
    if (inv_a) {
      this.inv_a = BigInt(inv_a);
      console.assert(
        this.a * this.inv_a % this.m == 1,
        'Error: the provided inv_a is not the inverses of a (mod m)!'
      );
    }
    else {
      this.inv_a = getInverses(a, m);
      console.assert(
        this.a * this.inv_a % this.m == 1,
        'Error: the provided a and m are not coprime!'
      );
    }
    
    this.cur = BigInt(Math.floor(Math.random() * m)) % this.m;
  }
  setInitial (i) {
    this.cur = BigInt(i);
    console.assert(
      this.cur < this.m && BigInt(0) <= this.cur,
      'Error: initial number i exceeds [0, RAND_MAX]!'
    );
  }
  next () {
    this.cur = (this.cur * this.a + this.c) % this.m;
	  return Number(this.cur);
  }
  prev () {
    var n = (this.cur + this.m - this.c) % this.m;
    this.cur = n * this.inv_a % this.m;
	  return Number(this.cur);
  }
  curr () {
    return Number(this.cur);
  }

  // Simple wrap for operations with ranges.
  // Attention: [min, max] is left-closed-right-closed.

  setRangeInitial (i, min, max) {
    console.assert(
      min <= i && i <= max,
      'Error: initial number i exceeds [min, max]!'
    );
    var len = BigInt(max - min + 1);
    var rand = Math.floor(Math.random() * (Number(this.m / len) - 1));
    rand = BigInt(rand);
    this.cur = BigInt(i) + rand * len;
  }
  rangeNext (min, max) {
    this.next();
    return Number(this.cur % BigInt(max - min + 1) + BigInt(min));
  }
  rangePrev (min, max) {
    this.prev();
    return Number(this.cur % BigInt(max - min + 1) + BigInt(min));
  }
  rangeCurr (min, max) {
    return Number(this.cur % BigInt(max - min + 1) + BigInt(min));
  }
}

exports.ReversibleRandom = ReversibleRandom
