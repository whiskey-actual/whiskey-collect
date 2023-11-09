// imports
import { LogEngine } from 'whiskey-log';

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import { DBEngine } from 'whiskey-sql';

import { fetchDevices } from './fetchDevices';
import { fetchMDM } from './fetchMDM';
import { fetchUsers } from './fetchUsers';

import { persistDevices } from './persistDevices';
import { persistUsers } from './persistUsers';
import { persistMDM } from './persistMDM';

export class Azure {

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.le=le
    this.db=db

    // set up the graph client
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {scopes: ['https://graph.microsoft.com/.default']})
    this.graphClient = Client.initWithMiddleware({authProvider: authProvider})

  }
  private le:LogEngine
  private db:DBEngine
  private graphClient:Client

  public async fetch():Promise<void> {
    this.le.logStack.push('fetch')

    try {
      
      // get the devices
      let devices = await fetchDevices(this.le, this.graphClient)
      await persistDevices(this.le, this.db, devices)

      // get the MDM devices
      let mdm = await fetchMDM(this.le, this.graphClient)
      await persistMDM(this.le, this.db, mdm)

      // get the users
      let users = await fetchUsers(this.le, this.graphClient)
      await persistUsers(this.le, this.db, users)
      
    } catch (ex) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

}