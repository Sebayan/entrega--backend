const connectToDd = require('../DB/config/connectToMongo')
const { userModel } = require('../DB/model/mongoDbModel')

const bcrypt = require('bcrypt')
const saltRounds = 10


class Container {

  constructor( schema ) {
      this.schema = schema
  }
  

  async checkUser( email, password ) {
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({ email: email })
      if ( documentInDb.length > 0 ) {
        if ( bcrypt.compareSync( password, documentInDb[0].password ) ) {
          return { msg: '', result: true }
        } else {
          return { msg: 'Contrasena incorrecta', result: false }
        }
      } 
      return { msg: 'No existe usuario', result: false }
    } catch(err) {
      console.log(`Error: ${err}`)
    }
  }

  
  async addUser( email, password ) {
    try{
      await connectToDd()
      const documentInDb = await this.schema.find({ email: email })
      if ( documentInDb.length === 0 ) {
        const encriptedPassword = bcrypt.hashSync(password, saltRounds)
        await connectToDd()
        const newUser = new userModel({ email: email, password: encriptedPassword })
        await newUser.save()
          .then(user => console.log(`Se ha agregado a la base de datos elemento con id: ${user._id}`))
          .catch(err => console.log(err))
        return true
      } else {
        return false
      }
    } catch(err) {
      console.log(`Error: ${err}`)
    }
  }

}


const users = new Container( userModel )
module.exports = { users } 