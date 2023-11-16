// imports
import { LogEngine } from 'whiskey-log';

import mssql from 'mssql'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { CrowdstrikeDevice } from './CrowdstrikeDevice';

export async function persistDevices(le:LogEngine, db:DBEngine, devices:CrowdstrikeDevice[]) {

    le.logStack.push('persist')
    le.AddLogEntry(LogEngine.EntryType.Info, 'building requests ..')

    try {
        
        for(let i=0; i<devices.length; i++) {

            const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)
            
            // update the DeviceCrowdstrike table values ..
            let ruCrowdstrike = new RowUpdate(DeviceID)
            ruCrowdstrike.updateName=devices[i].deviceName
            // strings
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeCID", mssql.VarChar(255), devices[i].crowdstrikeCID))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeAgentVersion", mssql.VarChar(255), devices[i].crowdstrikeAgentVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeBIOSManufacturer", mssql.VarChar(255), devices[i].crowdstrikeBIOSManufacturer))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeBIOSVersion", mssql.VarChar(255), devices[i].crowdstrikeBIOSVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeExternalIP", mssql.VarChar(255), devices[i].crowdstrikeExternalIP))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMACAddress", mssql.VarChar(255), devices[i].crowdstrikeMACAddress))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeLocalIP", mssql.VarChar(255), devices[i].crowdstrikeLocalIP))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMachineDomain", mssql.VarChar(255), devices[i].crowdstrikeMachineDomain))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMajorVersion", mssql.VarChar(255), devices[i].crowdstrikeMajorVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMinorVersion", mssql.VarChar(255), devices[i].crowdstrikeMinorVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeOSBuild", mssql.VarChar(255), devices[i].crowdstrikeOSBuild))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeOSVersion", mssql.VarChar(255), devices[i].crowdstrikeOSVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikePlatformName", mssql.VarChar(255), devices[i].crowdstrikePlatformName))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeReducedFunctionalityMode", mssql.VarChar(255), devices[i].crowdstrikeReducedFunctionalityMode))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeProductTypeDesc", mssql.VarChar(255), devices[i].crowdstrikeProductTypeDesc))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeProvisionStatus", mssql.VarChar(255), devices[i].crowdstrikeProvisionStatus))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSerialNumber", mssql.VarChar(255), devices[i].crowdstrikeSerialNumber))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeServicePackMajor", mssql.VarChar(255), devices[i].crowdstrikeServicePackMajor))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeServicePackMinor", mssql.VarChar(255), devices[i].crowdstrikeServicePackMinor))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeStatus", mssql.VarChar(255), devices[i].crowdstrikeStatus))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSystemManufacturer", mssql.VarChar(255), devices[i].crowdstrikeSystemManufacturer))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSystemProductName", mssql.VarChar(255), devices[i].crowdstrikeSystemProductName))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeKernelVersion", mssql.VarChar(255), devices[i].crowdstrikeKernelVersion))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeFirstSeenDateTime", mssql.DateTime2, devices[i].crowdstrikeFirstSeenDateTime))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeLastSeenDateTime", mssql.DateTime2, devices[i].crowdstrikeLastSeenDateTime))
            ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeModifiedDateTime", mssql.DateTime2, devices[i].crowdstrikeModifiedDateTime))

            await db.updateTable('Device', 'DeviceID', [ruCrowdstrike])

        }

    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.AddLogEntry(LogEngine.EntryType.Info, '.. done')
        le.logStack.pop()
    }

}
