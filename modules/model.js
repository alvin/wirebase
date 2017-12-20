//import idMethod from 'shortid'
import idMethod from 'firebase-auto-ids'

import firebase from 'firebase'
require("firebase/firestore")
import firebaseConfig from '../config/firebase'
import models from '../config/models'

const getQueryDocs = (querySnapshot) => {
  var docs = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    docs.push(Object.assign(data, {id: doc.id }));
  })    
  return docs
}

const loadModelConfig = (collectionName) => {
  const modelConfig = models[collectionName]
  return Object.assign({collection: collectionName}, modelConfig ? modelConfig : {})
}

const firebaseLoader = async () => {
  if (window.firebase) return window.firebase
  else {
    window.firebase = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
    return window.firebase.firestore().enablePersistence().then(() => {
      return firebase
    }).catch((err) => {
      return firebase
    })  
  }  
}
const firestoreLoader = async () => {
    var fb = await firebaseLoader()
    return fb.firestore()
}

export default class Model {
  
  constructor (collectionName, config) {
    
    const opts = this.opts = loadModelConfig(collectionName)
    
    this.collection = opts.collection
    if (!this.collection) console.log('Error, no collection configured.')
    
    this.storageFields = opts.storageFields || []
    this.relationships = opts.relationships || []
    this.foreignKey = opts.foreignKey || `${this.collection}Ref`
  }
  
  async getRef () {
    if (!this.db) this.db = await firestoreLoader()
    if (!this.firebase) this.firebase = await firebaseLoader()
    if (!this.firebase) console.log('Error, firebase could not be initialized.')
    return await this.db.collection(this.collection)
  }
    
  async get (id) {
    const ref = await this.getRef(id)
    return ref.doc(id).get()
      .then(async (result) => {
        if (!result.exists) return {}
        const data = result.data();
        return Object.assign(data, {id: result.id})
      })
     .catch((err) => console.log(err))
  }
  
  async write (id = idMethod(Date.now()), inData) {
    var data = Object.assign({}, inData)
    
    for (let storageField of this.storageFields) {
      if (data[storageField] && typeof(data[storageField]) == 'object' && data[storageField].blob) {
        const fileLocation = `${id}/${storageField}`
        const uploadedUrl = await this.uploadBlobToStorage(fileLocation, data[storageField])
        console.log('model has found upload successful', uploadedUrl)
        if (uploadedUrl) { 
          data[storageField] = uploadedUrl
          data[`${storageField}StorageLocation`] = fileLocation
          console.log(`${storageField} was stored at ${uploadedUrl}` )
        } else { 
          data[storageField] = inData[storageField] ? inData[storageField]  : ''
          console.log('There was an error uploading data for ' + active )
        }
      }
    }
    
    const ref = await this.getRef()
    return ref.doc(id).set(data)
      .then(() => {
        console.log('wrote data', data)
        return Object.assign(data, {id: id})
      })
      .catch((err) => console.log(err))

  }
  
  async update (id, data) {
    return this.get(id)
      .then((doc) => {
        if (doc) this.write(id, data)
      })  
  }
  
  async create (data) {
    return this.write(undefined, data)
  }
  
  async getDocsWhere (field,op,value) {
    const ref = await this.getRef()
    
    return ref.where(field,op,value).get()
     .then(async (querySnapshot) => {
       return await getQueryDocs(querySnapshot)
     })
     .catch((err) => console.log(err))
  }

  async getDocsWhen (field,op,value, callback) {
    const ref = await this.getRef()
    
    return ref.where(field,op,value)
      .onSnapshot(async (querySnapshot) => {
        callback(getQueryDocs(querySnapshot))
      })
  }
  
  async delete (id) {
    return this.get(id)
      .then(async (existingDoc) => {
        if (!existingDoc) {
          console.log(`${this.collection} with id ${id} not found`)
          return false
        } else {
          console.log(`${this.collection} with id ${id} found`)
          for (let r of this.relationships) {
            
            const relationshipType = Object.keys(r)[0]
            const collectionName = r[relationshipType]
            console.log(`deleting ${relationshipType} ${collectionName}`)
            
            if (!loadModelConfig(collectionName)) console.log('Warning: on', this.collection, 'the', collectionName, 'relationship may be incorrectly configured!')
            else {
              const modelInstance = new Model(collectionName)      
              if (relationshipType == 'hasOne') await modelInstance.delete(id).catch((err) => console.log(err))

              if (relationshipType == 'hasMany') { 
                const docs = await modelInstance.getDocsWhere(this.foreignKey, "==", id).catch((err) => console.log(err))

                for (let doc of docs) { 
                  await modelInstance.delete(doc.id) 
                }
              }

            }
          }
    
          for (let storageField of this.storageFields) {
            const fileLocation = existingDoc[`${storageField}StorageLocation`]
            if (fileLocation) {
              const firebase = await firebaseLoader()
              console.log(`deleting stored ${storageField} ${fileLocation}`)
              await this.deleteStoragePath(fileLocation)
            }
          }
    
          const ref = await this.getRef()
          return await ref.doc(id).delete()
            .catch((err) => console.log(err))

          
        }
      })  
  }
  
  
  async uploadBlobToStorage (fileLocation, fileData) {
    if (!this.firebase) this.firebase = await firebaseLoader()
    
    console.log('Uploading - attempt', fileLocation, fileData);    
    var uploadRef = this.firebase.storage().ref().child(`${fileLocation}`)
    const uploadedUrl = await uploadRef.put(fileData.blob)
      .then((snapshot) => {
        console.log('upload snapshot', snapshot)
        if (snapshot.state == 'success') { 
          return snapshot.downloadURL
        }
      })
      .catch((err) => {
        console.log('Error uploading', err)
      })
      
      return uploadedUrl
  }
  
  async deleteStoragePath (fileLocation) {

    //  api is different on client vs. server
    
    if (typeof(window) == 'object') { // client
      
      return firebase.storage().ref()
        .child(fileLocation)                  
        .delete()
        .catch((err) => console.log('ERROR:', err))   
    
    } else { // server
      
      return firebase.storage().bucket()
        .file(fileLocation)
        .delete()
        .then(() => {
          console.log(`gs://${firebase.storage().bucket()}/${fileLocation} deleted.`);
        })
        .catch(err => {
          console.log('ERROR:', `gs://${firebase.storage().bucket()}/${fileLocation} deleted.`, err);
        })
        
    }
    
  }
  
}