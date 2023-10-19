// imports
import { LogEngine } from 'whiskey-log';
import { CleanedString, ldapTimestampToJS, getMaxDateFromArray, getMaxDateFromObject } from 'whiskey-util'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from 'whiskey-sql';

import { Client } from 'ldapts'
import mssql from 'mssql'



// local imports
import { OperatingSystemEngine } from '../components/OperatingSystemEngine';
import { DeviceProcessor } from '../components/DeviceProcessor';

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

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. binding LDAP ..')
      await this.ldapClient.bind(this.bindDN, this.pw);
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. authenticated successfully ..')
      
      await this.fetchDevices();
      await this.fetchUsers();
      
    } catch (ex) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${ex}`)
      throw ex;
    } finally {
      await this.ldapClient.unbind();
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  private async fetchDevices() {
    this.le.logStack.push("fetchDevices")

    try {
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. querying devices ..')
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '&(objectClass=computer)', paged: this.isPaged, sizeLimit: this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${searchEntries.length} devices .. `)
          
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. creating objects ..`)
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
              this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            }  
          }
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${this.Devices.length } objects created.`)
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.logStack.pop()
    }

  }

  private async fetchUsers() {
    this.le.logStack.push("fetchUsers")

    try {
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. querying users ..')
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '(&(objectClass=user)(&(!(objectClass=computer))))', paged: this.isPaged, sizeLimit: this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${searchEntries.length} users .. `)
          
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. creating objects ..`)
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
              this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            }  
          }
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${this.Users.length} objects created.`)
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.logStack.pop()
    }

  }

  
  public async persist() {
    this.le.logStack.push('persist')
    
    try {



      // devices
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing table updates (device) ..')
      for(let i=0; i<this.Devices.length; i++) {
        try {

          let dates:(Date|undefined)[] = []
          dates.push(this.Devices[i].activeDirectoryWhenCreated)
          dates.push(this.Devices[i].activeDirectoryWhenChanged)
          dates.push(this.Devices[i].activeDirectoryLastLogon)
          dates.push(this.Devices[i].activeDirectoryPwdLastSet)
          dates.push(this.Devices[i].activeDirectoryLastLogonTimestamp)

          const d = {
              name: this.Devices[i].deviceName,
              ad_dn: this.Devices[i].deviceDN,
              ad_dnsHostName: this.Devices[i].activeDirectoryDNSHostName,
              ad_logonCount: this.Devices[i].activeDirectoryLogonCount,
              ad_whenCreated: this.Devices[i].activeDirectoryWhenCreated,
              ad_whenChanged: this.Devices[i].activeDirectoryWhenChanged,
              ad_lastLogon: this.Devices[i].activeDirectoryLastLogon,
              ad_pwdLastSet: this.Devices[i].activeDirectoryPwdLastSet,
              ad_LastLogonTimestamp: this.Devices[i].activeDirectoryLastLogonTimestamp,
              ad_lastSeen: getMaxDateFromArray(dates)
            }
          
          await DeviceProcessor.persistDevice(this.Devices[i].deviceName, d)




          

     
          let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
          let tuDeviceActiveDirectory:TableUpdate = new TableUpdate('DeviceActiveDirectory', 'DeviceActiveDirectoryID')
          
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.Devices[i].deviceName, mssql.VarChar(255))], true)
          const DeviceActiveDirectoryID:number = await this.db.getID("DeviceActiveDirectory", [new ColumnValuePair('ActiveDirectoryDN', this.Devices[i].deviceDN, mssql.VarChar(255))], true)

          // operating system
          const ose = new OperatingSystemEngine(this.le, this.db)
          const os = ose.parse(this.Devices[i].activeDirectoryOperatingSystem, this.Devices[i].activeDirectoryOperatingSystemVersion)
          const operatingSystemXRefId:number = await ose.getId(os, true)

          // update the device table to add the corresponding DeviceActiveDirectoryID ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.Devices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryID", mssql.Int, DeviceActiveDirectoryID))
          tuDevice.RowUpdates.push(ruDevice)

          // update the DeviceActiveDirectory table values ..
          let ruDeviceActiveDirectory = new RowUpdate(DeviceActiveDirectoryID)
          ruDeviceActiveDirectory.updateName=this.Devices[i].deviceName
          // string
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("ActiveDirectoryDNSHostName", mssql.VarChar(255), this.Devices[i].activeDirectoryDNSHostName))
          // int
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLogonCount", mssql.Int, this.Devices[i].activeDirectoryLogonCount))
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryOperatingSystemXRefID", mssql.Int, operatingSystemXRefId))
          // datetimes
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryWhenCreated", mssql.DateTime2, this.Devices[i].activeDirectoryWhenCreated))
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryWhenChanged", mssql.DateTime2, this.Devices[i].activeDirectoryWhenChanged))
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLastLogon", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogon))
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryPwdLastSet", mssql.DateTime2, this.Devices[i].activeDirectoryPwdLastSet))
          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLastLogonTimestamp", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogonTimestamp))
          tuDeviceActiveDirectory.RowUpdates.push(ruDeviceActiveDirectory)

          // last seen
          const deviceLastSeen = getMaxDateFromObject(this.Devices[i], [
            'activeDirectoryWhenCreated',
            'activeDirectoryWhenChanged',
            'activeDirectoryLastLogon',
            'activeDirectoryPwdLastSet',
            'activeDirectoryLastLogonTimestamp'
          ])

          ruDeviceActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLastSeen", mssql.DateTime2, deviceLastSeen))

          await this.db.updateTable(tuDevice, true)
          await this.db.updateTable(tuDeviceActiveDirectory, true)

        } catch(err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(this.Devices[i])
          throw(err);
        }
  
      }

      // users
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing table updates (user) ..')
      for(let i=0; i<this.Users.length; i++) {
        try {

          let tuEmployee:TableUpdate = new TableUpdate('Employee', 'EmployeeID')

          let EmployeeID:number = 0
          let updateName:string|undefined=undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(this.Users[i].emailAddress) {
            EmployeeID = await this.db.getID("Employee", [new ColumnValuePair("EmployeeEmailAddress", this.Users[i].emailAddress, mssql.VarChar(255))], false)
            updateName = this.Users[i].emailAddress
          }  // otherwise, use the DN; if this doesnt exist, insert it.
          if(EmployeeID===0) {
            EmployeeID = await this.db.getID("Employee", [new ColumnValuePair("ad_DN", this.Users[i].userDN, mssql.VarChar(255))], true)
            updateName = this.Users[i].userDN
          }

          // update the Employee table values ..
          let ruEmployee = new RowUpdate(EmployeeID)
          ruEmployee.updateName=updateName ? updateName : 'unknown user'
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeEmailAddress", mssql.VarChar(255), this.Users[i].emailAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_userMail", mssql.VarChar(255), this.Users[i].userMail))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_DN", mssql.VarChar(255), this.Users[i].userDN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_CN", mssql.VarChar(255), this.Users[i].userCN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_SN", mssql.VarChar(255), this.Users[i].userSN))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_Country", mssql.VarChar(255), this.Users[i].userCountry))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_City", mssql.VarChar(255), this.Users[i].userCity))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_State", mssql.VarChar(255), this.Users[i].userState))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_Title", mssql.VarChar(255), this.Users[i].userTitle))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_Office", mssql.VarChar(255), this.Users[i].userPhysicalDeliveryOfficeName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_TelephoneNumber", mssql.VarChar(255), this.Users[i].userTelephoneNumber))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_GivenName", mssql.VarChar(255), this.Users[i].userGivenName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_DisplayName", mssql.VarChar(255), this.Users[i].userDisplayName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_Department", mssql.VarChar(255), this.Users[i].userDepartment))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_StreetAddress", mssql.VarChar(255), this.Users[i].userStreetAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_UserName", mssql.VarChar(255), this.Users[i].userName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_EmployeeID", mssql.VarChar(255), this.Users[i].userEmployeeID))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_SAMAccountName", mssql.VarChar(255), this.Users[i].userSAMAccountName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_PrincipalName", mssql.VarChar(255), this.Users[i].userPrincipalName))
          // int
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_LogonCount", mssql.Int, this.Users[i].userLogonCount))
          // bit
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_Observed", mssql.Bit, true))
          // datetime
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_CreatedDate", mssql.DateTime2, this.Users[i].userCreatedDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_ChangedDate", mssql.DateTime2, this.Users[i].userChangedDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_BadPasswordTime", mssql.DateTime2, this.Users[i].userBadPasswordTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_LastLogon", mssql.DateTime2, this.Users[i].userLastLogon))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_LastLogonTimestamp", mssql.DateTime2, this.Users[i].userLastLogonTimestamp))

          const employeeActiveDirectoryLastSeen = getMaxDateFromObject(this.Users[i], [
            //'userCreatedDate',
            //'userChangedDate',
            'userBadPasswordTime',
            'userLastLogon',
            'userLastLogonTimestamp'
          ])

          ruEmployee.ColumnUpdates.push(new ColumnUpdate("ad_LastSeen", mssql.DateTime2, employeeActiveDirectoryLastSeen))

          tuEmployee.RowUpdates.push(ruEmployee)

          await this.db.updateTable(tuEmployee, true)
        } catch(err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(this.Users[i])
          throw(err);
        }

      }

    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'done')
      this.le.logStack.pop()
    }

  }

}