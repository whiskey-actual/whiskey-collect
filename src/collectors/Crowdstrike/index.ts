// imports
import { LogEngine } from 'whiskey-log';
import axios, { AxiosInstance } from 'axios'

import { DBEngine } from 'whiskey-sql';
import { getAccessToken } from './getAccessToken';
import { fetchDevices } from './fetchDevices';
import { BuildDeviceUpdates } from './BuildDeviceUpdates';
import { TableUpdate } from 'whiskey-sql/lib/components/TableUpdate';

export class Crowdstrike
{

  constructor(le:LogEngine, db:DBEngine, baseURL:string) {
    this.le=le
    this.db=db

    // create instance ..
    this.axiosInstance = axios.create({baseURL: baseURL});
       
  }
  private le:LogEngine
  private db:DBEngine
  private axiosInstance:AxiosInstance

  
  public async fetch(clientId:string, clientSecret:string):Promise<void> {
    this.le.logStack.push('fetch')

    try {

        let tu:TableUpdate[] = []

        // get access token
        const accessToken = await getAccessToken(this.le, this.axiosInstance, clientId, clientSecret)
        this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`   

        // get the devices
        this.le.AddLogEntry(LogEngine.EntryType.Info, 'querying computers ..')
        const devices = await fetchDevices(this.le, this.axiosInstance)
        this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${devices.length} devices, persisting ..`)
        tu.push(... await BuildDeviceUpdates(this.le, this.db, devices))

        await this.db.PerformTableUpdates(tu)
      
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