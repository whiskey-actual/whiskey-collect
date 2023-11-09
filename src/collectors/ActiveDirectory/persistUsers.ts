import { LogEngine } from "whiskey-log"
import { DBEngine } from "whiskey-sql"
import { ActiveDirectoryUser } from "./ActiveDirectoryUser"
import mssql from 'mssql'
import { getMaxDateFromObject } from "whiskey-util"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"

export async function persistUsers(le:LogEngine, db:DBEngine, users:ActiveDirectoryUser[]):Promise<void> {
    le.logStack.push('persistUsers')
    
    try {

      // users
      le.AddLogEntry(LogEngine.EntryType.Info, 'performing table updates (user) ..')
      for(let i=0; i<users.length; i++) {
        try {

          let UserID:number = 0
          let updateName:string|undefined=undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(users[i].emailAddress) {
            UserID = await db.getID("User", [new ColumnValuePair("UserEmailAddress", users[i].emailAddress, mssql.VarChar(255))], false)
            updateName = users[i].emailAddress
          }  // otherwise, use the DN; if this doesnt exist, insert it.
          if(UserID===0) {
            UserID = await db.getID("User", [new ColumnValuePair("UserActiveDirectoryDN", users[i].userDN, mssql.VarChar(255))], true)
            updateName = users[i].userDN
          }

          // update the Employee table values ..
          let ruUser = new RowUpdate(UserID)
          ruUser.updateName=updateName ? updateName : 'unknown user'
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserEmailAddress", mssql.VarChar(255), users[i].emailAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserMail", mssql.VarChar(255), users[i].userMail))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDN", mssql.VarChar(255), users[i].userDN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCN", mssql.VarChar(255), users[i].userCN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySN", mssql.VarChar(255), users[i].userSN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCountry", mssql.VarChar(255), users[i].userCountry))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCity", mssql.VarChar(255), users[i].userCity))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryState", mssql.VarChar(255), users[i].userState))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTitle", mssql.VarChar(255), users[i].userTitle))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryOffice", mssql.VarChar(255), users[i].userPhysicalDeliveryOfficeName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTelephoneNumber", mssql.VarChar(255), users[i].userTelephoneNumber))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryGivenName", mssql.VarChar(255), users[i].userGivenName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDisplayName", mssql.VarChar(255), users[i].userDisplayName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDepartment", mssql.VarChar(255), users[i].userDepartment))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryStreetAddress", mssql.VarChar(255), users[i].userStreetAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserName", mssql.VarChar(255), users[i].userName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryEmployeeID", mssql.VarChar(255), users[i].userEmployeeID))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySAMAccountName", mssql.VarChar(255), users[i].userSAMAccountName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryPrincipalName", mssql.VarChar(255), users[i].userPrincipalName))
          // int
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLogonCount", mssql.Int, users[i].userLogonCount, false))
          // bit
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserObservedByActiveDirectory", mssql.Bit, true))
          // datetime
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCreatedDate", mssql.DateTime2, users[i].userCreatedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryChangedDate", mssql.DateTime2, users[i].userChangedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryBadPasswordTime", mssql.DateTime2, users[i].userBadPasswordTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogon", mssql.DateTime2, users[i].userLastLogon))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogonTimestamp", mssql.DateTime2, users[i].userLastLogonTimestamp))

          const employeeActiveDirectoryLastSeen = getMaxDateFromObject(users[i], [
            //'userCreatedDate',
            //'userChangedDate',
            'userBadPasswordTime',
            'userLastLogon',
            'userLastLogonTimestamp'
          ])

          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastSeen", mssql.DateTime2, employeeActiveDirectoryLastSeen))

          await db.updateTable('User', 'UserID', [ruUser])

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

    return new Promise<void>((resolve) => {resolve()})

  }