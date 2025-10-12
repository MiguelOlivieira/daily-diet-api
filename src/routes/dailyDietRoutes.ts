import { db } from "../database.ts";
import { app } from "../app.ts";
import type { FastifyInstance } from "fastify";

export async function dailyDietRoutes(app: FastifyInstance) {

    app.get('/', async () => {

        const userInfo = await db('user').select('*')

        return { userInfo }
    })
   
}