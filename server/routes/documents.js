const router = require('express').Router()
const Document = require('../Document.js')

router.get('/', async (req, res) => {
  try {
    const documents = await Document.find()
    res.json(documents)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
    res.json(document)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const updatedDocument = await Document.findById(req.params.id)

  updatedDocument.title = req.body.title

  try {
    const document = await updatedDocument.save()
    if (!document) {
      throw Error('Something went wrong with saving the document.')
    }
    res.json(document)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deletedDocument = await Document.findByIdAndDelete(req.params.id)
    if (!deletedDocument) {
      throw Error('Something went wrong with deleting the document.')
    }
    res.json({ msg: `Deleted document: ${deletedDocument}` })
  } catch (err) {
    res.status(400).json({ error: e.message, success: false })
  }
})

module.exports = router
