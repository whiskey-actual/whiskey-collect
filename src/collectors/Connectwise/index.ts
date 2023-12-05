// imports
import { LogEngine } from 'whiskey-log';
import { DBEngine } from 'whiskey-sql';
import { fetchUserDevices } from './fetchUserDevices';
import { fetchNetworkDevices } from './fetchNetworkDevices';
import { getAccessToken } from './getAccessToken';
import https from 'https'
import axios, { AxiosInstance } from 'axios'
import { BuildDeviceUpdates } from './BuildDeviceUpdates';
import { TableUpdate } from 'whiskey-sql/lib/components/TableUpdate';

export class Connectwise
{

  constructor(le:LogEngine, db:DBEngine, baseUrl:string, clientId:string) {
    this.le=le
    this.db=db
    
    // create the request agent
    this.axiosInstance = axios.create({baseURL: baseUrl, headers: {clientId: clientId}});
    const httpsAgent = new https.Agent({ rejectUnauthorized: false})
    this.axiosInstance.defaults.httpsAgent=httpsAgent;
  }

  private le:LogEngine
  private db:DBEngine
  private axiosInstance:AxiosInstance

  public async fetch(username:string, password:string):Promise<void> {
    this.le.logStack.push('fetch')

    try {

        let tu:TableUpdate[] = []

        // get access token
        const accessToken = await getAccessToken(this.le, this.axiosInstance, username, password)
        this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`

        // get the devices
        this.le.AddLogEntry(LogEngine.EntryType.Info, 'querying computers ..')
        const devices = await fetchUserDevices(this.le, this.axiosInstance)
        this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${devices.length} devices, persisting ..`)
        tu.push(...await BuildDeviceUpdates(this.le, this.db, devices))

        // get the network devices
        this.le.AddLogEntry(LogEngine.EntryType.Info, '.. querying network devices ..')
        const networkDevices = await fetchNetworkDevices(this.le, this.axiosInstance)
        this.le.AddLogEntry(LogEngine.EntryType.Success, `.. received ${networkDevices.length} network devices, persisting ..`)
        tu.push(...await BuildDeviceUpdates(this.le, this.db, networkDevices))

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
  
