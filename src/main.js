const { config, staticFiles } = require('../config/environment')
const express = require('express')

const { logger, loggererr } = require('../log/logger')

const cluster = require('cluster')
const numCPUs = require('os').cpus().length

const baseProcces = () => {

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Proceso ${worker.process.pid} caido!`)
    cluster.fork()
  })

  const expressSession = require('express-session')
  const { Server: HttpServer } = require('http')
  const { Server: Socket } = require('socket.io')
  const app = express()
  const httpServer = new HttpServer(app)
  const io = new Socket(httpServer)

  const productRouter = require('../routes/productRouter')
  const sessionRouter = require('../routes/sessionRouter')
  const infoRouter = require('../routes/infoRouter')

  const MongoStore = require('connect-mongo')
  const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

  const { products } = require('../class/productContainer')
  const { chats } = require('../class/chatContainer')

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(staticFiles))
  app.use(expressSession({
    store: MongoStore.create({
      mongoUrl: process.env.MONGOCREDENTIALSESSION,
      mongoOptions: advancedOptions
    }),
    secret: 'secret-pin',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000
    }
  }))
  
  
  io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!')

    socket.emit('productos', await products.getAll())
 
    socket.on('update', async producto => {
      await products.add( producto )
      io.sockets.emit('productos', await products.getAll())
    })
  
    socket.emit('mensajes', await chats.getAll())

    socket.on('newMsj', async mensaje => {
      mensaje.date = new Date().toLocaleString()
      await chats.add( mensaje ) 
      io.sockets.emit('mensajes', await chats.getAll())
    })

  })


  app.use('/session', sessionRouter)

  app.use('/api', productRouter)

  app.use('/info', infoRouter)

  app.get('*', (req, res) => {
    logger.warn(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
    res.send(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
  })


  let PORT = ( config.port) ? config.port : 8080 // puerto por defecto 8080

  if ( config.mode === 'CLUSTER') { // para CLUSTER si la clave same es 1 crea un puerto para cada worker
    PORT = config.same === 1 ? PORT + cluster.worker.id - 1 : PORT
  } 

  const server = httpServer.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
  })
  server.on('error', error => loggererr.error(`Error en servidor ${error}`))
  
}


if ( config.mode != 'CLUSTER' ) { 

  console.log('Server en modo FORK')
  console.log('-------------------')
  baseProcces()
  } else { 
  
    if (cluster.isPrimary) {
      console.log('Server en modo CLUSTER')
      console.log('----------------------')
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }
    } else {
      baseProcces()
    }
  }