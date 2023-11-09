// imports
import { LogEngine } from 'whiskey-log';
import { DBEngine } from 'whiskey-sql';
import { Client } from 'ldapts'
import { fetchDevices } from './fetchDevices';
import { persistDevices } from './persistDevices';
import { fetchUsers } from './fetchUsers';
import { persistUsers } from './persistUsers';

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

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. binding LDAP ..')
      await this.ldapClient.bind(this.bindDN, this.pw);
      this.le.AddLogEntry(LogEngine.EntryType.Success, '.. authenticated successfully ..')
      
      // get the devices
      let devices = await fetchDevices(this.le, this.searchDN, this.ldapClient, this.isPaged, this.sizeLimit)
      await persistDevices(this.le, this.db, devices)

      // get the users
      let users = await fetchUsers(this.le, this.ldapClient, this.searchDN, this.isPaged, this.sizeLimit)
      await persistUsers(this.le, this.db, users)
      
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
  
