import { db } from "../database.ts";
import { app } from "../app.ts";
import { number, z } from "zod";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";




export async function dailyDietRoutes(app: FastifyInstance) {

    let dietSequenceAux = 0

    app.get('/', async () => {

        const userInfo = await db('user').select('*')

        return { userInfo }
    })

    //#TODO: listar apenas com o id da sessão do usuario
    app.get('/listUserMeals', async (request) => {

        const { sessionId } = request.cookies
        console.log(sessionId)

        

        const userMeal = await db('userMeal').innerJoin('user', 'user.id', 'userMeal.user_id').where('user.session_id', sessionId).select('userMeal.*')

        return { userMeal }
    })


    //selecionar meal pelo id
    app.get(
        '/meal/:id',

        async (request) => {

            const getUserParam = request.params as { id: string }
            const mealId = getUserParam.id
            const meal = await db('userMeal').select('*').where('mealId', mealId)


            return { meal }


        })


    //#TODO: Para multiplos usuarios, criar multiplos cookies.
    app.post('/createUser', async (request, reply) => {
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

        let sessionId = request.cookies.sessionId

            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })


               console.log(sessionId)

        await db('user').insert({
            id: randomUUID(),
            name,
            total_meals_registered,
            total_meals_inside_diet,
            total_meals_outside_diet,
            best_diet_meal_sequence,
            session_id: sessionId,
        })

        return reply.status(201).send()
    })

    app.post('/registerMeal', async (request, reply) => {
        const registerMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            meal_time: z.iso.datetime(),
            is_diet: z.boolean(),
        })

        const { name, description, meal_time, is_diet} = registerMealBodySchema
            .parse(request.body)

        const { sessionId } = request.cookies

         const userId = await db('user').select('id').where("session_id", sessionId)

         const dbUserId = userId[0]?.id;

        await db('userMeal').where("session_id", sessionId).insert({
            mealId: randomUUID(),
            user_id: dbUserId,
            name,
            description,
            meal_time,
            is_diet,

        })

        //#TODO: add sequencia de dietas


        const dietSEQUENCE = await db('user').select('best_diet_meal_sequence').where("session_id", sessionId)

        const dbDietSequenceResult = dietSEQUENCE[0]?.best_diet_meal_sequence; //2

        console.log(dbDietSequenceResult)


        if (is_diet) { //

            await db('user').select().where("session_id", sessionId)
                .increment('total_meals_inside_diet', 1)

            dietSequenceAux++ //2
            console.log("DIET SEQUENCE AUX -> " + dietSequenceAux)

            if (dietSequenceAux > dbDietSequenceResult) {// 

                await db('user').select().where("session_id", sessionId)
                    .increment('best_diet_meal_sequence', 1)

            }
        }
        else {

            dietSequenceAux = 0
            await db('user').select().where("session_id", sessionId)
                .increment('total_meals_outside_diet', 1);
        }

        await db('user').select().where("session_id", sessionId)
            .increment('total_meals_registered', 1);


        return reply.status(200).send()

    })



    app.put(
        '/updateMeal/:id',

        async (request, reply) => {

            const updateMealSchema = z.object({
                name: z.string(),
                description: z.string(),
                meal_time: z.iso.datetime(),
                is_diet: z.boolean()
            })


            const { name, description, meal_time, is_diet } = updateMealSchema.parse(request.body)


            const getUserParam = request.params as { id: string }
            const mealId = getUserParam.id

            await db('userMeal').where('mealId', mealId).update(
                {
                    name,
                    description,
                    meal_time,
                    is_diet,
                }
            )


            return reply.status(200).send()

        })

    app.delete(
        '/deleteMeal/:id'
        , async (request, reply) => {

            const getUserParam = request.params as { id: string }
            const mealId = getUserParam.id

            await db('userMeal').where('mealId', mealId).delete('*')

            return reply.status(200).send()
        })


}