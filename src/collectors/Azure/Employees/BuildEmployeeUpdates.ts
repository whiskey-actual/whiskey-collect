import { LogEngine } from "whiskey-log"
import { getMaxDateFromObject } from "whiskey-util"

import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { AzureActiveDirectoryEmployee } from "./AzureActiveDirectoryEmployee"
import { TableUpdate } from "whiskey-sql/lib/components/TableUpdate"

import { getProgressMessage } from "whiskey-util"


export async function BuildEmployeeUpdates(le:LogEngine, db:DBEngine, users:AzureActiveDirectoryEmployee[]):Promise<TableUpdate[]> {
  le.logStack.push('BuildEmployeeUpdates')
  let output:TableUpdate[] = []
    
    try {
      
      const tuEmployee:TableUpdate = new TableUpdate('Employee', 'EmployeeID')
      const tuLicense:TableUpdate = new TableUpdate('License', 'LicenseID')
      const tuEmployeeLicense:TableUpdate = new TableUpdate('EmployeeLicense', 'EmployeeLicenseID')

      // AAD Employees ..
      le.AddLogEntry(LogEngine.EntryType.Info, `.. building ${users.length} updates for AzureAD employees .. `)
      const timeStart:Date = new Date()

      for(let i=0; i<users.length; i++) {
        try {

          // find (insert if missing) this Employee email address
          let EmployeeID:number = 0
          let UpdateName:string|undefined = undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(users[i].emailAddress) {
            EmployeeID = await db.getID("Employee", [new ColumnValuePair("EmployeeEmailAddress", users[i].emailAddress, mssql.VarChar(255))], false)
            UpdateName = users[i].emailAddress
          }  // otherwise, use the Id; if this doesnt exist, insert it.
          if(EmployeeID===0) {
            EmployeeID = await db.getID("Employee", [new ColumnValuePair("EmployeeAzureActiveDirectoryId", users[i].id, mssql.VarChar(255))], true)
            UpdateName = users[i].id
          }

          // update the Employee table
          let ruEmployee = new RowUpdate(EmployeeID)
          ruEmployee.updateName = UpdateName ? UpdateName : 'unknown user'
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeEmailAddress", mssql.VarChar(255), users[i].emailAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryUserPrincipalName", mssql.VarChar(255), users[i].userPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryId", mssql.VarChar(255), users[i].id))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryBusinessPhone", mssql.VarChar(255), users[i].businessPhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryDisplayName", mssql.VarChar(255), users[i].displayName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryGivenName", mssql.VarChar(255), users[i].givenName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryJobTitle", mssql.VarChar(255), users[i].jobTitle))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryMobilePhone", mssql.VarChar(255), users[i].mobilePhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryOfficeLocation", mssql.VarChar(255), users[i].officeLocation))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectorySurname", mssql.VarChar(255), users[i].surname))
          //ruEmployee.ColumnUpdates.push(new ColumnUpdate("AzureActiveDirectoryAssignedPlans", mssql.VarChar(255), users[i].assignedPlans))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryCity", mssql.VarChar(255), users[i].city))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryCountry", mssql.VarChar(255), users[i].country))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryCreationType", mssql.VarChar(255), users[i].creationType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryDepartment", mssql.VarChar(255), users[i].department))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryEmployeeHireDate", mssql.VarChar(255), users[i].EmployeeHireDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryEmployeeId", mssql.VarChar(255), users[i].EmployeeId))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryEmployeeOrgData", mssql.VarChar(255), users[i].EmployeeOrgData))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryEmployeeType", mssql.VarChar(255), users[i].EmployeeType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryOnPremisesDistinguishedName", mssql.VarChar(255), users[i].onPremisesDistinguishedName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryOnPremisesDomainName", mssql.VarChar(255), users[i].onPremisesDomainName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryOnPremisesSamAccountName", mssql.VarChar(255), users[i].onPremisesSamAccountName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryOnPremisesUserPrincipalName", mssql.VarChar(255), users[i].onPremisesUserPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryPasswordPolicies", mssql.VarChar(255), users[i].passwordPolicies))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryPostalCode", mssql.VarChar(255), users[i].postalCode))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryState", mssql.VarChar(255), users[i].state))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryStreetAddress", mssql.VarChar(255), users[i].streetAddress))
          // bit
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryAccountEnabled", mssql.Bit, users[i].accountEnabled))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeObservedByAzureActiveDirectory", mssql.Bit, true))
          // datetime
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryCreatedDateTime", mssql.DateTime2, users[i].createdDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryDeletedDateTime", mssql.DateTime2, users[i].deletedDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryLastPasswordChangeDateTime", mssql.DateTime2, users[i].lastPasswordChangeDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryLastSignInDateTime", mssql.DateTime2, users[i].lastSignInDateTime))

          const aadLastSeen = getMaxDateFromObject(users[i], [
            'createdDateTime',
            'lastPasswordChangeDateTime',
            'lastSignInDateTime'
          ])

          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeAzureActiveDirectoryLastSeen", mssql.DateTime2, aadLastSeen))

          tuEmployee.RowUpdates.push(ruEmployee)

          // update licenses

          //console.debug(users[i].services);

          for(let j=0; j<users[i].services.length; j++) {
            
            //console.debug(users[i].services[j])
            
            const LicenseID = await db.getID("License", [new ColumnValuePair("LicensePlanID", users[i].services[j].servicePlanId, mssql.VarChar(255))], true)
            let ruLicense:RowUpdate = new RowUpdate(LicenseID)
            ruLicense.ColumnUpdates.push(new ColumnUpdate("LicenseDescription", mssql.VarChar(255), users[i].services[j].serviceName))
            tuLicense.RowUpdates.push(ruLicense)
            
            const EmployeeLicenseID = await db.getID("EmployeeLicense", [
              new ColumnValuePair("EmployeeLicenseEmployeeID", EmployeeID, mssql.Int),
              new ColumnValuePair("EmployeeLicenseLicenseID", LicenseID, mssql.Int)
            ], true)
            let ruEmployeeLicense:RowUpdate = new RowUpdate(EmployeeLicenseID)
            ruEmployeeLicense.ColumnUpdates.push(new ColumnUpdate("EmployeeLicenseAssignmentDateTime", mssql.DateTime2, users[i].services[j].assignedDateTime))
            ruEmployeeLicense.ColumnUpdates.push(new ColumnUpdate("EmployeeLicenseAssignmentStatus", mssql.VarChar(255), users[i].services[j].serviceStatus))
            tuEmployeeLicense.RowUpdates.push(ruEmployeeLicense)
          }

        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err);
        }
        
        if(i>0 && (i%250===0)) {le.AddLogEntry(LogEngine.EntryType.Info, getProgressMessage('', 'built', i, users.length, timeStart, new Date()));}

      }

      le.AddLogEntry(LogEngine.EntryType.Success, getProgressMessage('', 'built', users.length, users.length, timeStart, new Date()));

      output.push(...[tuEmployee, tuLicense, tuEmployeeLicense])
    
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      le.logStack.pop()
    }

    return new Promise<TableUpdate[]>((resolve) => {resolve(output)})

  }

  