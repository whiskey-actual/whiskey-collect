// imports
import { LogEngine } from 'whiskey-log';
import { CleanedString, ldapTimestampToJS, getMaxDateFromObject } from 'whiskey-util'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"

import { Client } from 'ldapts'
import mssql from 'mssql'

export class ActiveDirectoryDevice {
  // mandatory
  public readonly deviceName:string=''
  public readonly deviceDN:string=''
  // strings
  public readonly activeDirectoryOperatingSystem:string|undefined=undefined
  public readonly activeDirectoryOperatingSystemVersion:string|undefined=undefined
  public readonly activeDirectoryDNSHostName:string|undefined=undefined
  // numbers
  public readonly activeDirectoryLogonCount:number=0
  // dates
  public readonly activeDirectoryWhenCreated:Date|undefined=undefined
  public readonly activeDirectoryWhenChanged:Date|undefined=undefined
  public readonly activeDirectoryLastLogon:Date|undefined=undefined
  public readonly activeDirectoryPwdLastSet:Date|undefined=undefined
  public readonly activeDirectoryLastLogonTimestamp:Date|undefined=undefined
}


export class ActiveDirectoryUser {
  public readonly userDN:string=''
  public readonly emailAddress:string|undefined=undefined
  public readonly userCN:string|undefined=undefined
  public readonly userSN:string|undefined=undefined
  public readonly userCountry:string|undefined=undefined
  public readonly userCity:string|undefined=undefined
  public readonly userState:string|undefined=undefined
  public readonly userTitle:string|undefined=undefined
  public readonly userPhysicalDeliveryOfficeName:string|undefined=undefined
  public readonly userTelephoneNumber:string|undefined=undefined
  public readonly userGivenName:string|undefined=undefined
  public readonly userDisplayName:string|undefined=undefined
  public readonly userDepartment:string|undefined=undefined
  public readonly userStreetAddress:string|undefined=undefined
  public readonly userName:string|undefined=undefined
  public readonly userEmployeeID:string|undefined=undefined
  public readonly userLogonCount:number|undefined=undefined
  public readonly userSAMAccountName:string|undefined=undefined
  public readonly userPrincipalName:string|undefined=undefined
  public readonly userMail:string|undefined=undefined
  // dates
  public readonly userCreatedDate:Date|undefined=undefined
  public readonly userChangedDate:Date|undefined=undefined
  public readonly userBadPasswordTime:Date|undefined=undefined
  public readonly userLastLogon:Date|undefined=undefined
  public readonly userLastLogonTimestamp:Date|undefined=undefined

}

export class ActiveDirectory
{

  constructor(le:LogEngine, db:DBEngine, ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500) {
    this.le=le
    this.db=db
    this.bindDN=bindDN
    this.pw=pw
    this.searchDN=searchDN
    this.isPaged=isPaged
    this.sizeLimit=sizeLimit
    this.ldapClient = new Client({url: ldapURL, tlsOptions:{rejectUnauthorized: false}});
  }
  private le:LogEngine
  private db:DBEngine
  private bindDN:string
  private pw:string
  private searchDN:string
  private isPaged:boolean
  private sizeLimit:number
  private ldapClient:Client
  public readonly Devices:ActiveDirectoryDevice[]=[]
  public readonly Users:ActiveDirectoryUser[]=[]

  

