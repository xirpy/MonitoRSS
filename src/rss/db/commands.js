const UPDATE_SETTINGS = { upsert: true, strict: true }
const config = require('../../config.js')
const mongoose = require('mongoose')

exports.findAll = async Model => {
  // Database
  if (mongoose.connection.name) return Model.find({}).lean().exec()

  // Memory
  return Model
}

exports.update = async (Model, article) => {
  const toUpdate = { id: article._id }
  if (article.title) {
    toUpdate.title = article.title.toLowerCase()
  }
  if (article.customComparisons) {
    toUpdate.customComparisons = article.customComparisons
  }
  // Database
  if (mongoose.connection.name) {
    if (config.dev === true) return
    return Model.updateOne({ id: toUpdate.id }, { $set: toUpdate }, UPDATE_SETTINGS).exec()
  }

  // Memory
  for (var x = 0; x < Model.length; ++x) {
    const doc = Model[x]
    if (doc.id === article._id && article.customComparisons) doc.customComparisons = article.customComparisons
  }
}

exports.bulkInsert = async (Model, articles) => {
  if (articles.length === 0) return
  const insert = []
  // Database
  if (mongoose.connection.name) {
    articles.forEach(article => {
      const data = { id: article._id }
      if (article.title) {
        data.title = article.title.toLowerCase()
      }
      insert.push(new Model())
    })
    if (config.dev === true) return
    return Model.collection.insertMany(insert)
  }

  // Memory
  for (var x = 0; x < articles.length; ++x) {
    const obj = { ...articles[x] }
    obj.id = obj._id
    delete obj._id
    Model.push(obj)
  }
}
