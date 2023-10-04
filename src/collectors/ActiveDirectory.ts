// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'
import { Client } from 'ldapts'

import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

import { OperatingSystemEngine } from '../components/OperatingSystemEngine';

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
  public readonly activeDirectoryWhenCreated:Date=Utilities.minimumJsonDate
  public readonly activeDirectoryWhenChanged:Date|undefined=undefined
  public readonly activeDirectoryLastLogon:Date|undefined=undefined
  public readonly activeDirectoryPwdLastSet:Date|undefined=undefined
  public readonly activeDirectoryLastLogonTimestamp:Date|undefined=undefined
}

export class ActiveDirectoryUser {
  public readonly userDN:string=''
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
  public readonly userCreatedDate:Date=Utilities.minimumJsonDate
  public readonly userChangedDate:Date=Utilities.minimumJsonDate
  public readonly userBadPasswordTime:Date=Utilities.minimumJsonDate
  public readonly userLastLogon:Date=Utilities.minimumJsonDate
  public readonly userLastLogonTimestamp:Date=Utilities.minimumJsonDate

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
                activeDirectoryOperatingSystem: Utilities.CleanedString(searchEntries[i].operatingSystem),
                activeDirectoryOperatingSystemVersion: Utilities.CleanedString(searchEntries[i].operatingSystemVersion),
                activeDirectoryDNSHostName: Utilities.CleanedString(searchEntries[i].dNSHostName),
                activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                activeDirectoryWhenCreated: Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
                activeDirectoryWhenChanged: searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : Utilities.minimumJsonDate,
                activeDirectoryLastLogon: searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : Utilities.minimumJsonDate,
                activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : Utilities.minimumJsonDate,
                activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : Utilities.minimumJsonDate
              }
              this.Devices.push(add)
            } catch (err) {
              this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            }  
          }
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${this.Devices.length }objects created.`)
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
                userDN: searchEntries[i].dn.toString().trim(),
                userCN: Utilities.CleanedString(searchEntries[i].cn),
                userSN: Utilities.CleanedString(searchEntries[i].sn),
                userCountry: Utilities.CleanedString(searchEntries[i].c),
                userCity: Utilities.CleanedString(searchEntries[i].l),
                userState: Utilities.CleanedString(searchEntries[i].st),
                userTitle: Utilities.CleanedString(searchEntries[i].title),
                userPhysicalDeliveryOfficeName: Utilities.CleanedString(searchEntries[i].physicalDeliveryOfficeName),
                userTelephoneNumber: Utilities.CleanedString(searchEntries[i].telephoneNumber),
                userGivenName: Utilities.CleanedString(searchEntries[i].givenName),
                userDisplayName: Utilities.CleanedString(searchEntries[i].displayName),
                userDepartment: Utilities.CleanedString(searchEntries[i].department),
                userStreetAddress: Utilities.CleanedString(searchEntries[i].streetAddress),
                userName: Utilities.CleanedString(searchEntries[i].name),
                userEmployeeID: Utilities.CleanedString(searchEntries[i].employeeID),
                userLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                userSAMAccountName: Utilities.CleanedString(searchEntries[i].sAMAccountName),
                userPrincipalName: Utilities.CleanedString(searchEntries[i].userPrincipalName),
                userMail: Utilities.CleanedString(searchEntries[i].mail),
                userCreatedDate: searchEntries[i].whenCreated ? Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : Utilities.minimumJsonDate,
                userChangedDate: searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : Utilities.minimumJsonDate,
                userBadPasswordTime: searchEntries[i].badPasswordTime ? Utilities.ldapTimestampToJS(searchEntries[i].badPasswordTime.toString()) : Utilities.minimumJsonDate,
                userLastLogon: searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : Utilities.minimumJsonDate,
                userLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : Utilities.minimumJsonDate,
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

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building device requests ..')
      
      for(let i=0; i<this.Devices.length; i++) {
     
        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuActiveDirectory:TableUpdate = new TableUpdate('DeviceActiveDirectory', 'DeviceActiveDirectoryID')
        
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.Devices[i].deviceName, mssql.VarChar(255))], true)
        const DeviceActiveDirectoryID:number = await this.db.getID("DeviceActiveDirectory", [new ColumnValuePair('ActiveDirectoryDN', this.Devices[i].deviceDN, mssql.VarChar(255))], true)

        // update the device table to add the corresponding DeviceActiveDirectoryID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.Devices[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceActiveDirectoryID", mssql.Int, DeviceActiveDirectoryID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceActiveDirectory table values ..
        let ruActiveDirectory = new RowUpdate(DeviceActiveDirectoryID)
        ruActiveDirectory.updateName=this.Devices[i].deviceName
        // string
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("ActiveDirectoryDNSHostName", mssql.VarChar(255), this.Devices[i].activeDirectoryDNSHostName))
        // int
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLogonCount", mssql.Int, this.Devices[i].activeDirectoryLogonCount))
        // datetimes
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryWhenCreated", mssql.DateTime2, this.Devices[i].activeDirectoryWhenCreated))
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryWhenChanged", mssql.DateTime2, this.Devices[i].activeDirectoryWhenChanged))
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLastLogon", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogon))
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryPwdLastSet", mssql.DateTime2, this.Devices[i].activeDirectoryPwdLastSet))
        ruActiveDirectory.ColumnUpdates.push(new ColumnUpdate("activeDirectoryLastLogonTimestamp", mssql.DateTime2, this.Devices[i].activeDirectoryLastLogonTimestamp))
        tuActiveDirectory.RowUpdates.push(ruActiveDirectory)

        // operating system
        const ose = new OperatingSystemEngine(this.le, this.db)
        const os = ose.parseActiveDirectory(this.Devices[i].activeDirectoryOperatingSystem, this.Devices[i].activeDirectoryOperatingSystemVersion)
        await ose.persist(DeviceID, os)

        this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing table updates ..')
        await this.db.updateTable(tuDevice, true)
        await this.db.updateTable(tuActiveDirectory, true)
        this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done.')
  
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building user requests ..')
      for(let i=0; i<this.Users.length; i++) {

        let tuEmployee:TableUpdate = new TableUpdate('Employee', 'EmployeeID')
        
        const EmployeeID:number = await this.db.getID("Employee", [new ColumnValuePair("EmployeeActiveDirectoryDN", this.Users[i].userDN, mssql.VarChar(255))], true)

        // update the Employee table values ..
        let ruEmployee = new RowUpdate(EmployeeID)
        ruEmployee.updateName=this.Users[i].userDN
        
        // string
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCN", mssql.VarChar(255), this.Users[i].userCN))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectorySN", mssql.VarChar(255), this.Users[i].userSN))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCountry", mssql.VarChar(255), this.Users[i].userCountry))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCity", mssql.VarChar(255), this.Users[i].userCity))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryState", mssql.VarChar(255), this.Users[i].userState))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryTitle", mssql.VarChar(255), this.Users[i].userTitle))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryOffice", mssql.VarChar(255), this.Users[i].userPhysicalDeliveryOfficeName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryTelephoneNumber", mssql.VarChar(255), this.Users[i].userTelephoneNumber))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryGivenName", mssql.VarChar(255), this.Users[i].userGivenName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryDisplayName", mssql.VarChar(255), this.Users[i].userDisplayName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryDepartment", mssql.VarChar(255), this.Users[i].userDepartment))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryStreetAddress", mssql.VarChar(255), this.Users[i].userStreetAddress))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserName", mssql.VarChar(255), this.Users[i].userName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryEmployeeID", mssql.VarChar(255), this.Users[i].userEmployeeID))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectorySAMAccountName", mssql.VarChar(255), this.Users[i].userSAMAccountName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryPrincipalName", mssql.VarChar(255), this.Users[i].userPrincipalName))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryUserMail", mssql.VarChar(255), this.Users[i].userMail))

        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLogonCount", mssql.Int, this.Users[i].userLogonCount))

        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryCreatedDate", mssql.DateTime2, this.Users[i].userCreatedDate))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryChangedDate", mssql.DateTime2, this.Users[i].userChangedDate))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryBadPasswordTime", mssql.DateTime2, this.Users[i].userBadPasswordTime))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLastLogon", mssql.DateTime2, this.Users[i].userLastLogon))
        ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeActiveDirectoryLastLogonTimestamp", mssql.DateTime2, this.Users[i].userLastLogonTimestamp))

        tuEmployee.RowUpdates.push(ruEmployee)

        this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing table updates ..')
        await this.db.updateTable(tuEmployee, true)
        this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done.')

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