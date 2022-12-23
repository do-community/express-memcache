/**
 * Find the largest prime number less than or equal to `n`
 * @param {number} n A positive integer greater than the smallest prime number, 2
 * @returns {number}
 */
module.exports = function (n) {
  let prime = 2; // initialize with the smallest prime number
  for (let i = n; i > 1; i--) {
    let isPrime = true;
    for (let j = 2; j < i; j++) {
      if (i % j == 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      prime = i;
      break;
    }
  }
  return prime;
};
