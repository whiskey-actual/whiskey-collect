import mssql from 'mssql'
import { ColumnDefinition } from "whiskey-sql/lib/components/columnDefinition"

export function LicenseTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('LicensePlanID', mssql.VarChar(255), true, true))
    return Columns
}