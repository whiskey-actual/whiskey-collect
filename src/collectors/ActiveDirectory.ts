// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'


import mssql from 'mssql'
import { Client } from 'ldapts'

import { SqlRequestCollection } from '../database/SqlRequestCollection'
import { MicrosoftSql } from '../database/MicrosoftSql';
import { OperatingSystem } from '../components/OperatingSystem';

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

  constructor(le:LogEngine, sqlConfig:string) {
    this._le=le
    this._sqlConfig = sqlConfig
  }
  private _le:LogEngine = new LogEngine([])
  private _sqlConfig = ''
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

    const sql = new MicrosoftSql(this._le, this._sqlConfig)
    
    for(let i=0; i<this.ActiveDirectoryObjects.length; i++) {
      const DeviceID:number = await sql.getID("Device", this.ActiveDirectoryObjects[i].deviceName, "deviceName")

      let os = new OperatingSystem(this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)
      const OperatingSystemID:number = await os.getId(this._le, this._sqlConfig);
      await os.getValues(this._le, this._sqlConfig, OperatingSystemID)

      //const OperatingSystemID:number = await sql.getID("OperatingSystem", this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)
      const DeviceActiveDirectoryID:number = await sql.getID("DeviceActiveDirectory", this.ActiveDirectoryObjects[i].activeDirectoryDN)

      let ps = new mssql.PreparedStatement()
      ps.input('DeviceID', mssql.Int)
      ps.input('OperatingSystemID', mssql.Int)
      ps.input('ActiveDirectoryDN', mssql.VarChar(255))
      ps.input('activeDirectoryDNSHostName', mssql.VarChar(255))
      ps.input('activeDirectoryLogonCount', mssql.Int)
      ps.input('activeDirectoryWhenCreated', mssql.DateTime2)
      ps.input('activeDirectoryWhenChanged', mssql.DateTime2)
      ps.input('activeDirectoryLastLogon', mssql.DateTime2)
      ps.input('activeDirectoryPwdLastSet', mssql.DateTime2)
      ps.input('activeDirectoryLastLogonTimestamp', mssql.DateTime2)

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