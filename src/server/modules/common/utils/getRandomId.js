
module.exports = function getRandomId() {
  function randomToken() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return randomToken() + randomToken() + randomToken() + randomToken();
}
