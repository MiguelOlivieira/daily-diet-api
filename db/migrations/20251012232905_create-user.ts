import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable('user', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.integer('total_meals_registered').defaultTo(0)
        table.integer('total_meals_inside_diet').defaultTo(0)
        table.integer('total_meals_outside_diet').defaultTo(0)
        table.integer('best_diet_meal_sequence').defaultTo(0)
    })

}


export async function down(knex: Knex): Promise<void> {
        await knex.schema.dropTable('user')
}

