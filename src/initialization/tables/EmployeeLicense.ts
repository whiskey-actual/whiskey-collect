import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function EmployeeLicense():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('EmployeeID', "INT", false, true))
    Columns.push(new ColumnDefinition('LicenseID', "INT", false, true))
    Columns.push(new ColumnDefinition('AssignmentDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('AssignmentStatus', "VARCHAR"))
    return Columns
}