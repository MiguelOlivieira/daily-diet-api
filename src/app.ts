import fastify from "fastify";
import { dailyDietRoutes } from "./routes/dailyDietRoutes.ts";

export const app = fastify()


app.register(dailyDietRoutes, {
    prefix: 'dailydiet',
})