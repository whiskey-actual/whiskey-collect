// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'
import { Client } from 'ldapts'

import mssql from 'mssql'
import { DBEngine } from '../components/DBEngine';
import { ActiveDirectoryDevice } from '../models/Device';

export class ActiveDirectoryObject {
  // mandatory
  public readonly observedByActiveDirectory:boolean=false
  public readonly deviceName:string=''
  public readonly activeDirectoryDN:string=''
  // strings
  public readonly activeDirectoryOperatingSystem:string=''
  public readonly activeDirectoryOperatingSystemVersion:string=''
  public readonly activeDirectoryDNSHostName:string=''
  // numbers
  public readonly activeDirectoryLogonCount:number=0
  // dates
  public readonly activeDirectoryWhenCreated:Date=Utilities.minimumJsonDate
  public readonly activeDirectoryWhenChanged:Date=Utilities.minimumJsonDate
  public readonly activeDirectoryLastLogon:Date=Utilities.minimumJsonDate
  public readonly activeDirectoryPwdLastSet:Date=Utilities.minimumJsonDate
  public readonly activeDirectoryLastLogonTimestamp:Date=Utilities.minimumJsonDate
}

export class ActiveDirectory
{

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine = new LogEngine([])
  private _db:DBEngine = new DBEngine(this._le, '')
  public readonly sprocName ='sp_add_activeDirectory_device' 
  public readonly ActiveDirectoryObjects:ActiveDirectoryObject[]=[]
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryObject[]> {

    let output:ActiveDirectoryObject[] = []
    this._le.logStack.push('fetch')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'initializing ..')

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
    return new Promise<ActiveDirectoryObject[]>((resolve) => {resolve(output)})

  }

  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      const sqlRequests:mssql.Request[]=[]
      
      for(let i=0; i<this.ActiveDirectoryObjects.length; i++) {
        const DeviceID:number = await this._db.getID("Device", this.ActiveDirectoryObjects[i].deviceName, "deviceName")
        const OperatingSystemID:number = await this._db.getID('OperatingSystem', this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)

        //const OperatingSystemID:number = await sql.getID("OperatingSystem", this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)
        const DeviceActiveDirectoryID:number = await this._db.getID("DeviceActiveDirectory", this.ActiveDirectoryObjects[i].activeDirectoryDN, 'ActiveDirectoryDN')

        await this._db.updateSingleValue("Device", "DeviceID", DeviceID, "DeviceActiveDirectoryID", DeviceActiveDirectoryID, mssql.Int, true)
        await this._db.updateSingleValue("DeviceActiveDirectory", "DeviceActiveDirectoryID", DeviceActiveDirectoryID, "ActiveDirectoryDNSHostName", this.ActiveDirectoryObjects[i].activeDirectoryDNSHostName, mssql.VarChar(255), true )

        // const r:mssql.Request = new mssql.Request()
        // r.input('DeviceID', mssql.Int)
        // r.input('OperatingSystemID', mssql.Int)
        // r.input('ActiveDirectoryDN', mssql.VarChar(255))
        // r.input('activeDirectoryDNSHostName', mssql.VarChar(255))
        // r.input('activeDirectoryLogonCount', mssql.Int)
        // r.input('activeDirectoryWhenCreated', mssql.DateTime2)
        // r.input('activeDirectoryWhenChanged', mssql.DateTime2)
        // r.input('activeDirectoryLastLogon', mssql.DateTime2)
        // r.input('activeDirectoryPwdLastSet', mssql.DateTime2)
        // r.input('activeDirectoryLastLogonTimestamp', mssql.DateTime2)
        // sqlRequests.push(r)

      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. executing ${this.sprocName} for ${sqlRequests.length} items`)
      await this._db.executeSprocs(this.sprocName, sqlRequests)
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    }

  }

}



 // .input('deviceName', mssql.VarChar(64), Utilities.CleanedString(searchEntries[i].cn))
// .input('activeDirectoryDN', mssql.VarChar(255), Utilities.CleanedString(searchEntries[i].dn))
// .input('activeDirectoryOperatingSystem', mssql.VarChar(255), Utilities.CleanedString(searchEntries[i].operatingSystem))
// //.input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), Utilities.CleanedString(searchEntries[i].operatingSystemVersion))
// .input('activeDirectoryDNSHostName', mssql.VarChar(255), Utilities.CleanedString(searchEntries[i].dNSHostName))
// // int
// .input('activeDirectoryLogonCount', mssql.Int, isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount))
// // datetimes
// .input('activeDirectoryWhenCreated', mssql.DateTime2, Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()))
// .input('activeDirectoryWhenChanged', mssql.DateTime2, searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined)
// .input('activeDirectoryLastLogon', mssql.DateTime2, searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined)
// .input('activeDirectoryPwdLastSet', mssql.DateTime2, searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined)
// .input('activeDirectoryLastLogonTimestamp', mssql.DateTime2, searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined)

// const device:ActiveDirectoryDevice = {
//   // mandatory
//   observedByActiveDirectory: true,
//   deviceName: searchEntries[i].cn.toString().trim(),
//   activeDirectoryDN: searchEntries[i].dn.toString().trim(),
//   // strings
//   activeDirectoryOperatingSystem: Utilities.CleanedString(searchEntries[i].operatingSystem),
//   activeDirectoryOperatingSystemVersion: Utilities.CleanedString(searchEntries[i].operatingSystemVersion),
//   activeDirectoryDNSHostName: Utilities.CleanedString(searchEntries[i].dNSHostName),
//   // numbers
//   activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
//   // dates
//   activeDirectoryWhenCreated: Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
//   activeDirectoryWhenChanged: searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
//   activeDirectoryLastLogon: searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
//   activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
//   activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
// }
// output.push(device)