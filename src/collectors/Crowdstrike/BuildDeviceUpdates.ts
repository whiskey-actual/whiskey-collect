// imports
import { LogEngine } from 'whiskey-log';

import mssql, { Table } from 'mssql'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { CrowdstrikeDevice } from './CrowdstrikeDevice';
import { TableUpdate } from 'whiskey-sql/lib/components/TableUpdate';

export async function BuildDeviceUpdates(le:LogEngine, db:DBEngine, devices:CrowdstrikeDevice[]):Promise<TableUpdate[]> {
    le.logStack.push('BuildDeviceUpdates')
    le.AddLogEntry(LogEngine.EntryType.Info, 'building requests ..')
    let output:TableUpdate[] = []

    try {

        const tu:TableUpdate = new TableUpdate("Device", "DeviceID")
        
        for(let i=0; i<devices.length; i++) {

            const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)
            
            // update the DeviceCrowdstrike table values ..
            
            let ru = new RowUpdate(DeviceID)
            ru.updateName=devices[i].deviceName
            // strings
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeCID", mssql.VarChar(255), devices[i].crowdstrikeCID))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeAgentVersion", mssql.VarChar(255), devices[i].crowdstrikeAgentVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeBIOSManufacturer", mssql.VarChar(255), devices[i].crowdstrikeBIOSManufacturer))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeBIOSVersion", mssql.VarChar(255), devices[i].crowdstrikeBIOSVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeExternalIP", mssql.VarChar(255), devices[i].crowdstrikeExternalIP))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMACAddress", mssql.VarChar(255), devices[i].crowdstrikeMACAddress))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeLocalIP", mssql.VarChar(255), devices[i].crowdstrikeLocalIP))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMachineDomain", mssql.VarChar(255), devices[i].crowdstrikeMachineDomain))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMajorVersion", mssql.VarChar(255), devices[i].crowdstrikeMajorVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeMinorVersion", mssql.VarChar(255), devices[i].crowdstrikeMinorVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeOSBuild", mssql.VarChar(255), devices[i].crowdstrikeOSBuild))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeOSVersion", mssql.VarChar(255), devices[i].crowdstrikeOSVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikePlatformName", mssql.VarChar(255), devices[i].crowdstrikePlatformName))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeReducedFunctionalityMode", mssql.VarChar(255), devices[i].crowdstrikeReducedFunctionalityMode))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeProductTypeDesc", mssql.VarChar(255), devices[i].crowdstrikeProductTypeDesc))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeProvisionStatus", mssql.VarChar(255), devices[i].crowdstrikeProvisionStatus))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSerialNumber", mssql.VarChar(255), devices[i].crowdstrikeSerialNumber))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeServicePackMajor", mssql.VarChar(255), devices[i].crowdstrikeServicePackMajor))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeServicePackMinor", mssql.VarChar(255), devices[i].crowdstrikeServicePackMinor))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeStatus", mssql.VarChar(255), devices[i].crowdstrikeStatus))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSystemManufacturer", mssql.VarChar(255), devices[i].crowdstrikeSystemManufacturer))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeSystemProductName", mssql.VarChar(255), devices[i].crowdstrikeSystemProductName))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeKernelVersion", mssql.VarChar(255), devices[i].crowdstrikeKernelVersion))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeFirstSeenDateTime", mssql.DateTime2, devices[i].crowdstrikeFirstSeenDateTime))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeLastSeenDateTime", mssql.DateTime2, devices[i].crowdstrikeLastSeenDateTime))
            ru.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeModifiedDateTime", mssql.DateTime2, devices[i].crowdstrikeModifiedDateTime))
            tu.RowUpdates.push(ru)
        }

        output.push(tu)

    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.AddLogEntry(LogEngine.EntryType.Info, '.. done')
        le.logStack.pop()
    }

    return new Promise<TableUpdate[]>((resolve) => {resolve(output)})

}
