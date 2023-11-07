import mssql from 'mssql'
import { ColumnDefinition } from "whiskey-sql/lib/components/columnDefinition"

export function UserLicenseTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('EmployeeID', mssql.Int, false, true))
    Columns.push(new ColumnDefinition('LicenseID', mssql.Int, false, true))
    Columns.push(new ColumnDefinition('AssignmentDateTime', mssql.DateTime2))
    Columns.push(new ColumnDefinition('AssignmentStatus', mssql.VarChar(255)))
    return Columns
}