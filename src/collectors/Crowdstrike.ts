// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from 'axios'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

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
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;


      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found ${foundDevices.length} devices; fetching details ..`)

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
          this.CrowdstrikeObjects.push(o)

          if(i>0 && i%logUpdateInterval===0) {
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, Utilities.getProgressMessage('', 'retrieved', i, foundDevices.length, startDate, new Date()))
          }

        } catch (err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }
  
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})
  }


  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      
      for(let i=0; i<this.CrowdstrikeObjects.length; i++) {

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuCrowdstrike:TableUpdate = new TableUpdate('DeviceCrowdstrike', 'DeviceCrowdstrikeID')
        
        const DeviceID:number = await this._db.getID("Device", [new ColumnValuePair("deviceName", this.CrowdstrikeObjects[i].deviceName)], true)
        const DeviceCrowdstrikeID:number = await this._db.getID("DeviceCrowdstrike", [new ColumnValuePair('CrowdstrikeDeviceID', this.CrowdstrikeObjects[i].crowdstrikeDeviceId)], true)

        // update the device table to add the corresponding DeviceCrowdstrikeID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.CrowdstrikeObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceCrowdstrikeID", mssql.Int, DeviceCrowdstrikeID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceCrowdstrike table values ..
        let ruCrowdstrike = new RowUpdate(DeviceCrowdstrikeID)
        ruCrowdstrike.updateName=this.CrowdstrikeObjects[i].deviceName
        // strings
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeCID", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeCID))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeAgentVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeAgentVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeBIOSManufacturer", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeBIOSManufacturer))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeBIOSVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeBIOSVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeExternalIP", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeExternalIP))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeMACAddress", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMACAddress))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeLocalIP", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeLocalIP))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeMachineDomain", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMachineDomain))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeMajorVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMajorVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeMinorVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeMinorVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeOSBuild", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeOSBuild))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeOSVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeOSVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikePlatformName", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikePlatformName))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeReducedFunctionalityMode", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeReducedFunctionalityMode))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeProductTypeDesc", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeProductTypeDesc))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeProvisionStatus", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeProvisionStatus))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeSerialNumber", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSerialNumber))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeServicePackMajor", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeServicePackMajor))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeServicePackMinor", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeServicePackMinor))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeStatus", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeStatus))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeSystemManufacturer", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSystemManufacturer))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeSystemProductName", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeSystemProductName))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeKernelVersion", mssql.VarChar(255), this.CrowdstrikeObjects[i].crowdstrikeKernelVersion))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeFirstSeenDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeFirstSeenDateTime))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeLastSeenDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeLastSeenDateTime))
        ruCrowdstrike.ColumnUpdates.push(new ColumnUpdate("crowdstrikeModifiedDateTime", mssql.DateTime2, this.CrowdstrikeObjects[i].crowdstrikeModifiedDateTime))
        
        tuCrowdstrike.RowUpdates.push(ruCrowdstrike)

        await this._db.updateTable(tuDevice, true)
        await this._db.updateTable(tuCrowdstrike, true)

      }
  
    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')
      this._le.logStack.pop()
    }

  }

}