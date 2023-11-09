import { LogEngine } from "whiskey-log"
import { getMaxDateFromObject } from "whiskey-util"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { DBEngine } from "whiskey-sql"
import mssql from 'mssql'
import { ActiveDirectoryDevice } from "./ActiveDirectoryDevice"

export async function persistDevices(le:LogEngine, db:DBEngine, devices:ActiveDirectoryDevice[]):Promise<void> {
    le.logStack.push('persistDevices')
    
    try {

      // devices
      le.AddLogEntry(LogEngine.EntryType.Info, 'performing table updates (device) ..')
      for(let i=0; i<devices.length; i++) {
        try {

          const deviceLastSeen = getMaxDateFromObject(devices[i], [
            'activeDirectoryWhenCreated',
            'activeDirectoryWhenChanged',
            'activeDirectoryLastLogon',
            'activeDirectoryPwdLastSet',
            'activeDirectoryLastLogonTimestamp'
          ])
     
          const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)

          // update the device table to add the corresponding DeviceActiveDirectoryID ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=devices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryDN", mssql.VarChar(255), devices[i].deviceDN))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryDNSHostName", mssql.VarChar(255), devices[i].activeDirectoryDNSHostName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryOperatingSystem", mssql.VarChar(255), devices[i].activeDirectoryOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryOperatingSystemVersion", mssql.VarChar(255), devices[i].activeDirectoryOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLogonCount", mssql.Int, devices[i].activeDirectoryLogonCount, false))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryWhenCreated", mssql.DateTime2, devices[i].activeDirectoryWhenCreated))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryWhenChanged", mssql.DateTime2, devices[i].activeDirectoryWhenChanged))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastLogon", mssql.DateTime2, devices[i].activeDirectoryLastLogon))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryPwdLastSet", mssql.DateTime2, devices[i].activeDirectoryPwdLastSet))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastLogonTimestamp", mssql.DateTime2, devices[i].activeDirectoryLastLogonTimestamp))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastSeen", mssql.DateTime2, deviceLastSeen))
          await db.updateTable('Device', 'DeviceID', [ruDevice])
        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err);
        }
  
      }
    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
      } finally {
        le.logStack.pop()
      }

    return new Promise<void>((resolve) => {resolve()})
}