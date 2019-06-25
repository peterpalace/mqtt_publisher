const mqtt = require('mqtt');
const config = require('./config.json');
const utils = require('./utils.js');

const username = config.broker.username;
const psw = config.broker.password;
const topic = `/${username}/pm10`;
const client = mqtt.connect(`${config.broker.host}`, {
  username: username,
  password: psw,
  rejectUnauthorized: false
});
/*const SDS011Client = require("sds011-client");

const sensor = new SDS011Client("/dev/ttyUSB0");
Promise
  .all([sensor.setReportingMode('active'),
  sensor.setWorkingPeriod(config.sensor.working_period)])
    .then(() => {
      // everything's set
    });*/

client.on('connect', () => {
  // TODO cache getPubKeys response
  setInterval(() => {
    message = "100";
  // sensor.on('reading', (data) => {
  //  message = data.pm10;
    let pubkeys = utils.getPubKeys(topic);
    pubkeys.then((keys) => {
      if (keys.length > 0) {
        utils.encryptWithMultiplePublicKeys(keys, String(message)).then((msg) => {
          client.publish(topic, msg);
        }).catch((err) => {
          console.error(err);
        });
      }
    })
  //});
  }, 2000)
});
