// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString, getProgressMessage } from 'whiskey-util'

import axios from 'axios'
import mssql from 'mssql'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"

export class CrowdstrikeObject {
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


export class Crowdstrike
{

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly CrowdstrikeObjects:CrowdstrikeObject[]=[]

  
  public async fetch(baseURL:string, clientId:string, clientSecret:string):Promise<void> {
    this._le.logStack.push('fetch')

    try {

      // get access token
      this._le.AddLogEntry(LogEngine.EntryType.Info, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      this._le.AddLogEntry(LogEngine.EntryType.Info, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;


      this._le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${foundDevices.length} devices; fetching details ..`)

      const startDate = new Date()
      const logUpdateInterval:number=250

      for(let i=0; i<foundDevices.length; i++) {

        try {

          const response = await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`)
          const deviceDetails = response.data.resources[0];
          
          const o:CrowdstrikeObject = {
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
          this.CrowdstrikeObjects.push(o)

          if(i>0 && i%logUpdateInterval===0) {
            this._le.AddLogEntry(LogEngine.EntryType.Info, getProgressMessage('', 'retrieved', i, foundDevices.length, startDate, new Date()))
          }

        } catch (err) {
          this._le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          throw(err)
        }
      }
  
      this._le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})
  }


  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.EntryType.Info, 'building requests ..')

    try {
      
      for(let i=0; i<this.CrowdstrikeObjects.length; i++) {

        const DeviceID:number = await this._db.getID("Device", [new ColumnValuePair("deviceName", this.CrowdstrikeObjects[i].deviceName, mssql.VarChar(255))], true)
        
        // update the DeviceCrowdstrike table values ..
        let ruCrowdstrike = new RowUpdate(DeviceID)
        ruCrowdstrike.updateName=this.CrowdstrikeObjects[i].deviceName
        // strings
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeCID", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeCID))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeAgentVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeAgentVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeBIOSManufacturer", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeBIOSManufacturer))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeBIOSVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeBIOSVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeExternalIP", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeExternalIP))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeMACAddress", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMACAddress))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeLocalIP", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeLocalIP))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeMachineDomain", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMachineDomain))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeMajorVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMajorVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeMinorVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMinorVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeOSBuild", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeOSBuild))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeOSVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeOSVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikePlatformName", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikePlatformName))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeReducedFunctionalityMode", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeReducedFunctionalityMode))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeProductTypeDesc", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeProductTypeDesc))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeProvisionStatus", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeProvisionStatus))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeSerialNumber", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSerialNumber))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeServicePackMajor", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeServicePackMajor))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeServicePackMinor", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeServicePackMinor))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeStatus", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeStatus))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeSystemManufacturer", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSystemManufacturer))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeSystemProductName", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSystemProductName))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeKernelVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeKernelVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeFirstSeenDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeFirstSeenDateTime))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeLastSeenDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeLastSeenDateTime))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("CrowdstrikeModifiedDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeModifiedDateTime))

        await this._db.updateTable('Device', 'DeviceID', [ruCrowdstrike])

      }
  
    } catch(err) {
      this._le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this._le.AddLogEntry(LogEngine.EntryType.Info, '.. done')
      this._le.logStack.pop()
    }

  }

}