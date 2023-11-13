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

          let EmployeeID:number = 0
          let updateName:string|undefined=undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(employees[i].emailAddress) {
            EmployeeID = await db.getID("Employee", [new ColumnValuePair("EmployeeEmailAddress", employees[i].emailAddress, mssql.VarChar(255))], false)
            updateName = employees[i].emailAddress
          }  // otherwise, use the DN; if this doesnt exist, insert it.
          if(EmployeeID===0) {
            EmployeeID = await db.getID("Employee", [new ColumnValuePair("EmployeeActiveDirectoryDN", employees[i].employeeDN, mssql.VarChar(255))], true)
            updateName = employees[i].employeeDN
          }

          // update the Employee table values ..
          let ruEmployee = new RowUpdate(EmployeeID)
          ruEmployee.updateName=updateName ? updateName : 'unknown employee'
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeEmailAddress", mssql.VarChar(255), employees[i].emailAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserMail", mssql.VarChar(255), employees[i].employeeMail))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryDN", mssql.VarChar(255), employees[i].employeeDN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCN", mssql.VarChar(255), employees[i].employeeCN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectorySN", mssql.VarChar(255), employees[i].employeeSN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCountry", mssql.VarChar(255), employees[i].employeeCountry))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCity", mssql.VarChar(255), employees[i].employeeCity))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryState", mssql.VarChar(255), employees[i].employeeState))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryTitle", mssql.VarChar(255), employees[i].employeeTitle))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryOffice", mssql.VarChar(255), employees[i].employeePhysicalDeliveryOfficeName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryTelephoneNumber", mssql.VarChar(255), employees[i].employeeTelephoneNumber))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryGivenName", mssql.VarChar(255), employees[i].employeeGivenName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryDisplayName", mssql.VarChar(255), employees[i].employeeDisplayName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryDepartment", mssql.VarChar(255), employees[i].employeeDepartment))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryStreetAddress", mssql.VarChar(255), employees[i].employeeStreetAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserName", mssql.VarChar(255), employees[i].employeeName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserID", mssql.VarChar(255), employees[i].employeeUserID))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectorySAMAccountName", mssql.VarChar(255), employees[i].employeeSAMAccountName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserPrincipalName", mssql.VarChar(255), employees[i].employeeUserPrincipalName))
          // int
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLogonCount", mssql.Int, employees[i].employeeLogonCount, false))
          // bit
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeObservedByActiveDirectory", mssql.Bit, true))
          // datetime
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCreatedDate", mssql.DateTime2, employees[i].employeeCreatedDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryChangedDate", mssql.DateTime2, employees[i].employeeChangedDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryBadPasswordTime", mssql.DateTime2, employees[i].employeeBadPasswordTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLastLogon", mssql.DateTime2, employees[i].employeeLastLogon))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLastLogonTimestamp", mssql.DateTime2, employees[i].employeeLastLogonTimestamp))

          const employeeActiveDirectoryLastSeen = getMaxDateFromObject(employees[i], [
            //'employeeCreatedDate',
            //'employeeChangedDate',
            'employeeBadPasswordTime',
            'employeeLastLogon',
            'employeeLastLogonTimestamp'
          ])

          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLastSeen", mssql.DateTime2, employeeActiveDirectoryLastSeen))

          await db.updateTable('Employee', 'EmployeeID', [ruEmployee])

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