import mssql from 'mssql'
import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function SourceTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('URI', "VARCHAR", true, true))
    Columns.push(new ColumnDefinition('Port', "INT"))
    Columns.push(new ColumnDefinition('Credential', "VARCHAR", true, true))
    Columns.push(new ColumnDefinition('Authentication', "VARCHAR", true, true))
    Columns.push(new ColumnDefinition('QueryString', "VARCHAR"))
    Columns.push(new ColumnDefinition('QueryIntervalInMinutes', "INT"))
    Columns.push(new ColumnDefinition('LastRunDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('LastRunSuccessful', "BIT", false, true, undefined, false))
    Columns.push(new ColumnDefinition('LastRunMessage', "VARCHAR"))
    Columns.push(new ColumnDefinition('LastRunObjectCount', "INT"))
    return Columns
}