import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('userMeal', (table) => {
        table.uuid('mealId').primary()
       //table.uuid('userId').notNullable().references('id').inTable('user')
        table.text('name').notNullable()
        table.text('description').notNullable()
        table.dateTime('meal_time').notNullable()
        table.boolean('is_diet').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('userMeal')
}

