import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "whiskey-sql"

export class PostProcessor {
    constructor(le:LogEngine, db:DBEngine) {
        this.le=le
        this.db=db
      }
      private le:LogEngine
      private db:DBEngine

      public async updateDeviceDetails() {
        this.le.logStack.push("updateDeviceDetails")

        try {

            const devices:mssql.IRecordSet<any> = await this.db.selectColumns("Device", [
                "DeviceID",
                "DeviceActiveDirectoryID",
                "DeviceAzureActiveDirectoryID",
                "DeviceAzureManagedID",
                "DeviceConnectwiseID",
                "DeviceCrowdstrikeID"
            ], [])
    
            for(let i=0; i<devices.length; i++) {
    
                const matchCondition:ColumnValuePair = new ColumnValuePair("DeviceActiveDirectoryID", devices[i].DeviceActiveDirectoryID, mssql.Int)
    
                const datetimes = await this.db.selectColumns("DeviceActiveDirectory", [
                    "activeDirectoryWhenCreated",
                    "activeDirectoryWhenChanged",
                    "activeDirectoryLastLogon",
                    "activeDirectoryPwdLastSet",
                    "activeDirectoryLastLogonTimestamp"
                ], [matchCondition])
    
                console.debug(datetimes)
    
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
      }
}