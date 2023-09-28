// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'
import { Client } from 'ldapts'

import mssql from 'mssql'
import { DBEngine, UpdatePackage } from '../components/DBEngine';

export class ActiveDirectoryObject {
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

export class ActiveDirectory
{

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly sprocName ='sp_add_activeDirectory_device' 
  public readonly ActiveDirectoryObjects:ActiveDirectoryObject[]=[]
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<void> {
    this._le.logStack.push('fetch')
    
    const client = new Client({url: ldapURL, tlsOptions:{rejectUnauthorized: false}});

    try {

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. binding LDAP ..')
      await client.bind(bindDN, pw);
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. authenticated successfully ..')
      
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. querying devices ..')
      const { searchEntries, searchReferences } = await client.search(searchDN,  {filter: '&(objectClass=computer)', paged: isPaged, sizeLimit: sizeLimit},);
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${searchEntries.length} devices .. `)
      
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. creating objects ..`)
      for(let i=0; i<searchEntries.length; i++) {
        try {

          const o:ActiveDirectoryObject = {
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
          this.ActiveDirectoryObjects.push(o)

        } catch (err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
        }  
      }
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. objects created.`)

    } catch (ex) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${ex}`)
      throw ex;
    } finally {
      await client.unbind();
    }

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'done.')
    this._le.logStack.pop()
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {

      let upDevice:UpdatePackage = { tableName:"Device", idColumn:"DeviceID", UpdatePackageItems:[]}
      let upActiveDirectoryDevice:UpdatePackage = { tableName:'DeviceActiveDirectory', idColumn:"DeviceActiveDirectoryID", UpdatePackageItems:[]}
      
      for(let i=0; i<this.ActiveDirectoryObjects.length; i++) {

        const DeviceID:number = await this._db.getID("Device", this.ActiveDirectoryObjects[i].deviceName, "deviceName")
        const DeviceActiveDirectoryID:number = await this._db.getID("DeviceActiveDirectory", this.ActiveDirectoryObjects[i].activeDirectoryDN, 'ActiveDirectoryDN')
        upDevice.UpdatePackageItems.push({idValue:DeviceID, updateColumn:"DeviceActiveDirectoryID", updateValue:DeviceActiveDirectoryID, columnType:mssql.Int})

        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "ActiveDirectoryDNSHostName", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryDNSHostName, columnType: mssql.VarChar(255) })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryLogonCount", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryLogonCount, columnType: mssql.Int })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryWhenCreated", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryWhenCreated, columnType: mssql.DateTime2 })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryWhenChanged", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryWhenChanged, columnType: mssql.DateTime2 })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryLastLogon", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryLastLogon, columnType: mssql.DateTime2 })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryPwdLastSet", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryPwdLastSet, columnType: mssql.DateTime2 })
        upActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceActiveDirectoryID, updateColumn: "activeDirectoryLastLogonTimestamp", updateValue: this.ActiveDirectoryObjects[i].activeDirectoryLastLogonTimestamp, columnType: mssql.DateTime2 })
        
        //const OperatingSystemID:number = await this._db.getID('OperatingSystem', this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)

      }
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'executing ..')
      await this._db.performUpdates(upDevice, true)
      await this._db.performUpdates(upActiveDirectoryDevice, true)
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.logStack.pop()
    }

  }

}