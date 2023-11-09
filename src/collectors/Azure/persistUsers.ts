import { LogEngine } from "whiskey-log"
import { getMaxDateFromObject } from "whiskey-util"

import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { AzureActiveDirectoryUser } from "./AzureActiveDirectoryUser"


export async function persistUsers(le:LogEngine, db:DBEngine, users:AzureActiveDirectoryUser[]) {
    le.logStack.push('persistUsers')
    
    try {
      
      // AAD Users ..
      le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD user updates ..')
      for(let i=0; i<users.length; i++) {
        try {

          // find (insert if missing) this User email address
          let UserID:number = 0
          let UpdateName:string|undefined = undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(users[i].emailAddress) {
            UserID = await db.getID("User", [new ColumnValuePair("UserEmailAddress", users[i].emailAddress, mssql.VarChar(255))], false)
            UpdateName = users[i].emailAddress
          }  // otherwise, use the Id; if this doesnt exist, insert it.
          if(UserID===0) {
            UserID = await db.getID("User", [new ColumnValuePair("AzureActiveDirectoryId", users[i].id, mssql.VarChar(255))], true)
            UpdateName = users[i].id
          }

          // update the User table
          let ruUser = new RowUpdate(UserID)
          ruUser.updateName = UpdateName ? UpdateName : 'unknown user'
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserEmailAddress", mssql.VarChar(255), users[i].emailAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserPrincipalName", mssql.VarChar(255), users[i].userPrincipalName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryId", mssql.VarChar(255), users[i].id))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryBusinessPhone", mssql.VarChar(255), users[i].businessPhone))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDisplayName", mssql.VarChar(255), users[i].displayName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryGivenName", mssql.VarChar(255), users[i].givenName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryJobTitle", mssql.VarChar(255), users[i].jobTitle))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryMobilePhone", mssql.VarChar(255), users[i].mobilePhone))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOfficeLocation", mssql.VarChar(255), users[i].officeLocation))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectorySurname", mssql.VarChar(255), users[i].surname))
          //ruUser.ColumnUpdates.push(new ColumnUpdate("AzureActiveDirectoryAssignedPlans", mssql.VarChar(255), users[i].assignedPlans))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCity", mssql.VarChar(255), users[i].city))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCountry", mssql.VarChar(255), users[i].country))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCreationType", mssql.VarChar(255), users[i].creationType))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDepartment", mssql.VarChar(255), users[i].department))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryEmployeeHireDate", mssql.VarChar(255), users[i].EmployeeHireDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryEmployeeId", mssql.VarChar(255), users[i].EmployeeId))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryEmployeeOrgData", mssql.VarChar(255), users[i].EmployeeOrgData))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryEmployeeType", mssql.VarChar(255), users[i].EmployeeType))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesDistinguishedName", mssql.VarChar(255), users[i].onPremisesDistinguishedName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesDomainName", mssql.VarChar(255), users[i].onPremisesDomainName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesSamAccountName", mssql.VarChar(255), users[i].onPremisesSamAccountName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesUserPrincipalName", mssql.VarChar(255), users[i].onPremisesUserPrincipalName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryPasswordPolicies", mssql.VarChar(255), users[i].passwordPolicies))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryPostalCode", mssql.VarChar(255), users[i].postalCode))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryState", mssql.VarChar(255), users[i].state))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryStreetAddress", mssql.VarChar(255), users[i].streetAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserType", mssql.VarChar(255), users[i].userType))
          // bit
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryAccountEnabled", mssql.Bit, users[i].accountEnabled))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserObservedByAzureActiveDirectory", mssql.Bit, true))
          // datetime
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCreatedDateTime", mssql.DateTime2, users[i].createdDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDeletedDateTime", mssql.DateTime2, users[i].deletedDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastPasswordChangeDateTime", mssql.DateTime2, users[i].lastPasswordChangeDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastSignInDateTime", mssql.DateTime2, users[i].lastSignInDateTime))

          const aadLastSeen = getMaxDateFromObject(users[i], [
            'createdDateTime',
            'lastPasswordChangeDateTime',
            'lastSignInDateTime'
          ])

          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastSeen", mssql.DateTime2, aadLastSeen))

          await db.updateTable('User', 'UserID', [ruUser])

          // update licenses

          //console.debug(users[i].services);

          let ruLicenses:RowUpdate[] = []
          let ruUserLicenses:RowUpdate[] = []
          for(let j=0; j<users[i].services.length; j++) {
            
            //console.debug(users[i].services[j])
            
            const LicenseID = await db.getID("License", [new ColumnValuePair("LicensePlanID", users[i].services[j].servicePlanId, mssql.VarChar(255))], true)
            let ruLicense:RowUpdate = new RowUpdate(LicenseID)
            ruLicense.ColumnUpdates.push(new ColumnUpdate("LicenseDescription", mssql.VarChar(255), users[i].services[j].serviceName))
            ruLicenses.push(ruLicense)
            
            const UserLicenseID = await db.getID("UserLicense", [
              new ColumnValuePair("UserLicenseUserID", UserID, mssql.Int),
              new ColumnValuePair("UserLicenseLicenseID", LicenseID, mssql.Int)
            ], true)
            let ruUserLicense:RowUpdate = new RowUpdate(UserLicenseID)
            ruUserLicense.ColumnUpdates.push(new ColumnUpdate("UserLicenseAssignmentDateTime", mssql.DateTime2, users[i].services[j].assignedDateTime))
            ruUserLicense.ColumnUpdates.push(new ColumnUpdate("UserLicenseAssignmentStatus", mssql.VarChar(255), users[i].services[j].serviceStatus))
            ruUserLicenses.push(ruUserLicense)
          }

          await db.updateTable('License', 'LicenseID', ruLicenses)
          await db.updateTable('UserLicense', 'UserLicenseID', ruUserLicenses)

        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err);
        }

      }
    
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      le.logStack.pop()
    }

  }

  