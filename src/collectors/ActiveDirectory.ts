// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'
import { Client } from 'ldapts'

import { ActiveDirectoryDevice } from '../models/Device';

export class ActiveDirectory
{

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryDevice[]> {

    let output:ActiveDirectoryDevice[]=[]
    this._le.logStack.push('fetch')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'initializing ..')

    const client = new Client(
      {
        url: ldapURL,
        tlsOptions:
          {
            rejectUnauthorized: false
          }
      }
    );

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

          const device:ActiveDirectoryDevice = {
            // mandatory
            observedByActiveDirectory: true,
            deviceName: searchEntries[i].cn.toString().trim(),
            activeDirectoryDN: searchEntries[i].dn.toString().trim(),
            // strings
            activeDirectoryOperatingSystem: Utilities.CleanedString(searchEntries[i].operatingSystem),
            activeDirectoryOperatingSystemVersion: Utilities.CleanedString(searchEntries[i].operatingSystemVersion),
            activeDirectoryDNSHostName: Utilities.CleanedString(searchEntries[i].dNSHostName),
            // numbers
            activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
            // dates
            activeDirectoryWhenCreated: Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
            activeDirectoryWhenChanged: searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
            activeDirectoryLastLogon: searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
            activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
            activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
          }
          output.push(device)

          // let q = new sql.Request()
          // .input('deviceName', sql.VarChar(64), Utilities.CleanedString(searchEntries[i].cn))
          // .input('activeDirectoryDN', sql.VarChar(255), Utilities.CleanedString(searchEntries[i].dn))
          // .input('activeDirectoryOperatingSystem', sql.VarChar(255), Utilities.CleanedString(searchEntries[i].operatingSystem))
          // //.input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), Utilities.CleanedString(searchEntries[i].operatingSystemVersion))
          // .input('activeDirectoryDNSHostName', sql.VarChar(255), Utilities.CleanedString(searchEntries[i].dNSHostName))
          // // int
          // .input('activeDirectoryLogonCount', sql.Int, isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount))
          // // datetimes
          // .input('activeDirectoryWhenCreated', sql.DateTime2, Utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()))
          // .input('activeDirectoryWhenChanged', sql.DateTime2, searchEntries[i].whenChanged ? Utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined)
          // .input('activeDirectoryLastLogon', sql.DateTime2, searchEntries[i].lastLogon ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined)
          // .input('activeDirectoryPwdLastSet', sql.DateTime2, searchEntries[i].pwdLastSet ? Utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined)
          // .input('activeDirectoryLastLogonTimestamp', sql.DateTime2, searchEntries[i].lastLogonTimestamp ? Utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined)
          // output.sqlRequests.push(q)
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
    return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }

}
