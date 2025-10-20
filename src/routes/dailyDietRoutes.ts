import { db } from "../database.ts";
import { app } from "../app.ts";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";


export async function dailyDietRoutes(app: FastifyInstance) {

    app.get('/', async () => {

        const userInfo = await db('user').select('*')

        return { userInfo }
    })

    app.post('/createUser', async(request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            total_meals_registered: z.number().optional(),
            total_meals_inside_diet: z.number().optional(),
            total_meals_outside_diet: z.number().optional(),
            best_diet_meal_sequence: z.number().optional(),
        })

        const { name, total_meals_registered, total_meals_inside_diet,
                total_meals_outside_diet, best_diet_meal_sequence
              } = createUserBodySchema.parse(request.body)
        

        await db('user').insert({
            id: randomUUID(),
            name,
            total_meals_registered,
            total_meals_inside_diet,
            total_meals_outside_diet,
            best_diet_meal_sequence
        })

        return reply.status(201).send()
    })

    app.post('/registerMeal', async(request, reply) => {
        const registerMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            meal_time: z.iso.datetime(),
            is_diet: z.boolean()
        })

        const {  name, description, meal_time, is_diet } = registerMealBodySchema
                                                                 .parse(request.body)

        await db('userMeal').insert({
            mealId: randomUUID(),
            name,
            description,
            meal_time,
            is_diet,
        })

        

        if (is_diet){ //#TODO: utilizar where para pegar o id da sessão do usuario
            await db('user')//.where()
                            .increment('total_meals_inside_diet', 1);
        }
        else{
            await db('user')//.where()
                            .increment('total_meals_outside_diet', 1);
        }

        await db('user')//.where()
                            .increment('total_meals_registered', 1);

        //#TODO: add sequencia de dietas

        return reply.status(200).send()

    })

    //#TODO: listar apenas com o id da sessão do usuario
    app.get('/listUserMeals', async() => {
        const userMeal = await db('userMeal').select('*')

        return { userMeal }
    })

  //  app.get('/meal', async() => {})

   // app.put('updateMeal', async(request, reply) => {})

   // app.delete('/deleteMeal', async(reply) => {})


}