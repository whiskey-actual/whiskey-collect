import mssql from 'mssql'
import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function LicenseTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('PlanID', "VARCHAR", true, true))
    return Columns
}