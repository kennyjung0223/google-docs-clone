const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const Document = require('./Document.js')
require('dotenv').config()

const PORT = process.env.PORT || 3001
const URI = process.env.ATLAS_URI

const app = express()
app.use(express.json())
app.use(cors())

mongoose
  .connect(URI, {})
  .then(() =>
    console.log('MongoDB database connection established successfully')
  )
  .catch((err) => console.log(err))

const io = require('socket.io')(
  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
  }),
  {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  }
)

const defaultValue = ''
const defaultTitle = 'Untitled Document'

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit('load-document', document.data)

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta)
    })

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({
    _id: id,
    title: defaultTitle,
    data: defaultValue,
  })
}

const documents = require('./routes/documents')

app.use('/documents', documents)
