// imports
import { LogEngine } from 'whiskey-log';
import axios, { AxiosInstance } from 'axios'

import { DBEngine } from 'whiskey-sql';
import { getAccessToken } from './getAccessToken';
import { fetchDevices } from './fetchDevices';
import { persistDevices } from './persistDevices';

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

        // get access token
        const accessToken = getAccessToken(this.le, this.axiosInstance, clientId, clientSecret)
        this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`   

        // get the devices
        this.le.AddLogEntry(LogEngine.EntryType.Info, 'querying computers ..')
        const devices = await fetchDevices(this.le, this.axiosInstance)
        this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${devices.length} devices, persisting ..`)
        await persistDevices(this.le, this.db, devices)
      
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