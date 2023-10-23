// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from 'whiskey-sql';

import { OperatingSystemEngine } from '../components/OperatingSystemEngine';

export class ConnectwiseObject {
  // mandatory
  public readonly observedByConnectwise:boolean=true
  public readonly deviceName:string=''
  public readonly connectwiseID:string=''
  
  public readonly connectwiseDeviceType:string|undefined=undefined
  public readonly connectwiseLocation:string|undefined=undefined
  public readonly connectwiseClient:string|undefined=undefined
  public readonly connectwiseOperatingSystem:string|undefined=undefined
  public readonly connectwiseOperatingSystemVersion:string|undefined=undefined
  public readonly connectwiseDomainName:string|undefined=undefined
  public readonly connectwiseAgentVersion:string|undefined=undefined
  public readonly connectwiseComment:string|undefined=undefined
  public readonly connectwiseIpAddress:string|undefined=undefined
  public readonly connectwiseMacAddress:string|undefined=undefined
  public readonly connectwiseLastUserName:string|undefined=undefined
  public readonly connectwiseStatus:string|undefined=undefined
  public readonly connectwiseSerialNumber:string|undefined=undefined
  public readonly connectwiseManufacturer:string|undefined=undefined
  public readonly connectwiseModel:string|undefined=undefined
  public readonly connectwiseDescription:string|undefined=undefined
  // bitint
  public readonly connectwiseTotalMemory:number|undefined=undefined
  public readonly connectwiseFreeMemory:number|undefined=undefined
  // dates
  public readonly connectwiseFirstSeen:Date|undefined=undefined
  public readonly connectwiseLastObserved:Date|undefined=undefined
  public readonly connectwiseWindowsUpdateDate:Date|undefined=undefined
  public readonly connectwiseAntivirusDefinitionDate:Date|undefined=undefined
  public readonly connectwiseAssetDate:Date|undefined=undefined
}

export class Connectwise
{

  constructor(le:LogEngine, db:DBEngine) {
    this.le=le
    this.db=db
  }
  private le:LogEngine
  private db:DBEngine
  public readonly ConnectwiseObjects:ConnectwiseObject[]=[]

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
    this.le.logStack.push("fetch")

    try {

      // get the access token ..
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received accessToken ..`)

      // get computers ..
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {

          const o:ConnectwiseObject = {
            // mandatory
            observedByConnectwise: true,
            deviceName: computers[i].ComputerName.toString().trim(),
            connectwiseID: computers[i].Id.toString().trim(),
            // strings
            connectwiseDeviceType: CleanedString(computers[i].Type),
            connectwiseLocation: CleanedString(computers[i].Location.Name),
            connectwiseClient: CleanedString(computers[i].Client.Name),
            connectwiseOperatingSystem: CleanedString(computers[i].OperatingSystemName),
            connectwiseOperatingSystemVersion: CleanedString(computers[i].OperatingSystemVersion),
            connectwiseDomainName: CleanedString(computers[i].DomainName),
            connectwiseAgentVersion: CleanedString(computers[i].RemoteAgentVersion),
            connectwiseComment: CleanedString(computers[i].Comment),
            connectwiseIpAddress: CleanedString(computers[i].LocalIPAddress),
            connectwiseMacAddress: CleanedString(computers[i].MACAddress),
            connectwiseLastUserName: CleanedString(computers[i].LastUserName),
            connectwiseStatus: CleanedString(computers[i].Status),
            connectwiseSerialNumber: CleanedString(computers[i].SerialNumber),
            connectwiseManufacturer: CleanedString(computers[i].BiosManufacturer),
            connectwiseModel: CleanedString(computers[i].Model),
            connectwiseDescription: CleanedString(computers[i].Description),
            // bigint
            connectwiseTotalMemory: computers[i].TotalMemory,
            connectwiseFreeMemory: computers[i].FreeMemory,
            // datetimes
            connectwiseLastObserved: CleanedDate(computers[i].RemoteAgentLastContact),
            connectwiseWindowsUpdateDate: CleanedDate(computers[i].WindowsUpdateDate),
            connectwiseAntivirusDefinitionDate: CleanedDate(computers[i].AntivirusDefinitionDate),
            connectwiseFirstSeen: CleanedDate(computers[i].DateAdded),
            connectwiseAssetDate: undefined
          }
          this.ConnectwiseObjects.push(o)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(computers[i])
          throw(err)
        } 
      }
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. computer objects created.`)

