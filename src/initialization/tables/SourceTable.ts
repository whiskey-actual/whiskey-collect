import mssql from 'mssql'
import { ColumnDefinition } from "whiskey-sql/lib/components/columnDefinition"

export function SourceTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('URI', mssql.VarChar(255), true, true))
    Columns.push(new ColumnDefinition('Port', mssql.Int))
    Columns.push(new ColumnDefinition('Credential', mssql.VarChar(255), true, true))
    Columns.push(new ColumnDefinition('Authentication', mssql.VarChar(255), true, true))
    Columns.push(new ColumnDefinition('QueryString', mssql.VarChar(255)))
    Columns.push(new ColumnDefinition('QueryIntervalInMinutes', mssql.Int))
    Columns.push(new ColumnDefinition('LastRunDateTime', mssql.DateTime2))
    Columns.push(new ColumnDefinition('LastRunSuccessful', mssql.Bit, false))
    Columns.push(new ColumnDefinition('LastRunMessage', mssql.VarChar(255)))
    Columns.push(new ColumnDefinition('LastRunObjectCount', mssql.Int))
    return Columns
}