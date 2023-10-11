// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

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
            connectwiseDeviceType: Utilities.CleanedString(computers[i].Type),
            connectwiseLocation: Utilities.CleanedString(computers[i].Location.Name),
            connectwiseClient: Utilities.CleanedString(computers[i].Client.Name),
            connectwiseOperatingSystem: Utilities.CleanedString(computers[i].OperatingSystemName),
            connectwiseOperatingSystemVersion: Utilities.CleanedString(computers[i].OperatingSystemVersion),
            connectwiseDomainName: Utilities.CleanedString(computers[i].DomainName),
            connectwiseAgentVersion: Utilities.CleanedString(computers[i].RemoteAgentVersion),
            connectwiseComment: Utilities.CleanedString(computers[i].Comment),
            connectwiseIpAddress: Utilities.CleanedString(computers[i].LocalIPAddress),
            connectwiseMacAddress: Utilities.CleanedString(computers[i].MACAddress),
            connectwiseLastUserName: Utilities.CleanedString(computers[i].LastUserName),
            connectwiseStatus: Utilities.CleanedString(computers[i].Status),
            connectwiseSerialNumber: Utilities.CleanedString(computers[i].SerialNumber),
            connectwiseManufacturer: Utilities.CleanedString(computers[i].BiosManufacturer),
            connectwiseModel: Utilities.CleanedString(computers[i].Model),
            connectwiseDescription: Utilities.CleanedString(computers[i].Description),
            // bigint
            connectwiseTotalMemory: computers[i].TotalMemory,
            connectwiseFreeMemory: computers[i].FreeMemory,
            // datetimes
            connectwiseLastObserved: Utilities.CleanedDate(computers[i].RemoteAgentLastContact),
            connectwiseWindowsUpdateDate: Utilities.CleanedDate(computers[i].WindowsUpdateDate),
            connectwiseAntivirusDefinitionDate: Utilities.CleanedDate(computers[i].AntivirusDefinitionDate),
            connectwiseFirstSeen: Utilities.CleanedDate(computers[i].DateAdded),
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
              connectwiseLocation: networkDevices[i].Location ? Utilities.CleanedString(networkDevices[i].Location.Name) : undefined,
              connectwiseIpAddress:Utilities.CleanedString(networkDevices[i].LocalIPAddress),
              connectwiseDeviceType:networkDevices[i].DeviceType ? Utilities.CleanedString(networkDevices[i].DeviceType.Name) : undefined,
              connectwiseMacAddress:Utilities.CleanedString(networkDevices[i].MACAddress),
              connectwiseStatus:Utilities.CleanedString(networkDevices[i].Status),
              connectwiseComment:Utilities.CleanedString(networkDevices[i].AlertMessage),
              connectwiseManufacturer:Utilities.CleanedString(networkDevices[i].ManufacturerName),
              connectwiseModel:Utilities.CleanedString(networkDevices[i].ModelName),
              connectwiseDescription:Utilities.CleanedString(networkDevices[i].Description),
              connectwiseClient:networkDevices[i].Client ? Utilities.CleanedString(networkDevices[i].Client.Name) : undefined,
              // dates
              connectwiseFirstSeen:Utilities.CleanedDate(networkDevices[i].DateAdded),
              connectwiseAssetDate:Utilities.CleanedDate(networkDevices[i].AssetDate),
              connectwiseLastObserved:Utilities.CleanedDate(networkDevices[i].LastContact)
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
        let tuConnectwise:TableUpdate = new TableUpdate('DeviceConnectwise', 'DeviceConnectwiseID')
        
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.ConnectwiseObjects[i].deviceName, mssql.VarChar(255))], true)
        const DeviceConnectwiseID:number = await this.db.getID("DeviceConnectwise", [new ColumnValuePair('ConnectwiseID', this.ConnectwiseObjects[i].connectwiseID, mssql.VarChar(255))], true)

        // update the device table to add the corresponding DeviceConnectwiseID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.ConnectwiseObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseID", mssql.Int, DeviceConnectwiseID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceConnectwise table values ..
        let ruConnectwise = new RowUpdate(DeviceConnectwiseID)
        ruConnectwise.updateName=this.ConnectwiseObjects[i].deviceName
        // strings
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseDeviceType", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDeviceType))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseLocation", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLocation))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseClient", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseClient))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseOperatingSystem", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystem))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseOperatingSystemVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystemVersion))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseDomainName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDomainName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseAgentVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseAgentVersion))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseComment", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseComment))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseIpAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseIpAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseMacAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseMacAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseLastUserName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLastUserName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseStatus", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseStatus))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseSerialNumber", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseSerialNumber))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseManufacturer", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseManufacturer))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseModel", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseModel))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseDescription", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDescription))
        // bigint
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseTotalMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseTotalMemory))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseFreeMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseFreeMemory))
        // dates
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseLastObserved", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseLastObserved))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseWindowsUpdateDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseWindowsUpdateDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseAntivirusDefinitionDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseAntivirusDefinitionDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseFirstSeen", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseFirstSeen))

        // operating system
        const ose = new OperatingSystemEngine(this.le, this.db)
        const os = ose.parse(this.ConnectwiseObjects[i].connectwiseOperatingSystem, this.ConnectwiseObjects[i].connectwiseOperatingSystemVersion)
        const operatingSystemXRefId:number = await ose.getId(os)
        
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("connectwiseOperatingSystemXRefId", mssql.VarChar(255), operatingSystemXRefId))
        
        tuConnectwise.RowUpdates.push(ruConnectwise)

        await this.db.updateTable(tuDevice, true)
        await this.db.updateTable(tuConnectwise, true)

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