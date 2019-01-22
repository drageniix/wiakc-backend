const fetch = require("node-fetch");

module.exports = country =>
  fetch("https://restcountries.eu/rest/v2/name/" + country)
    .then(res => res.json())
    .then(json => json[0].flag);
