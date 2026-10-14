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

function toStatsResult(result: StatsDocument | null): StatsResult {
  return {
    total: result?.totalPremium || 0,
    today: result?.todayPremium || 0
  }
}

export async function getStats(): Promise<StatsResult> {
  const collection = await getStatsCollection()
  const today = getTodayDateString()

  // Pipeline + upsert keeps initialization and the daily reset atomic.
  const result = await collection.findOneAndUpdate(
    { _id: 'global' },
    [
      {
        $set: {
          totalPremium: { $ifNull: ['$totalPremium', 0] },
          todayPremium: {
            $cond: [
              { $eq: ['$lastDate', today] },
              { $ifNull: ['$todayPremium', 0] },
              0
            ]
          },
          lastDate: today
        }
      }
    ],
    {
      upsert: true,
      returnDocument: 'after'
    }
  )

  return toStatsResult(result)
}

export async function incrementStats(): Promise<StatsResult> {
  const collection = await getStatsCollection()
  const today = getTodayDateString()

  // A single atomic update avoids duplicate-key errors and lost increments
  // when multiple successful verifications finish at the same time.
  const result = await collection.findOneAndUpdate(
    { _id: 'global' },
    [
      {
        $set: {
          totalPremium: {
            $add: [{ $ifNull: ['$totalPremium', 0] }, 1]
          },
          todayPremium: {
            $cond: [
              { $eq: ['$lastDate', today] },
              { $add: [{ $ifNull: ['$todayPremium', 0] }, 1] },
              1
            ]
          },
          lastDate: today
        }
      }
    ],
    {
      upsert: true,
      returnDocument: 'after'
    }
  )

  return toStatsResult(result)
}
