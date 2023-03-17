const connectToDd = require('../DB/config/connectToMongo')
const { productModel } = require('../DB/model/mongoDbModel')


class Container {

  constructor( schema ) {
      this.schema = schema
  }
  

  async getAll() {
    try{
      await connectToDd()
      const documentsInDb = await this.schema.find()
      return documentsInDb
    } catch(err) {
      console.log(`Error: ${err}`)
    }
  }
 


  async getById( id ) {
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({_id: id})
      return documentInDb ? documentInDb : null

    } catch(err) {
      console.log(`Error: ${err}`)
    }
  }


  async deleteById( id ) {  
    try {
      await connectToDd()
      await this.schema.deleteOne({ _id: id })
      return 
    } catch(err) {
      console.log(`Error: ${err}`)
      return false
    }
  }


  async deleteAll() {
    try {
      await connectToDd()
      await this.schema.deleteMany()
      return 
    } catch(err) {
      console.log(`Error: ${err}`)
      return false
    }
  }


  async add( item ) {
    try{
      await connectToDd()
      const newProduct = new productModel( item )
      await newProduct.save()
        .then(product => console.log(`Se ha agregado a la base de datos elemento con id: ${product._id}`))
        .catch(err => console.log(err))
      return
    } catch(err) {
      console.log(`Error: ${err}`)
    }
  }

}

const products = new Container( productModel )

module.exports = { products } 