  public async fetch():Promise<void> {
    this.le.logStack.push('fetch')

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. binding LDAP ..')
      await this.ldapClient.bind(this.bindDN, this.pw);
      this.le.AddLogEntry(LogEngine.EntryType.Success, '.. authenticated successfully ..')
      
      await this.fetchDevices();
      await this.fetchUsers();
      
    } catch (ex) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      await this.ldapClient.unbind();
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  private async fetchDevices() {
    this.le.logStack.push("fetchDevices")

    try {
          this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying devices ..')
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '&(objectClass=computer)', paged: this.isPaged, sizeLimit: this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} devices .. `)
          
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. creating objects ..`)
          for(let i=0; i<searchEntries.length; i++) {
            try {
              const add:ActiveDirectoryDevice = {
                deviceDN: searchEntries[i].dn.toString().trim(),
                deviceName: searchEntries[i].cn.toString().trim(),
                activeDirectoryOperatingSystem: CleanedString(searchEntries[i].operatingSystem),
                activeDirectoryOperatingSystemVersion: CleanedString(searchEntries[i].operatingSystemVersion),
                activeDirectoryDNSHostName: CleanedString(searchEntries[i].dNSHostName),
                activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                activeDirectoryWhenCreated: ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
                activeDirectoryWhenChanged: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                activeDirectoryLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
                activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
              }
              this.Devices.push(add)
            } catch (err) {
              this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. ${this.Devices.length } objects created.`)
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.logStack.pop()
    }

  }

  private async fetchUsers() {
    this.le.logStack.push("fetchUsers")

    try {
          this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying users ..')
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '(&(objectClass=user)(&(!(objectClass=computer))))', paged: this.isPaged, sizeLimit: this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} users .. `)
          
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. creating objects ..`)
          for(let i=0; i<searchEntries.length; i++) {
            try {
              const adu:ActiveDirectoryUser = {
                emailAddress: searchEntries[i].mail ? searchEntries[i].mail.toString().trim() : searchEntries[i].userPrincipalName ? searchEntries[i].userPrincipalName.toString().trim() : undefined,
                userDN: searchEntries[i].dn.toString().trim(),
                userCN: CleanedString(searchEntries[i].cn),
                userSN: CleanedString(searchEntries[i].sn),
                userCountry: CleanedString(searchEntries[i].c),
                userCity: CleanedString(searchEntries[i].l),
                userState: CleanedString(searchEntries[i].st),
                userTitle: CleanedString(searchEntries[i].title),
                userPhysicalDeliveryOfficeName: CleanedString(searchEntries[i].physicalDeliveryOfficeName),
                userTelephoneNumber: CleanedString(searchEntries[i].telephoneNumber),
                userGivenName: CleanedString(searchEntries[i].givenName),
                userDisplayName: CleanedString(searchEntries[i].displayName),
                userDepartment: CleanedString(searchEntries[i].department),
                userStreetAddress: CleanedString(searchEntries[i].streetAddress),
                userName: CleanedString(searchEntries[i].name),
                userEmployeeID: CleanedString(searchEntries[i].employeeID),
                userLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                userSAMAccountName: CleanedString(searchEntries[i].sAMAccountName),
                userPrincipalName: CleanedString(searchEntries[i].userPrincipalName),
                userMail: CleanedString(searchEntries[i].mail),
                userCreatedDate: searchEntries[i].whenCreated ? ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : undefined,
                userChangedDate: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                userBadPasswordTime: searchEntries[i].badPasswordTime ? ldapTimestampToJS(searchEntries[i].badPasswordTime.toString()) : undefined,
                userLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                userLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined,
              }
            this.Users.push(adu)
            } catch (err) {
              this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. ${this.Users.length} objects created.`)
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.logStack.pop()
    }

  }

  
  public async persist() {
    this.le.logStack.push('persist')
    
    try {

      // devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing table updates (device) ..')
      for(let i=0; i<this.Devices.length; i++) {
        try {

          const deviceLastSeen = getMaxDateFromObject(this.Devices[i], [
            'activeDirectoryWhenCreated',
            'activeDirectoryWhenChanged',
            'activeDirectoryLastLogon',
            'activeDirectoryPwdLastSet',
            'activeDirectoryLastLogonTimestamp'
          ])
     
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.Devices[i].deviceName, mssql.VarChar(255))], true)

          // update the device table to add the corresponding DeviceActiveDirectoryID ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.Devices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryDN", mssql.VarChar(255), this.Devices[i].deviceDN))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryDNSHostName", mssql.VarChar(255), this.Devices[i].activeDirectoryDNSHostName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryOperatingSystem", mssql.VarChar(255), this.Devices[i].activeDirectoryOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryOperatingSystemVersion", mssql.VarChar(255), this.Devices[i].activeDirectoryOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLogonCount", mssql.Int, this.Devices[i].activeDirectoryLogonCount, false))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryWhenCreated", mssql.DateTime2, this.Devices[i].activeDirectoryWhenCreated))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryWhenChanged", mssql.DateTime2, this.Devices[i].activeDirectoryWhenChanged))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastLogon", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogon))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryPwdLastSet", mssql.DateTime2, this.Devices[i].activeDirectoryPwdLastSet))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastLogonTimestamp", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogonTimestamp))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryLastSeen", mssql.DateTime2, deviceLastSeen))
          await this.db.updateTable('Device', 'DeviceID', [ruDevice])
        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.Devices[i])
          throw(err);
        }
  
      }

      // users
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing table updates (user) ..')
      for(let i=0; i<this.Users.length; i++) {
        try {

          let UserID:number = 0
          let updateName:string|undefined=undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(this.Users[i].emailAddress) {
            UserID = await this.db.getID("User", [new ColumnValuePair("UserEmailAddress", this.Users[i].emailAddress, mssql.VarChar(255))], false)
            updateName = this.Users[i].emailAddress
          }  // otherwise, use the DN; if this doesnt exist, insert it.
          if(UserID===0) {
            UserID = await this.db.getID("User", [new ColumnValuePair("UserActiveDirectoryDN", this.Users[i].userDN, mssql.VarChar(255))], true)
            updateName = this.Users[i].userDN
          }

          // update the Employee table values ..
          let ruUser = new RowUpdate(UserID)
          ruUser.updateName=updateName ? updateName : 'unknown user'
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserEmailAddress", mssql.VarChar(255), this.Users[i].emailAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserMail", mssql.VarChar(255), this.Users[i].userMail))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDN", mssql.VarChar(255), this.Users[i].userDN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCN", mssql.VarChar(255), this.Users[i].userCN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySN", mssql.VarChar(255), this.Users[i].userSN))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCountry", mssql.VarChar(255), this.Users[i].userCountry))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCity", mssql.VarChar(255), this.Users[i].userCity))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryState", mssql.VarChar(255), this.Users[i].userState))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTitle", mssql.VarChar(255), this.Users[i].userTitle))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryOffice", mssql.VarChar(255), this.Users[i].userPhysicalDeliveryOfficeName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryTelephoneNumber", mssql.VarChar(255), this.Users[i].userTelephoneNumber))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryGivenName", mssql.VarChar(255), this.Users[i].userGivenName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDisplayName", mssql.VarChar(255), this.Users[i].userDisplayName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryDepartment", mssql.VarChar(255), this.Users[i].userDepartment))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryStreetAddress", mssql.VarChar(255), this.Users[i].userStreetAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryUserName", mssql.VarChar(255), this.Users[i].userName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryEmployeeID", mssql.VarChar(255), this.Users[i].userEmployeeID))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectorySAMAccountName", mssql.VarChar(255), this.Users[i].userSAMAccountName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryPrincipalName", mssql.VarChar(255), this.Users[i].userPrincipalName))
          // int
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLogonCount", mssql.Int, this.Users[i].userLogonCount, false))
          // bit
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryObserved", mssql.Bit, true))
          // datetime
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryCreatedDate", mssql.DateTime2, this.Users[i].userCreatedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryChangedDate", mssql.DateTime2, this.Users[i].userChangedDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryBadPasswordTime", mssql.DateTime2, this.Users[i].userBadPasswordTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogon", mssql.DateTime2, this.Users[i].userLastLogon))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastLogonTimestamp", mssql.DateTime2, this.Users[i].userLastLogonTimestamp))

          const employeeActiveDirectoryLastSeen = getMaxDateFromObject(this.Users[i], [
            //'userCreatedDate',
            //'userChangedDate',
            'userBadPasswordTime',
            'userLastLogon',
            'userLastLogonTimestamp'
          ])

          ruUser.ColumnUpdates.push(new ColumnUpdate("UserActiveDirectoryLastSeen", mssql.DateTime2, employeeActiveDirectoryLastSeen))

          await this.db.updateTable('User', 'UserID', [ruUser])

        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.Users[i])
          throw(err);
        }

      }

    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      this.le.logStack.pop()
    }

  }

}