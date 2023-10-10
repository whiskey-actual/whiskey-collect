import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "whiskey-sql"
import { Utilities } from "whiskey-util"

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
    
            // dates
            let observedDates:Date[] = []
            for(let i=0; i<devices.length; i++) {
    
                if(devices[i].DeviceActiveDirectoryID > 0) {
                    const adObservedDateFields:string[] = ["activeDirectoryWhenCreated","activeDirectoryWhenChanged","activeDirectoryLastLogon","activeDirectoryPwdLastSet","activeDirectoryLastLogonTimestamp"]    
                    observedDates = observedDates.concat(await this.getDateFields("DeviceActiveDirectory", "DeviceActiveDirectoryID", devices[i].DeviceActiveDirectoryID, adObservedDateFields))
                }

                if(devices[i].DeviceAzureActiveDirectoryID>0) {
                    const aadObservedDateFields:string[] = ["azureDeletedDateTime","azureApproximateLastSignInDateTime","azureComplianceExpirationDateTime","azureCreatedDateTime","azureOnPremisesLastSyncDateTime","azureRegistrationDateTime"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceAzureActiveDirectory", "DeviceAzureActiveDirectoryID", devices[i].DeviceAzureActiveDirectoryID, aadObservedDateFields))
                }

                if(devices[i].DeviceAzureManagedID>0) {
                    const mdmObservedDateFields:string[] = ["azureManagedEnrolledDateTime","azureManagedLastSyncDateTime","azureManagedEASActivationDateTime","azureManagedExchangeLastSuccessfulSyncDateTime","azureManagedComplianceGracePeriodExpirationDateTime","azureManagedManagementCertificateExpirationDateTime"]
                    observedDates = observedDates.concat(await this.getDateFields("DeviceAzureManaged", "DeviceAzureManagedID", devices[i].DeviceAzureManagedID, mdmObservedDateFields))
                }

                const maxDate = new Date(Math.max(...observedDates.map(d=> d ? d.getTime() : Utilities.minimumJsonDate.getTime())));
                console.debug(observedDates)
                console.debug(`max: ${maxDate.toDateString}`)
               
          

            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
      }

      private async getDateFields(tableName:string, tableIdField:string, tableIdValue:number, fieldsToSelect:string[]):Promise<Date[]> {
        
        let output:Date[] = []
        const matchCondition:ColumnValuePair = new ColumnValuePair(tableIdField, tableIdValue, mssql.Int)
        const dates = await this.db.selectColumns(tableName, fieldsToSelect, [matchCondition])

        for(let j=0; j<fieldsToSelect.length; j++) {
            if(dates[fieldsToSelect[j]]) {
                output.push(new Date(dates[fieldsToSelect[j]]))
            }
        }

        return output

      }

}