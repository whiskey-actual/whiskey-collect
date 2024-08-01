// imports
import { LogEngine } from 'whiskey-log';
import axios, { AxiosInstance } from 'axios'

import { getProgressMessage } from "whiskey-util";

import { CleanedString, CleanedDate } from "whiskey-util";

export class CrowdstrikeCollector
{

  constructor(baseURL:string, clientId:string, clientSecret:string) {
    this.baseUrl=baseURL
    this.clientId=clientId
    this.clientSecret=clientSecret

  }
  private le:LogEngine=new LogEngine(["CrowdStrike"])
  private baseUrl:string=""
  private clientId:string=""
  private clientSecret:string=""

  private async getAccessToken(axiosInstance:AxiosInstance):Promise<string> {
    this.le.logStack.push("getAccessToken")
    let output:string

    try {
        this.le.AddLogEntry(LogEngine.EntryType.Info, 'getting access token ..')
        const response = await axiosInstance.post(`/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
        output = response.data.access_token;
        this.le.AddLogEntry(LogEngine.EntryType.Success, `.. accessToken received.`)
    } catch (ex) {
        this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
        throw ex;
    } finally {
        this.le.logStack.pop()
    }

    return new Promise<string>((resolve) => {resolve(output)})

}
  
  private async fetchDevice(axiosInstance:AxiosInstance, deviceId:string):Promise<CrowdstrikeDevice> {
    this.le.logStack.push('fetchDevice')

    let output:CrowdstrikeDevice

    try {

          const response = await axiosInstance.get(`/devices/entities/devices/v1?ids=${deviceId}`)
          const deviceDetails = response.data.resources[0];
          
          output = {
            // mandatory
            observedByCrowdstrike: true,
            deviceName: deviceDetails.hostname.toString().trim(),
            crowdstrikeDeviceId: deviceDetails.device_id.toString().trim(),
            // strings
            crowdstrikeCID: CleanedString(deviceDetails.cid),
            crowdstrikeAgentVersion: CleanedString(deviceDetails.agent_version),
            crowdstrikeBIOSManufacturer: CleanedString(deviceDetails.bios_manufacturer),
            crowdstrikeBIOSVersion: CleanedString(deviceDetails.bios_version),
            crowdstrikeExternalIP: CleanedString(deviceDetails.external_ip),
            crowdstrikeMACAddress: CleanedString(deviceDetails.mac_address),
            crowdstrikeLocalIP: CleanedString(deviceDetails.local_ip),
            crowdstrikeMachineDomain: CleanedString(deviceDetails.machine_domain),
            crowdstrikeMajorVersion: CleanedString(deviceDetails.major_version),
            crowdstrikeMinorVersion: CleanedString(deviceDetails.minor_version),
            crowdstrikeOSBuild: CleanedString(deviceDetails.os_build),
            crowdstrikeOSVersion: CleanedString(deviceDetails.os_version),
            crowdstrikePlatformName: CleanedString(deviceDetails.platform_name),
            crowdstrikeReducedFunctionalityMode: CleanedString(deviceDetails.reduced_functionality_mode),
            crowdstrikeProductTypeDesc: CleanedString(deviceDetails.product_type_desc),
            crowdstrikeProvisionStatus: CleanedString(deviceDetails.provision_status),
            crowdstrikeSerialNumber: CleanedString(deviceDetails.serial_number),
            crowdstrikeServicePackMajor: CleanedString(deviceDetails.service_pack_major),
            crowdstrikeServicePackMinor: CleanedString(deviceDetails.service_pack_minor),
            crowdstrikeStatus: CleanedString(deviceDetails.status),
            crowdstrikeSystemManufacturer: CleanedString(deviceDetails.system_manufacturer),
            crowdstrikeSystemProductName: CleanedString(deviceDetails.system_product_name),
            crowdstrikeKernelVersion: CleanedString(deviceDetails.kernel_version),
            // datetimes
            crowdstrikeFirstSeenDateTime: CleanedDate(deviceDetails.first_seen),
            crowdstrikeLastSeenDateTime: CleanedDate(deviceDetails.last_seen),
            crowdstrikeModifiedDateTime: CleanedDate(deviceDetails.modified_timestamp)
          }

    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice>((resolve) => {resolve(output)})
  }
  
  public async getDevices():Promise<CrowdstrikeDevice[]> {
    this.le.logStack.push('fetchDevices')

    let output:CrowdstrikeDevice[] = []

    try {

      let axiosInstance = axios.create({baseURL: this.baseUrl});
      const accessToken = await this.getAccessToken(axiosInstance)
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`   


      const foundDevices = (await axiosInstance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${foundDevices.length} devices; fetching details ..`)

      const startDate = new Date()
      const logUpdateInterval:number=250

      for(let i=0; i<foundDevices.length; i++) {

        try {
            const deviceObject = await this.fetchDevice(axiosInstance, foundDevices[i])
            output.push(deviceObject)

            if(i>0 && i%logUpdateInterval===0) {
                this.le.AddLogEntry(LogEngine.EntryType.Info, getProgressMessage('', 'retrieved', i, foundDevices.length, startDate, new Date()))
            }

        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')

    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
  }

}

export class CrowdstrikeDevice {
  // mandatory
  public readonly observedByCrowdstrike:boolean = true
  public readonly deviceName: string=''
  public readonly crowdstrikeDeviceId:string=''
  // strings
  public readonly crowdstrikeCID: string|undefined=undefined
  public readonly crowdstrikeAgentVersion: string|undefined=undefined
  public readonly crowdstrikeBIOSManufacturer: string|undefined=undefined
  public readonly crowdstrikeBIOSVersion: string|undefined=undefined
  public readonly crowdstrikeExternalIP: string|undefined=undefined
  public readonly crowdstrikeMACAddress: string|undefined=undefined
  public readonly crowdstrikeLocalIP: string|undefined=undefined
  public readonly crowdstrikeMachineDomain: string|undefined=undefined
  public readonly crowdstrikeMajorVersion: string|undefined=undefined
  public readonly crowdstrikeMinorVersion: string|undefined=undefined
  public readonly crowdstrikeOSBuild: string|undefined=undefined
  public readonly crowdstrikeOSVersion: string|undefined=undefined
  public readonly crowdstrikePlatformName: string|undefined=undefined
  public readonly crowdstrikeReducedFunctionalityMode: string|undefined=undefined
  public readonly crowdstrikeProductTypeDesc: string|undefined=undefined
  public readonly crowdstrikeProvisionStatus: string|undefined=undefined
  public readonly crowdstrikeSerialNumber: string|undefined=undefined
  public readonly crowdstrikeServicePackMajor: string|undefined=undefined
  public readonly crowdstrikeServicePackMinor: string|undefined=undefined
  public readonly crowdstrikeStatus: string|undefined=undefined
  public readonly crowdstrikeSystemManufacturer: string|undefined=undefined
  public readonly crowdstrikeSystemProductName: string|undefined=undefined
  public readonly crowdstrikeKernelVersion: string|undefined=undefined
  // dates
  public readonly crowdstrikeFirstSeenDateTime: Date|undefined=undefined
  public readonly crowdstrikeLastSeenDateTime: Date|undefined=undefined
  public readonly crowdstrikeModifiedDateTime: Date|undefined=undefined
}