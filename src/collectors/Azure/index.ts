// imports
import { LogEngine } from 'whiskey-log';

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import { DBEngine } from 'whiskey-sql';

import { fetchDevices } from './Devices/fetchDevices';
import { fetchMDM } from './MDM/fetchMDM';
import { fetchEmployees } from './Employees/fetchEmployees';

import { BuildDeviceUpdates } from './Devices/BuildDeviceUpdates';
import { BuildEmployeeUpdates } from './Employees/BuildEmployeeUpdates';
import { BuildMDMUpdates } from './MDM/BuildMDMUpdates';
import { TableUpdate } from 'whiskey-sql/lib/components/TableUpdate';
import { fetchBitlockerKeys } from './Bitlocker/fetchBitlockerKeys';
import { BuildBitlockerUpdates } from './Bitlocker/BuildBitlockerUpdates';

export class Azure {

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.le=le
    this.db=db

    // set up the graph client
    this.le.AddLogEntry(LogEngine.EntryType.Info, '.. creating graph client ..')
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {scopes: ['https://graph.microsoft.com/.default']})
    this.graphClient = Client.initWithMiddleware({authProvider: authProvider})
    this.le.AddLogEntry(LogEngine.EntryType.Info, '.. graph client created.')

  }
  private le:LogEngine
  private db:DBEngine
  private graphClient:Client

  public async fetch():Promise<TableUpdate[]> {
    this.le.logStack.push('fetch')

    let updates:TableUpdate[] = []

    try {

      // get the devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying devices ..')
      let devices = await fetchDevices(this.le, this.graphClient)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${devices.length} devices ..`)
      //updates.push(... await BuildDeviceUpdates(this.le, this.db, devices))
      await this.db.PerformTableUpdates(await BuildDeviceUpdates(this.le, this.db, devices))

      // get the users
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying employees ..')
      let employees = await fetchEmployees(this.le, this.graphClient)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${employees.length} employees ..`)
      //updates.push(... await BuildEmployeeUpdates(this.le, this.db, employees))
      await this.db.PerformTableUpdates(await BuildEmployeeUpdates(this.le, this.db, employees))

      // get the MDM devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying MDM devices ..')
      let mdm = await fetchMDM(this.le, this.graphClient)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${mdm.length} MDM devices ..`)
      //updates.push(... await BuildMDMUpdates(this.le, this.db, mdm))
      await this.db.PerformTableUpdates(await BuildMDMUpdates(this.le, this.db, mdm))

      // get bitlocker keys
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying Bitlocker keys ..')
      let keys = await fetchBitlockerKeys(this.le, this.graphClient)
      this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${keys.length} bitlocker keys ..`)
      //updates.push(... await BuildMDMUpdates(this.le, this.db, mdm))
      await this.db.PerformTableUpdates(await BuildBitlockerUpdates(this.le, this.db, keys))

      //this.le.AddLogEntry(LogEngine.EntryType.Success, '.. persisting .. ')
      //await this.db.PerformTableUpdates(updates)
      
    } catch (ex) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<TableUpdate[]>((resolve) => {resolve(updates)})

  }

}