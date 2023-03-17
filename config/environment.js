const parseArgs = require('minimist')(process.argv.slice(2)) // ejemplo -> nodemon src/main.js -p 8080 -m FORK
const config = {
  port: parseArgs.p,
  mode: parseArgs.m,
  same: parseArgs.a
}

require('dotenv').config()
const staticFiles = process.env.STATICFILES


module.exports = { config, staticFiles }