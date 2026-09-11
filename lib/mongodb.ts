import { MongoClient, Db, MongoClientOptions } from 'mongodb'

const uri = 'mongodb+srv://faymantap_db_user:0e6lM0ik0vQgcUli@cluster0.ignky5t.mongodb.net/?appName=Cluster0'
const options: MongoClientOptions = {}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, options)
    await cachedClient.connect()
  }

  cachedDb = cachedClient.db('am-nox')
  return cachedDb
}