      // get network devices
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<networkDevices.length; i++) {
          try {
            const o:ConnectwiseObject = {
              // mandatory
              observedByConnectwise: true,
              deviceName: networkDevices[i].Name.toString().trim(),
              connectwiseID: networkDevices[i].Id.toString().trim(),
              // strings
              connectwiseOperatingSystem: undefined,
              connectwiseOperatingSystemVersion: undefined,
              connectwiseAgentVersion: undefined,
              connectwiseAntivirusDefinitionDate: undefined,
              connectwiseDomainName: undefined,
              connectwiseFreeMemory: undefined,
              connectwiseLastUserName: undefined,
              connectwiseSerialNumber: undefined,
              connectwiseTotalMemory:undefined,
              connectwiseWindowsUpdateDate: undefined,
              connectwiseLocation: networkDevices[i].Location ? CleanedString(networkDevices[i].Location.Name) : undefined,
              connectwiseIpAddress:CleanedString(networkDevices[i].LocalIPAddress),
              connectwiseDeviceType:networkDevices[i].DeviceType ? CleanedString(networkDevices[i].DeviceType.Name) : undefined,
              connectwiseMacAddress:CleanedString(networkDevices[i].MACAddress),
              connectwiseStatus:CleanedString(networkDevices[i].Status),
              connectwiseComment:CleanedString(networkDevices[i].AlertMessage),
              connectwiseManufacturer:CleanedString(networkDevices[i].ManufacturerName),
              connectwiseModel:CleanedString(networkDevices[i].ModelName),
              connectwiseDescription:CleanedString(networkDevices[i].Description),
              connectwiseClient:networkDevices[i].Client ? CleanedString(networkDevices[i].Client.Name) : undefined,
              // dates
              connectwiseFirstSeen:CleanedDate(networkDevices[i].DateAdded),
              connectwiseAssetDate:CleanedDate(networkDevices[i].AssetDate),
              connectwiseLastObserved:CleanedDate(networkDevices[i].LastContact)
            }
            this.ConnectwiseObjects.push(o)

          }  catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `error: ${err}`)
            console.debug(networkDevices[i])
            throw(err)
          }
          
      }
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. network objects created.`)


    } catch (ex) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${ex}`)
      throw ex;
    } finally {
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {

    this.le.logStack.push('persist')
    this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      
      for(let i=0; i<this.ConnectwiseObjects.length; i++) {

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.ConnectwiseObjects[i].deviceName, mssql.VarChar(255))], true)

        // update the DeviceConnectwise table values ..
        let ruConnectwise = new RowUpdate(DeviceID)
        ruConnectwise.updateName=this.ConnectwiseObjects[i].deviceName
        // strings
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_DeviceType", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDeviceType))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Location", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLocation))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Client", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseClient))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_DomainName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDomainName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_AgentVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseAgentVersion))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Comment", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseComment))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_IpAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseIpAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_MacAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseMacAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_LastUserName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLastUserName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Status", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseStatus))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_SerialNumber", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseSerialNumber))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Manufacturer", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseManufacturer))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Model", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseModel))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_Description", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDescription))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_OperatingSystem", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystem))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_OperatingSystemVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystemVersion))
        // bigint
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_TotalMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseTotalMemory))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_FreeMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseFreeMemory))
        // dates
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_LastObserved", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseLastObserved))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_WindowsUpdateDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseWindowsUpdateDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_AntivirusDefinitionDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseAntivirusDefinitionDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("cw_FirstSeen", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseFirstSeen))
             
        tuDevice.RowUpdates.push(ruConnectwise)

        await this.db.updateTable(tuDevice, true)

      }

    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')
      this.le.logStack.pop()
    }

  }

}