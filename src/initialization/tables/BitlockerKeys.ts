import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function BitlockerKeys():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    
    Columns.push(new ColumnDefinition('BitlockerKeyID', "VARCHAR", false, true, 255))
    Columns.push(new ColumnDefinition('DeviceID', "VARCHAR", true, true))
    Columns.push(new ColumnDefinition('BitlockerDeviceKey', "VARCHAR", true, true))

    return Columns
}