/* eslint-disable no-unused-vars */
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const multer = require('multer')
const fs = require('fs-extra')
const path = require('path')
app.use(bodyParser.urlencoded({ extended: true }))

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

const databseUrl = require('./config').database_url
const databaseName = require('./config').db
const collectionName = require('./config').collection_name
const port = require('./config').port

console.log(require('./config'))
const client = new MongoClient(databseUrl)

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({ storage: storage })

client.connect((err) => {
  if (err) throw err
  app.listen(port || 3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.post('/uploadphoto', upload.single('picture'), (req, res) => {
  if (req.file) {
    const img = fs.readFileSync(req.file.path)
    const encodeImage = img.toString('base64')
    const db = client.db(databaseName)
    const finalImg = {
      contentType: req.file.mimetype,
      image: Buffer.from(encodeImage, 'base64')
    }
    db.collection(collectionName).insertOne(finalImg, (err, result) => {
      if (err) {
        res.status(500)
        res.json({
          message: err.message
        })
      }
      res.status = 201
      res.json({
        success: true,
        message: 'Added image successfully',
        id: result.ops.map((element) => element._id)
      })
    })
  } else {
    res.status(400)
    res.json({ message: 'No Image in request' })
  }
})

app.get('/photos', (req, res) => {
  const db = client.db(databaseName)
  db.collection(collectionName).find().toArray((err, result) => {
    const imgArray = result.map(element => element._id)
    if (err) return console.log(err)
    res.send(imgArray)
  })
})

app.get('/photo/:id', (req, res) => {
  const filename = req.params.id
  const db = client.db(databaseName)
  db.collection(collectionName).findOne({ _id: ObjectId(filename) }, (err, result) => {
    if (err) return console.log(err)
    res.contentType('image/jpeg')
    res.send(result.image.buffer)
  })
})
