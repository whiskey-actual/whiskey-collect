// imports
import le from './config/le';
import { LogEntryType } from 'whiskey-log';
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
  private baseUrl:string=""
  private clientId:string=""
  private clientSecret:string=""

  private async getAccessToken(axiosInstance:AxiosInstance):Promise<string> {
    le.logStack.push("getAccessToken")
    let output:string

    try {
        le.AddLogEntry(LogEntryType.Info, 'getting access token ..')
        const response = await axiosInstance.post(`/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
        output = response.data.access_token;
        le.AddLogEntry(LogEntryType.Success, `.. accessToken received.`)
    } catch (ex) {
        le.AddLogEntry(LogEntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.logStack.pop()
    }

    return new Promise<string>((resolve) => {resolve(output)})

}
  
  private async fetchDevice(axiosInstance:AxiosInstance, deviceId:string, showDebugOutput:boolean):Promise<CrowdstrikeDevice> {
    le.logStack.push('fetchDevice')

    let output:CrowdstrikeDevice

    try {

          const response = await axiosInstance.get(`/devices/entities/devices/v1?ids=${deviceId}`)
          const deviceDetails = response.data.resources[0];

          if(showDebugOutput) { console.debug(deviceDetails) }
          
          output = {
            // mandatory
            ObservedByCrowdstrike: true,
            DeviceName: deviceDetails.hostname.toString().trim(),
            CrowdstrikeDeviceId: deviceDetails.device_id.toString().trim(),
            // strings
            CrowdstrikeCID: CleanedString(deviceDetails.cid),
            CrowdstrikeAgentVersion: CleanedString(deviceDetails.agent_version),
            CrowdstrikeBIOSManufacturer: CleanedString(deviceDetails.bios_manufacturer),
            CrowdstrikeBIOSVersion: CleanedString(deviceDetails.bios_version),
            CrowdstrikeExternalIP: CleanedString(deviceDetails.external_ip),
            CrowdstrikeMACAddress: CleanedString(deviceDetails.mac_address),
            CrowdstrikeLocalIP: CleanedString(deviceDetails.local_ip),
            CrowdstrikeMachineDomain: CleanedString(deviceDetails.machine_domain),
            CrowdstrikeMajorVersion: CleanedString(deviceDetails.major_version),
            CrowdstrikeMinorVersion: CleanedString(deviceDetails.minor_version),
            CrowdstrikeOSBuild: CleanedString(deviceDetails.os_build),
            CrowdstrikeOSVersion: CleanedString(deviceDetails.os_version),
            CrowdstrikePlatformName: CleanedString(deviceDetails.platform_name),
            CrowdstrikeReducedFunctionalityMode: CleanedString(deviceDetails.reduced_functionality_mode),
            CrowdstrikeProductTypeDesc: CleanedString(deviceDetails.product_type_desc),
            CrowdstrikeProvisionStatus: CleanedString(deviceDetails.provision_status),
            CrowdstrikeSerialNumber: CleanedString(deviceDetails.serial_number),
            CrowdstrikeServicePackMajor: CleanedString(deviceDetails.service_pack_major),
            CrowdstrikeServicePackMinor: CleanedString(deviceDetails.service_pack_minor),
            CrowdstrikeStatus: CleanedString(deviceDetails.status),
            CrowdstrikeSystemManufacturer: CleanedString(deviceDetails.system_manufacturer),
            CrowdstrikeSystemProductName: CleanedString(deviceDetails.system_product_name),
            CrowdstrikeKernelVersion: CleanedString(deviceDetails.kernel_version),
            // datetimes
            CrowdstrikeFirstSeenDateTime: CleanedDate(deviceDetails.first_seen),
            CrowdstrikeLastSeenDateTime: CleanedDate(deviceDetails.last_seen),
            CrowdstrikeModifiedDateTime: CleanedDate(deviceDetails.modified_timestamp)
          }

    } catch(err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice>((resolve) => {resolve(output)})
  }
  
  public async getDevices(showDebugOutput:boolean=false):Promise<CrowdstrikeDevice[]> {
    le.logStack.push('fetchDevices')

    let output:CrowdstrikeDevice[] = []

    try {

      let axiosInstance = axios.create({baseURL: this.baseUrl});
      const accessToken = await this.getAccessToken(axiosInstance)
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`   


      const foundDevices = (await axiosInstance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

      le.AddLogEntry(LogEntryType.Info, `.. found ${foundDevices.length} devices; fetching details ..`)

      const startDate = new Date()
      const logUpdateInterval:number=250

      for(let i=0; i<foundDevices.length; i++) {

        if(showDebugOutput) { console.debug(foundDevices[i]) }

        try {
            const deviceObject = await this.fetchDevice(axiosInstance, foundDevices[i], showDebugOutput)
            output.push(deviceObject)

            if(i>0 && i%logUpdateInterval===0) {
                le.AddLogEntry(LogEntryType.Info, getProgressMessage('', 'retrieved', i, foundDevices.length, startDate, new Date()))
            }

        } catch (err) {
          le.AddLogEntry(LogEntryType.Error, `${err}`)
          throw(err)
        }
      }

      le.AddLogEntry(LogEntryType.Info, '.. objects created.')

    } catch(err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
  }

}

export class CrowdstrikeDevice {
  // mandatory
  public readonly ObservedByCrowdstrike:boolean = true
  public readonly DeviceName: string=''
  public readonly CrowdstrikeDeviceId:string=''
  // strings
  public readonly CrowdstrikeCID: string|undefined=undefined
  public readonly CrowdstrikeAgentVersion: string|undefined=undefined
  public readonly CrowdstrikeBIOSManufacturer: string|undefined=undefined
  public readonly CrowdstrikeBIOSVersion: string|undefined=undefined
  public readonly CrowdstrikeExternalIP: string|undefined=undefined
  public readonly CrowdstrikeMACAddress: string|undefined=undefined
  public readonly CrowdstrikeLocalIP: string|undefined=undefined
  public readonly CrowdstrikeMachineDomain: string|undefined=undefined
  public readonly CrowdstrikeMajorVersion: string|undefined=undefined
  public readonly CrowdstrikeMinorVersion: string|undefined=undefined
  public readonly CrowdstrikeOSBuild: string|undefined=undefined
  public readonly CrowdstrikeOSVersion: string|undefined=undefined
  public readonly CrowdstrikePlatformName: string|undefined=undefined
  public readonly CrowdstrikeReducedFunctionalityMode: string|undefined=undefined
  public readonly CrowdstrikeProductTypeDesc: string|undefined=undefined
  public readonly CrowdstrikeProvisionStatus: string|undefined=undefined
  public readonly CrowdstrikeSerialNumber: string|undefined=undefined
  public readonly CrowdstrikeServicePackMajor: string|undefined=undefined
  public readonly CrowdstrikeServicePackMinor: string|undefined=undefined
  public readonly CrowdstrikeStatus: string|undefined=undefined
  public readonly CrowdstrikeSystemManufacturer: string|undefined=undefined
  public readonly CrowdstrikeSystemProductName: string|undefined=undefined
  public readonly CrowdstrikeKernelVersion: string|undefined=undefined
  // dates
  public readonly CrowdstrikeFirstSeenDateTime: Date|undefined=undefined
  public readonly CrowdstrikeLastSeenDateTime: Date|undefined=undefined
  public readonly CrowdstrikeModifiedDateTime: Date|undefined=undefined
}