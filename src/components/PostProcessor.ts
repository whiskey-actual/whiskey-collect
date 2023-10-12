import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from "whiskey-sql"
import { getMaxDateFromArray } from "whiskey-util"

export class PostProcessor {
    constructor(le:LogEngine, db:DBEngine) {
        this.le=le
        this.db=db
      }
      private le:LogEngine
      private db:DBEngine
      public readonly activeThreshold:Date = new Date(new Date().setDate(new Date().getDate() - 30))

      public async updateDeviceDetails() {
        this.le.logStack.push("updateDeviceDetails")

        try {

            const devices:mssql.IRecordSet<any> = await this.db.selectColumns("Device", [
                "DeviceID",
                "DeviceName",
                "DeviceActiveDirectoryID",
                "DeviceAzureActiveDirectoryID",
                "DeviceAzureManagedID",
                "DeviceConnectwiseID",
                "DeviceCrowdstrikeID"
            ], [])
    
            // dates
            
            for(let i=0; i<devices.length; i++) {

                let observedDates:Date[] = []
    
                if(devices[i].DeviceActiveDirectoryID > 0) {
                    const adObservedDateFields:string[] = ["activeDirectoryWhenCreated","activeDirectoryWhenChanged","activeDirectoryLastLogon","activeDirectoryPwdLastSet","activeDirectoryLastLogonTimestamp"]    
                    observedDates = observedDates.concat(await this.getDateFields("DeviceActiveDirectory", "DeviceActiveDirectoryID", devices[i].DeviceActiveDirectoryID, adObservedDateFields))
                }

                if(devices[i].DeviceAzureActiveDirectoryID>0) {
                    const aadObservedDateFields:string[] = ["azureDeletedDateTime","azureApproximateLastSignInDateTime","azureComplianceExpirationDateTime","azureCreatedDateTime","azureOnPremisesLastSyncDateTime","azureRegistrationDateTime"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceAzureActiveDirectory", "DeviceAzureActiveDirectoryID", devices[i].DeviceAzureActiveDirectoryID, aadObservedDateFields))
                }

                if(devices[i].DeviceAzureManagedID>0) {
                    const mdmObservedDateFields:string[] = ["azureManagedEnrolledDateTime","azureManagedLastSyncDateTime"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceAzureManaged", "DeviceAzureManagedID", devices[i].DeviceAzureManagedID, mdmObservedDateFields))
                }

                if(devices[i].DeviceConnectwiseID>0) {
                    const cwObservedDateFields:string[] = ["connectwiseFirstSeen","connectwiseLastObserved","connectwiseWindowsUpdateDate","connectwiseAntivirusDefinitionDate","connectwiseAssetDate"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceConnectwise", "DeviceConnectwiseID", devices[i].DeviceConnectwiseID, cwObservedDateFields))
                }

                if(devices[i].DeviceCrowdstrikeID>0) {
                    const csObservedDateFields:string[] = ["crowdstrikeFirstSeenDateTime","crowdstrikeLastSeenDateTime","crowdstrikeModifiedDateTime"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceCrowdstrike", "DeviceCrowdstrikeID", devices[i].DeviceCrowdstrikeID, csObservedDateFields))
                }


                const maxDate = getMaxDateFromArray(observedDates)

                let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
                let ruDevice = new RowUpdate(Number(devices[i].DeviceID))
                ruDevice.updateName=devices[i].DeviceName
                ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceLastObserved", mssql.DateTime2, maxDate))
                ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceIsActive", mssql.Bit, maxDate ? (maxDate>this.activeThreshold) : false))
                tuDevice.RowUpdates.push(ruDevice)

                await this.db.updateTable(tuDevice, true)
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
      }

      public async updateUserDetails() {
        this.le.logStack.push("updateUserDetails")
        try {
            const users:mssql.IRecordSet<any> = await this.db.selectColumns("Employee", [
                "EmployeeID",
                "EmployeeEmailAddress",
                "ad_LastSeen",
                "aad_LastSeen"   
            ], [])

              // dates
            
              for(let i=0; i<users.length; i++) {

                let observedDates:Date[] = []
    
                if(users[i].EmployeeID > 0) {
                    const observedDateFields:string[] = ["ad_LastSeen","aad_LastSeen"]    
                    observedDates = observedDates.concat(await this.getDateFields("Employee", "EmployeeID", users[i].EmployeeID, observedDateFields))
                }

                const maxDate = getMaxDateFromArray(observedDates)

                let tuUser:TableUpdate = new TableUpdate('Employee', 'EmployeeID')
                let ruUser = new RowUpdate(Number(users[i].EmployeeID))
                ruUser.updateName=users[i].EmployeeEmailAddress
                ruUser.ColumnUpdates.push(new ColumnUpdate("EmployeeLastObserved", mssql.DateTime2, maxDate))
                ruUser.ColumnUpdates.push(new ColumnUpdate("EmployeeIsActive", mssql.Bit, maxDate ? (maxDate>this.activeThreshold): false))
                tuUser.RowUpdates.push(ruUser)

                await this.db.updateTable(tuUser, true)
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
    }

      private async getDateFields(tableName:string, tableIdField:string, tableIdValue:number, fieldsToSelect:string[]):Promise<Date[]> {
        
        let output:Date[] = []
        const matchCondition:ColumnValuePair = new ColumnValuePair(tableIdField, tableIdValue, mssql.Int)
        const result = await this.db.selectColumns(tableName, fieldsToSelect, [matchCondition])
        const dates = result[0]

        
        for(let j=0; j<fieldsToSelect.length; j++) {
            if(dates[fieldsToSelect[j]]) {
                output.push(new Date(dates[fieldsToSelect[j]]))
            }
        }

        return output

      }

}