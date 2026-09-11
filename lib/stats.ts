import { connectToDatabase } from './mongodb'
import { Collection } from 'mongodb'

export interface StatsDocument {
  _id: string
  totalPremium: number
  todayPremium: number
  lastDate: string
}

export interface StatsResult {
  total: number
  today: number
}

function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

async function getStatsCollection(): Promise<Collection<StatsDocument>> {
  const db = await connectToDatabase()
  return db.collection<StatsDocument>('stats')
}

export async function getStats(): Promise<StatsResult> {
  const collection = await getStatsCollection()
  const today = getTodayDateString()

  let doc = await collection.findOne({ _id: 'global' })

  if (!doc) {
    doc = {
      _id: 'global',
      totalPremium: 0,
      todayPremium: 0,
      lastDate: today
    }

    await collection.insertOne(doc)
  }

  if (doc.lastDate !== today) {
    await collection.updateOne(
      { _id: 'global' },
      {
        $set: {
          todayPremium: 0,
          lastDate: today
        }
      }
    )

    doc.todayPremium = 0
    doc.lastDate = today
  }

  return {
    total: doc.totalPremium || 0,
    today: doc.todayPremium || 0
  }
}

export async function incrementStats(): Promise<StatsResult> {
  const collection = await getStatsCollection()
  const today = getTodayDateString()

  const doc = await collection.findOne({
    _id: 'global'
  })

  if (!doc) {
    const newDoc: StatsDocument = {
      _id: 'global',
      totalPremium: 1,
      todayPremium: 1,
      lastDate: today
    }

    await collection.insertOne(newDoc)

    return {
      total: 1,
      today: 1
    }
  }

  let result: any

  if (doc.lastDate !== today) {
    result = await collection.findOneAndUpdate(
      { _id: 'global' },
      {
        $inc: {
          totalPremium: 1
        },
        $set: {
          todayPremium: 1,
          lastDate: today
        }
      },
      {
        returnDocument: 'after'
      }
    )
  } else {
    result = await collection.findOneAndUpdate(
      { _id: 'global' },
      {
        $inc: {
          totalPremium: 1,
          todayPremium: 1
        },
        $set: {
          lastDate: today
        }
      },
      {
        returnDocument: 'after'
      }
    )
  }

  // Menangani kompatibilitas return MongoDB Driver v4/v5 (result.value) dan v6+ (result)
  const updatedDoc = (result?.value || result) as StatsDocument | null

  return {
    total: updatedDoc?.totalPremium || 0,
    today: updatedDoc?.todayPremium || 0
  }
}
