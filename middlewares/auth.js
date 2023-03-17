const passport = require('passport')
const { Strategy } = require('passport-local')
const LocalStrategy = require('passport-local').Strategy

const decodedToken = require('./googleauth')
const { logger, loggererr } = require('../log/logger')

const { users } = require('../class/userContainer')


passport.use('login', new LocalStrategy(
  async function( username, password, done ) {
    const validateUser = await users.checkUser (username, password)
    if ( validateUser.result ) {     
      return done( null, { username: username } )
    } else {
      logger.info(`Usuario o contrasena incorrectos.`)
      return done( null, false )
    }
  }
))



passport.use('googleauth', new Strategy(
  async function ( username, password, done ) {
    const googleUser = await decodedToken( password )
    const userInDb = await users.checkUser ( username, '' )
    if ( userInDb.msg != 'No existe usuario' & googleUser.email === username ) { // usuario ya cargado en base de datos       
      return done ( null, { username: username })
    } 
    if ( userInDb.msg === 'No existe usuario' & googleUser.email === username ) {
      await users.addUser (username, password)
      return done ( null, { username: username })
    }
    logger.info(`Usuario no valido`)
    return done( null, false)
  }
))



passport.use('register', new LocalStrategy(
  async function( username, password, done ) {
    if ( await users.addUser (username, password ) ) {
      return done( null, { username: username } )
    } else {
      logger.info(`No se ha podido registrar Usuario.`)
      return done( null, false )
    }
  }
))


passport.serializeUser(function(user, done) {
  done(null, user.username)
})

passport.deserializeUser(function(username, done) {
  done(null, { username: username })
})