import { LogEngine } from "whiskey-log"
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { ConnectwiseDevice } from "./connectwiseDevice"
import mssql from 'mssql'

export async function persistDevices(le:LogEngine, db:DBEngine, devices:ConnectwiseDevice[]) {
    le.logStack.push('persist')
    le.AddLogEntry(LogEngine.EntryType.Info, 'building requests ..')

    try {
      
      for(let i=0; i<devices.length; i++) {

        const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)

        // update the DeviceConnectwise table values ..
        let ruConnectwise = new RowUpdate(DeviceID)
        ruConnectwise.updateName=devices[i].deviceName
        // strings
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDeviceType", mssql.VarChar(255), devices[i].connectwiseDeviceType))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLocation", mssql.VarChar(255), devices[i].connectwiseLocation))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseClient", mssql.VarChar(255), devices[i].connectwiseClient))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDomainName", mssql.VarChar(255), devices[i].connectwiseDomainName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseAgentVersion", mssql.VarChar(255), devices[i].connectwiseAgentVersion))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseComment", mssql.VarChar(255), devices[i].connectwiseComment))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseIpAddress", mssql.VarChar(255), devices[i].connectwiseIpAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseMacAddress", mssql.VarChar(255), devices[i].connectwiseMacAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLastUserName", mssql.VarChar(255), devices[i].connectwiseLastUserName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseStatus", mssql.VarChar(255), devices[i].connectwiseStatus))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseSerialNumber", mssql.VarChar(255), devices[i].connectwiseSerialNumber))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseManufacturer", mssql.VarChar(255), devices[i].connectwiseManufacturer))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseModel", mssql.VarChar(255), devices[i].connectwiseModel))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDescription", mssql.VarChar(255), devices[i].connectwiseDescription))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseOperatingSystem", mssql.VarChar(255), devices[i].connectwiseOperatingSystem))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseOperatingSystemVersion", mssql.VarChar(255), devices[i].connectwiseOperatingSystemVersion))
        // bigint
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseTotalMemory", mssql.BigInt, devices[i].connectwiseTotalMemory))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseFreeMemory", mssql.BigInt, devices[i].connectwiseFreeMemory, false))
        // dates
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLastObserved", mssql.DateTime2, devices[i].connectwiseLastObserved))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseWindowsUpdateDate", mssql.DateTime2, devices[i].connectwiseWindowsUpdateDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseAntivirusDefinitionDate", mssql.DateTime2, devices[i].connectwiseAntivirusDefinitionDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseFirstSeen", mssql.DateTime2, devices[i].connectwiseFirstSeen))

        await db.updateTable('Device', 'DeviceID', [ruConnectwise])

      }

    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, '.. done')
      le.logStack.pop()
    }

  }