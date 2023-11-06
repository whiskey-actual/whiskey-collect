import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { getMaxDateFromArray } from "whiskey-util"
import { RowUpdate, ColumnUpdate } from "whiskey-sql/lib/update"
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

            let observedDateFields:string[] = []
            
            // ad fields
            observedDateFields = observedDateFields.concat(["ad_WhenCreated","ad_WhenChanged","ad_LastLogon","ad_PwdLastSet","ad_LastLogonTimestamp"])
            
            // aad
            observedDateFields = observedDateFields.concat(["aad_DeletedDateTime","aad_ComplianceExpirationDateTime","aad_CreatedDateTime","aad_OnPremisesLastSyncDateTime","aad_RegistrationDateTime"])

            // azure mdm
            observedDateFields = observedDateFields.concat(["mdm_EnrolledDateTime","mdm_LastSyncDateTime"])

            // connectwise
            observedDateFields = observedDateFields.concat(["cw_FirstSeen","cw_LastObserved","cw_WindowsUpdateDate","cw_AntivirusDefinitionDate","cw_AssetDate"])

            // crowdstrike
            observedDateFields = observedDateFields.concat(["cs_FirstSeenDateTime","cs_LastSeenDateTime","cs_ModifiedDateTime"])

            const devices:mssql.IRecordSet<any> = await this.db.selectColumns("Device", [
                "DeviceID",
                "DeviceName"              
            ].concat(observedDateFields), [])
    
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

      public async updateUserDetails() {
        this.le.logStack.push("updateUserDetails")
        try {
            const users:mssql.IRecordSet<any> = await this.db.selectColumns("Employee", [
                "EmployeeID",
                "EmployeeEmailAddress",
                "EmployeeLastObserved",
                "ad_LastSeen",
                "aad_LastSeen"   
            ], [])

              // dates
            
              for(let i=0; i<users.length; i++) {

                let observedDates:Date[] = []
    
                if(users[i].EmployeeID > 0) {

                    observedDates.push(users[i].ad_LastSeen)
                    observedDates.push(users[i].aad_LastSeen)
                    const maxDate = getMaxDateFromArray(observedDates)

                    if(maxDate && (!users[i].EmployeeLastObserved || users[i].EmployeeLastObserved<maxDate)) {
                        let ruUser = new RowUpdate(Number(users[i].EmployeeID))
                        ruUser.updateName=users[i].EmployeeEmailAddress
                        ruUser.ColumnUpdates.push(new ColumnUpdate("EmployeeLastObserved", mssql.DateTime2, maxDate))
                        ruUser.ColumnUpdates.push(new ColumnUpdate("EmployeeIsActive", mssql.Bit, maxDate ? (maxDate>this.activeThreshold): false))
                        await this.db.updateTable('Employee', 'EmployeeID', [ruUser])
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