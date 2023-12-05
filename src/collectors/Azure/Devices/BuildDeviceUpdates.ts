import { LogEngine } from "whiskey-log"
import { getMaxDateFromObject } from "whiskey-util"

import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { AzureActiveDirectoryDevice } from "./AzureActiveDirectoryDevice"
import { TableUpdate } from "whiskey-sql/lib/components/TableUpdate"

export async function BuildDeviceUpdates(le:LogEngine, db:DBEngine, devices:AzureActiveDirectoryDevice[]):Promise<TableUpdate[]> {
  le.logStack.push('BuildDeviceUpdates')
  let output:TableUpdate[] = []
    
    try {

      const tu:TableUpdate = new TableUpdate('Device', 'DeviceID')

      // AAD devices
      le.AddLogEntry(LogEngine.EntryType.Info, `.. building ${devices.length} updates for AzureAD devices .. `)
      for(let i=0; i<devices.length; i++) {
        try {

          const aadLastSeen = getMaxDateFromObject(devices[i], [
            'azureDeletedDateTime',
            'azureCreatedDateTime',
            'azureOnPremisesLastSyncDateTime',
            'azureRegistrationDateTime'
          ])

          const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=devices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryId", mssql.VarChar(255), devices[i].azureDeviceId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceCategory", mssql.VarChar(255), devices[i].azureDeviceCategory))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceMetadata", mssql.VarChar(255), devices[i].azureDeviceMetadata))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceOwnership", mssql.VarChar(255), devices[i].azureDeviceOwnership))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceVersion", mssql.VarChar(255), devices[i].azureDeviceVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDomainName", mssql.VarChar(255), devices[i].azureDomainName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryEnrollmentProfileType", mssql.VarChar(255), devices[i].azureEnrollmentProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryEnrollmentType", mssql.VarChar(255), devices[i].azureEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryExternalSourceName", mssql.VarChar(255), devices[i].azureExternalSourceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryManagementType", mssql.VarChar(255), devices[i].azureManagementType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryManufacturer", mssql.VarChar(255), devices[i].azureManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryMDMAppId", mssql.VarChar(255), devices[i].azureMDMAppId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryModel", mssql.VarChar(255), devices[i].azureModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryProfileType", mssql.VarChar(255), devices[i].azureProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectorySourceType", mssql.VarChar(255), devices[i].azureSourceType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryTrustType", mssql.VarChar(255), devices[i].azureTrustType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOperatingSystem", mssql.VarChar(255), devices[i].azureOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOperatingSystemVersion", mssql.VarChar(255), devices[i].azureOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeletedDateTime", mssql.DateTime2, devices[i].azureDeletedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryApproximateLastSignInDateTime", mssql.DateTime2, devices[i].azureApproximateLastSignInDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryComplianceExpirationDateTime", mssql.DateTime2, devices[i].azureComplianceExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryCreatedDateTime", mssql.DateTime2, devices[i].azureCreatedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOnPremisesLastSyncDateTime", mssql.DateTime2, devices[i].azureOnPremisesLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryRegistrationDateTime", mssql.DateTime2, devices[i].azureRegistrationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryLastSeen", mssql.DateTime2, aadLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOnPremisesSyncEnabled", mssql.Bit, devices[i].azureOnPremisesSyncEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryAccountEnabled", mssql.Bit, devices[i].azureAccountEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsCompliant", mssql.Bit, devices[i].azureIsCompliant))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsManaged", mssql.Bit, devices[i].azureIsManaged))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsRooted", mssql.Bit, devices[i].azureIsRooted))
          tu.RowUpdates.push(ruDevice)

          
        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err);
        }
      }
      
      output.push(tu)
    
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      le.logStack.pop()
    }
    
    return new Promise<TableUpdate[]>((resolve) => {resolve(output)})

  }

  