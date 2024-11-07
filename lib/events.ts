'use server'

import { db } from './db'

export const getAllEvents = async () => {
    const events = await db.event.findMany()
    return events
}