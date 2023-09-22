// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios, { AxiosInstance } from 'axios'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'


export class Crowdstrike
{

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])
  
  public async fetch(baseURL:string, clientId:string, clientSecret:string):Promise<SqlRequestCollection> {
   this._le.logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Crowdstrike_device")
    this._le.AddLogEntry(LogEngine.Severity.Ok, 'initializing ..')

    try {

      // get access token
      this._le.AddLogEntry(LogEngine.Severity.Ok, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    this._le.AddLogEntry(LogEngine.Severity.Ok, `.. found ${foundDevices.length} devices; fetching details ..`)

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      try {

        await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {
          const deviceDetails = response.data.resources[0];
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), Utilities.CleanedString(deviceDetails.hostname))
          .input('crowdstrikeDeviceId', sql.VarChar(255), Utilities.CleanedString(deviceDetails.device_id))
          .input('crowdstrikeCID', sql.VarChar(255), Utilities.CleanedString(deviceDetails.cid))
          .input('crowdstrikeAgentVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.agent_version))
          .input('crowdstrikeBIOSManufacturer', sql.VarChar(255), Utilities.CleanedString(deviceDetails.bios_manufacturer))
          .input('crowdstrikeBIOSVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.bios_version))
          .input('crowdstrikeExternalIP', sql.VarChar(255), Utilities.CleanedString(deviceDetails.external_ip))
          .input('crowdstrikeMACAddress', sql.VarChar(255), Utilities.CleanedString(deviceDetails.mac_address))
          .input('crowdstrikeLocalIP', sql.VarChar(255), Utilities.CleanedString(deviceDetails.local_ip))
          .input('crowdstrikeMachineDomain', sql.VarChar(255), Utilities.CleanedString(deviceDetails.machine_domain))
          .input('crowdstrikeMajorVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.major_version))
          .input('crowdstrikeMinorVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.minor_version))
          .input('crowdstrikeOSBuild', sql.VarChar(255), Utilities.CleanedString(deviceDetails.os_build))
          .input('crowdstrikeOSVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.os_version))
          .input('crowdstrikePlatformName', sql.VarChar(255), Utilities.CleanedString(deviceDetails.platform_name))
          .input('crowdstrikeReducedFunctionalityMode', sql.VarChar(255), Utilities.CleanedString(deviceDetails.reduced_functionality_mode))
          .input('crowdstrikeProductTypeDesc', sql.VarChar(255), Utilities.CleanedString(deviceDetails.product_type_desc))
          .input('crowdstrikeProvisionStatus', sql.VarChar(255), Utilities.CleanedString(deviceDetails.provision_status))
          .input('crowdstrikeSerialNumber', sql.VarChar(255), Utilities.CleanedString(deviceDetails.serial_number))
          .input('crowdstrikeServicePackMajor', sql.VarChar(255), Utilities.CleanedString(deviceDetails.service_pack_major))
          .input('crowdstrikeServicePackMinor', sql.VarChar(255), Utilities.CleanedString(deviceDetails.service_pack_minor))
          .input('crowdstrikeStatus', sql.VarChar(255), Utilities.CleanedString(deviceDetails.status))
          .input('crowdstrikeSystemManufacturer', sql.VarChar(255), Utilities.CleanedString(deviceDetails.system_manufacturer))
          .input('crowdstrikeSystemProductName', sql.VarChar(255), Utilities.CleanedString(deviceDetails.system_product_name))
          .input('crowdstrikeKernelVersion', sql.VarChar(255), Utilities.CleanedString(deviceDetails.kernel_version))
          // datetimes
          .input('crowdstrikeFirstSeenDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.first_seen))
          .input('crowdstrikeLastSeenDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.last_seen))
          .input('crowdstrikeModifiedDateTime', sql.DateTime2, Utilities.CleanedDate(deviceDetails.modified_timestamp))
          output.sqlRequests.push(q)
        })
      } catch(err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
      }

      if(i>0 && i%100==0) {
        this._le.AddLogEntry(LogEngine.Severity.Ok, Utilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }
  
    this._le.AddLogEntry(LogEngine.Severity.Ok, '.. done.')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, `${err}`)
      throw(err)
    } finally {
     this._le.logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  }
}