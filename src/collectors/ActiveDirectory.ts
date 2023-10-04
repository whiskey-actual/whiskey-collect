// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'
import { Client } from 'ldapts'

import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

import { OperatingSystemEngine } from '../components/OperatingSystemEngine';

export class ActiveDirectoryDevice {
  // mandatory
  public readonly observedByActiveDirectory:boolean=true
  public readonly deviceName:string=''
  public readonly activeDirectoryDN:string=''
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
                observedByActiveDirectory: true,
                deviceName: searchEntries[i].cn.toString().trim(),
                activeDirectoryDN: searchEntries[i].dn.toString().trim(),
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
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '&(objectClass=user)', paged: this.isPaged, sizeLimit: this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${searchEntries.length} users .. `)
          
          this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. creating objects ..`)
          for(let i=0; i<searchEntries.length; i++) {
            try {

              console.debug(searchEntries[i])
              // const add:ActiveDirectoryDevice = {
              //   observedByActiveDirectory: true,
              //   deviceName: searchEntries[i].cn.toString().trim(),
              //   activeDirectoryDN: searchEntries[i].dn.toString().trim(),
              //   activeDirectoryOperatingSystem: Utilities.CleanedString(searchEntries[i].operatingSystem),
              //   activeDirectoryOperatingSystemVersion: Utilities.CleanedString(searchEntries[i].operatingSystemVersion),
              //   activeDirectoryDNSHostName: Utilities.CleanedString(searchEntries[i].dNSHostName),
              //   activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
              //   activeDirectoryWhenCreated: Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
              //   activeDirectoryWhenChanged: searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : Utilities.minimumJsonDate,
              //   activeDirectoryLastLogon: searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : Utilities.minimumJsonDate,
              //   activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : Utilities.minimumJsonDate,
              //   activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : Utilities.minimumJsonDate
              // }
              // this.ActiveDirectoryDevices.push(add)
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
    this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      
      for(let i=0; i<this.Devices.length; i++) {
     
        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuActiveDirectory:TableUpdate = new TableUpdate('DeviceActiveDirectory', 'DeviceActiveDirectoryID')
        
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.Devices[i].deviceName, mssql.VarChar(255))], true)
        const DeviceActiveDirectoryID:number = await this.db.getID("DeviceActiveDirectory", [new ColumnValuePair('ActiveDirectoryDN', this.Devices[i].activeDirectoryDN, mssql.VarChar(255))], true)

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

        await this.db.updateTable(tuDevice, true)
        await this.db.updateTable(tuActiveDirectory, true)
  
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
