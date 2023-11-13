// imports
import { LogEngine } from 'whiskey-log';
import { DBEngine } from 'whiskey-sql';
import { Client } from 'ldapts'
import { fetchDevices } from './Devices/fetchDevices';
import { persistDevices } from './Devices/persistDevices';
import { fetchEmployees } from './Employees/fetchEmployees';
import { persistEmployees } from './Employees/persistEmployees';

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

  public async fetch():Promise<void> {
    this.le.logStack.push('fetch')

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, 'binding LDAP ..')
      await this.ldapClient.bind(this.bindDN, this.pw);
      this.le.AddLogEntry(LogEngine.EntryType.Success, '.. authenticated successfully.')
      
      // get the devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'querying devices ..')
      const devices = await fetchDevices(this.le, this.searchDN, this.ldapClient, this.isPaged, this.sizeLimit)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${devices.length} devices, persisting ..`)
      await persistDevices(this.le, this.db, devices)

      // get the users
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying employees ..')
      const employees = await fetchEmployees(this.le, this.ldapClient, this.searchDN, this.isPaged, this.sizeLimit)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${employees.length} employees, persisting ..`)
      await persistEmployees(this.le, this.db, employees)
      
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
}
  
