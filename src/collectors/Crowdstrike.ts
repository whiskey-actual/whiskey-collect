// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from 'axios'
import { CrowdstrikeDevice } from '../models/Device';


export class Crowdstrike
{

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])
  
  public async fetch(baseURL:string, clientId:string, clientSecret:string):Promise<CrowdstrikeDevice[]> {
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'initializing ..')
    let output:CrowdstrikeDevice[]=[]

    try {

      // get access token
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${foundDevices.length} devices; fetching details ..`)

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      try {

        await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {
          const deviceDetails = response.data.resources[0];
          // let q = new sql.Request()
          // .input('deviceName: Utilities.CleanedString(deviceDetails.hostname))
          // .input('crowdstrikeDeviceId: Utilities.CleanedString(deviceDetails.device_id))
          // .input('crowdstrikeCID: Utilities.CleanedString(deviceDetails.cid))
          // .input('crowdstrikeAgentVersion: Utilities.CleanedString(deviceDetails.agent_version))
          // .input('crowdstrikeBIOSManufacturer: Utilities.CleanedString(deviceDetails.bios_manufacturer))
          // .input('crowdstrikeBIOSVersion: Utilities.CleanedString(deviceDetails.bios_version))
          // .input('crowdstrikeExternalIP: Utilities.CleanedString(deviceDetails.external_ip))
          // .input('crowdstrikeMACAddress: Utilities.CleanedString(deviceDetails.mac_address))
          // .input('crowdstrikeLocalIP: Utilities.CleanedString(deviceDetails.local_ip))
          // .input('crowdstrikeMachineDomain: Utilities.CleanedString(deviceDetails.machine_domain))
          // .input('crowdstrikeMajorVersion: Utilities.CleanedString(deviceDetails.major_version))
          // .input('crowdstrikeMinorVersion: Utilities.CleanedString(deviceDetails.minor_version))
          // .input('crowdstrikeOSBuild: Utilities.CleanedString(deviceDetails.os_build))
          // .input('crowdstrikeOSVersion: Utilities.CleanedString(deviceDetails.os_version))
          // .input('crowdstrikePlatformName: Utilities.CleanedString(deviceDetails.platform_name))
          // .input('crowdstrikeReducedFunctionalityMode: Utilities.CleanedString(deviceDetails.reduced_functionality_mode))
          // .input('crowdstrikeProductTypeDesc: Utilities.CleanedString(deviceDetails.product_type_desc))
          // .input('crowdstrikeProvisionStatus: Utilities.CleanedString(deviceDetails.provision_status))
          // .input('crowdstrikeSerialNumber: Utilities.CleanedString(deviceDetails.serial_number))
          // .input('crowdstrikeServicePackMajor: Utilities.CleanedString(deviceDetails.service_pack_major))
          // .input('crowdstrikeServicePackMinor: Utilities.CleanedString(deviceDetails.service_pack_minor))
          // .input('crowdstrikeStatus: Utilities.CleanedString(deviceDetails.status))
          // .input('crowdstrikeSystemManufacturer: Utilities.CleanedString(deviceDetails.system_manufacturer))
          // .input('crowdstrikeSystemProductName: Utilities.CleanedString(deviceDetails.system_product_name))
          // .input('crowdstrikeKernelVersion: Utilities.CleanedString(deviceDetails.kernel_version))
          // // datetimes
          // .input('crowdstrikeFirstSeenDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.first_seen))
          // .input('crowdstrikeLastSeenDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.last_seen))
          // .input('crowdstrikeModifiedDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.modified_timestamp))
          // output.sqlRequests.push(q)

          const d:CrowdstrikeDevice = {
            // mandatory
            observedByCrowdstrike: true,
            deviceName: deviceDetails.hostname.toString().trim(),
            crowdstrikeDeviceId: deviceDetails.device_id.toString().trim(),
            // strings
            crowdstrikeCID: Utilities.CleanedString(deviceDetails.cid),
            crowdstrikeAgentVersion: Utilities.CleanedString(deviceDetails.agent_version),
            crowdstrikeBIOSManufacturer: Utilities.CleanedString(deviceDetails.bios_manufacturer),
            crowdstrikeBIOSVersion: Utilities.CleanedString(deviceDetails.bios_version),
            crowdstrikeExternalIP: Utilities.CleanedString(deviceDetails.external_ip),
            crowdstrikeMACAddress: Utilities.CleanedString(deviceDetails.mac_address),
            crowdstrikeLocalIP: Utilities.CleanedString(deviceDetails.local_ip),
            crowdstrikeMachineDomain: Utilities.CleanedString(deviceDetails.machine_domain),
            crowdstrikeMajorVersion: Utilities.CleanedString(deviceDetails.major_version),
            crowdstrikeMinorVersion: Utilities.CleanedString(deviceDetails.minor_version),
            crowdstrikeOSBuild: Utilities.CleanedString(deviceDetails.os_build),
            crowdstrikeOSVersion: Utilities.CleanedString(deviceDetails.os_version),
            crowdstrikePlatformName: Utilities.CleanedString(deviceDetails.platform_name),
            crowdstrikeReducedFunctionalityMode: Utilities.CleanedString(deviceDetails.reduced_functionality_mode),
            crowdstrikeProductTypeDesc: Utilities.CleanedString(deviceDetails.product_type_desc),
            crowdstrikeProvisionStatus: Utilities.CleanedString(deviceDetails.provision_status),
            crowdstrikeSerialNumber: Utilities.CleanedString(deviceDetails.serial_number),
            crowdstrikeServicePackMajor: Utilities.CleanedString(deviceDetails.service_pack_major),
            crowdstrikeServicePackMinor: Utilities.CleanedString(deviceDetails.service_pack_minor),
            crowdstrikeStatus: Utilities.CleanedString(deviceDetails.status),
            crowdstrikeSystemManufacturer: Utilities.CleanedString(deviceDetails.system_manufacturer),
            crowdstrikeSystemProductName: Utilities.CleanedString(deviceDetails.system_product_name),
            crowdstrikeKernelVersion: Utilities.CleanedString(deviceDetails.kernel_version),
            // datetimes
            crowdstrikeFirstSeenDateTime: Utilities.CleanedDate(deviceDetails.first_seen),
            crowdstrikeLastSeenDateTime: Utilities.CleanedDate(deviceDetails.last_seen),
            crowdstrikeModifiedDateTime: Utilities.CleanedDate(deviceDetails.modified_timestamp)
          }
          output.push(d)
        })
      } catch(err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `error: ${err}`)
      }

      if(i>0 && i%100==0) {
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, Utilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }
  
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. done.')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
     this._le.logStack.pop()
    }

    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
  }
}