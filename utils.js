const openpgp = require('openpgp');
const axios = require('axios');
const config = require('./config.json');

const api_url = config.api.host;

const http = axios.create({
  baseURL: api_url,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${config.api.token}`
  }
});

/**
 * Get the public keys for all the subscribers calling the restful api
 *
 * @param {*} topic
 * @returns array of string
 */
async function getPubKeys(topic) {
  // Call api and get subscribers pub keys
  topic = topic.replace(/\//g, "-");
  if (topic.charAt(0) === '-') {
    topic = topic.substr(1);
  }
  return await http.get(`pub-key/${topic}`)
  .then(function (response) {
    // handle success
    let keys = [];
    response = response.data;
    if (response && response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        keys.push(response[i].pub_key)
      }
    }
    return keys
  })
  .catch(function (error) {
    // handle error
    return [];
  })
}


async function encryptWithMultiplePublicKeys(pubkeys, message) {
  let pubs = [], pgp_key;
  for (let i = 0; i < pubkeys.length; i++) {
    pgp_key = (await openpgp.key.readArmored(pubkeys[i])).keys[0];
    pubs.push(pgp_key);
  }
  // let pubs = (await openpgp.key.readArmored(pubkeys[0])).keys;
  const options = {
    message: openpgp.message.fromText(message),
    publicKeys: pubs,     // for encryption
  }
  return openpgp.encrypt(options).then(ciphertext => {
    encrypted = ciphertext.data;
    return encrypted
  });
};

module.exports = {
  http: http,
  getPubKeys: getPubKeys,
  encryptWithMultiplePublicKeys: encryptWithMultiplePublicKeys
}
