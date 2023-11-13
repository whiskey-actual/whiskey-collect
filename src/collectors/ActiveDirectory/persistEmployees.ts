import { LogEngine } from "whiskey-log"
import { DBEngine } from "whiskey-sql"
import { ActiveDirectoryEmployee } from "./ActiveDirectoryEmployee"
import mssql from 'mssql'
import { getMaxDateFromObject } from "whiskey-util"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"

export async function persistEmployees(le:LogEngine, db:DBEngine, employees:ActiveDirectoryEmployee[]):Promise<void> {
    le.logStack.push('persistEmployee')
    
    try {

      // employees
      le.AddLogEntry(LogEngine.EntryType.Info, 'performing table updates (employee) ..')
      for(let i=0; i<employees.length; i++) {
        try {

          let UserID:number = 0
          let updateName:string|undefined=undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(employees[i].emailAddress) {
            UserID = await db.getID("User", [new ColumnValuePair("UserEmailAddress", employees[i].emailAddress, mssql.VarChar(255))], false)
            updateName = employees[i].emailAddress
          }  // otherwise, use the DN; if this doesnt exist, insert it.
          if(UserID===0) {
            UserID = await db.getID("User", [new ColumnValuePair("UserActiveDirectoryDN", employees[i].employeeDN, mssql.VarChar(255))], true)
            updateName = employees[i].employeeDN
          }

          // update the Employee table values ..
          let ruUser = new RowUpdate(UserID)
          ruUser.updateName=updateName ? updateName : 'unknown employee'
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserEmailAddress", mssql.VarChar(255), employees[i].emailAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserMail", mssql.VarChar(255), employees[i].employeeMail))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDN", mssql.VarChar(255), employees[i].employeeDN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCN", mssql.VarChar(255), employees[i].employeeCN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySN", mssql.VarChar(255), employees[i].employeeSN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCountry", mssql.VarChar(255), employees[i].employeeCountry))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCity", mssql.VarChar(255), employees[i].employeeCity))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryState", mssql.VarChar(255), employees[i].employeeState))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTitle", mssql.VarChar(255), employees[i].employeeTitle))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryOffice", mssql.VarChar(255), employees[i].employeePhysicalDeliveryOfficeName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTelephoneNumber", mssql.VarChar(255), employees[i].employeeTelephoneNumber))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryGivenName", mssql.VarChar(255), employees[i].employeeGivenName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDisplayName", mssql.VarChar(255), employees[i].employeeDisplayName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDepartment", mssql.VarChar(255), employees[i].employeeDepartment))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryStreetAddress", mssql.VarChar(255), employees[i].employeeStreetAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserName", mssql.VarChar(255), employees[i].employeeName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryEmployeeID", mssql.VarChar(255), employees[i].employeeEmployeeID))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySAMAccountName", mssql.VarChar(255), employees[i].employeeSAMAccountName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryPrincipalName", mssql.VarChar(255), employees[i].employeePrincipalName))
          // int
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLogonCount", mssql.Int, employees[i].employeeLogonCount, false))
          // bit
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserObservedByActiveDirectory", mssql.Bit, true))
          // datetime
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCreatedDate", mssql.DateTime2, employees[i].employeeCreatedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryChangedDate", mssql.DateTime2, employees[i].employeeChangedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryBadPasswordTime", mssql.DateTime2, employees[i].employeeBadPasswordTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogon", mssql.DateTime2, employees[i].employeeLastLogon))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogonTimestamp", mssql.DateTime2, employees[i].employeeLastLogonTimestamp))

          const employeeActiveDirectoryLastSeen = getMaxDateFromObject(employees[i], [
            //'employeeCreatedDate',
            //'employeeChangedDate',
            'employeeBadPasswordTime',
            'employeeLastLogon',
            'employeeLastLogonTimestamp'
          ])

          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastSeen", mssql.DateTime2, employeeActiveDirectoryLastSeen))

          await db.updateTable('User', 'UserID', [ruUser])

        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(employees[i])
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

    return new Promise<void>((resolve) => {resolve()})

  }