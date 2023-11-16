import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { getMaxDateFromArray } from "whiskey-util"
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"

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

            this.le.AddLogEntry(LogEngine.EntryType.Info, 'updating device details ..')

            let observedDateFields:string[] = []
            
            // ad fields
            observedDateFields = observedDateFields.concat(["DeviceActiveDirectoryWhenCreated","DeviceActiveDirectoryWhenChanged","DeviceActiveDirectoryLastLogon","DeviceActiveDirectoryPwdLastSet","DeviceActiveDirectoryLastLogonTimestamp"])
            
            // aad
            observedDateFields = observedDateFields.concat(["DeviceAzureActiveDirectoryDeletedDateTime","DeviceAzureActiveDirectoryComplianceExpirationDateTime","DeviceAzureActiveDirectoryCreatedDateTime","DeviceAzureActiveDirectoryOnPremisesLastSyncDateTime","DeviceAzureActiveDirectoryRegistrationDateTime"])

            // azure mdm
            observedDateFields = observedDateFields.concat(["DeviceAzureMDMEnrolledDateTime","DeviceAzureMDMLastSyncDateTime"])

            // connectwise
            observedDateFields = observedDateFields.concat(["DeviceConnectwiseFirstSeen","DeviceConnectwiseLastObserved","DeviceConnectwiseWindowsUpdateDate","DeviceConnectwiseAntivirusDefinitionDate","DeviceConnectwiseAssetDate"])

            // crowdstrike
            observedDateFields = observedDateFields.concat(["DeviceCrowdstrikeFirstSeenDateTime","DeviceCrowdstrikeLastSeenDateTime","DeviceCrowdstrikeModifiedDateTime"])

            const devices:mssql.IRecordSet<any> = await this.db.selectColumns("Device", [
                "DeviceID",
                "DeviceName"              
            ].concat(observedDateFields), [])
            this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${devices.length} records, processing ..`)
            // dates
            
            for(let i=0; i<devices.length; i++) {

                let observedDates:Date[] = []

                for(let j=0; j<observedDateFields.length; j++) {
                    observedDates.push(devices[i][observedDateFields[j]])
                }
    
                const maxDate = getMaxDateFromArray(observedDates)

                let ruDevice = new RowUpdate(Number(devices[i].DeviceID))
                ruDevice.updateName=devices[i].DeviceName
                ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceLastObserved", mssql.DateTime2, maxDate))
                ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceIsActive", mssql.Bit, maxDate ? (maxDate>this.activeThreshold) : false))

                await this.db.updateTable('Device', 'DeviceID', [ruDevice])
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
      }

      public async updateEmployeeDetails() {
        this.le.logStack.push("updateEmployeeDetails")
        try {

            this.le.AddLogEntry(LogEngine.EntryType.Info, 'updating employee details ..')

            const users:mssql.IRecordSet<any> = await this.db.selectColumns("Employee", [
                "EmployeeID",
                "EmployeeEmailAddress",
                "EmployeeLastObserved",
                "EmployeeActiveDirectoryLastSeen",
                "EmployeeAzureActiveDirectoryLastSeen"   
            ], [])

            this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${users.length} records, processing ..`)

              // dates
            
              for(let i=0; i<users.length; i++) {

                let observedDates:Date[] = []
    
                if(users[i].EmployeeID > 0) {

                    observedDates.push(users[i].EmployeeActiveDirectoryLastSeen)
                    observedDates.push(users[i].EmployeeAzureActiveDirectoryLastSeen)
                    const maxDate = getMaxDateFromArray(observedDates)

                    if(maxDate && (!users[i].EmployeeLastObserved || users[i].EmployeeLastObserved<maxDate)) {
                        let ruEmployee = new RowUpdate(Number(users[i].EmployeeID))
                        ruEmployee.updateName=users[i].EmployeeEmailAddress
                        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeLastObserved", mssql.DateTime2, maxDate))
                        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeIsActive", mssql.Bit, maxDate ? (maxDate>this.activeThreshold): false))
                        await this.db.updateTable('Employee', 'EmployeeID', [ruEmployee])
                    }
                    
                }     
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
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