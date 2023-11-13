import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function License():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('PlanID', "VARCHAR", true, true))
    return Columns
}