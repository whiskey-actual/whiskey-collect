// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import mssql from 'mssql'
import { DBEngine, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class ConnectwiseNetworkObject {
  // mandatory
  public readonly observedByConnectwise:boolean=true
  public readonly deviceName:string=''
  public readonly connectwiseID:string=''
  // strings
  public readonly connectwiseLocation:string|undefined=undefined
  public readonly connectwiseLocalIpAddress:string|undefined=undefined
  public readonly connectwiseDeviceType:string|undefined=undefined
  public readonly connectwiseMacAddress:string|undefined=undefined
  public readonly connectwiseStatus:string|undefined=undefined
  public readonly connectwiseAlertMessage:string|undefined=undefined
  public readonly connectwiseManufacturerName:string|undefined=undefined
  public readonly connectwiseModelName:string|undefined=undefined
  public readonly connectwiseDescription:string|undefined=undefined
  public readonly connectwiseClient:string|undefined=undefined
  // dates
  public readonly connectwiseLastUpdated:Date|undefined=undefined
  public readonly connectwiseDateAdded:Date|undefined=undefined
  public readonly connectwiseAssetDate:Date|undefined=undefined
  public readonly connectwiseLastContact:Date|undefined=undefined

}

export class ConnectwiseNetwork
{

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly ConnectwiseNetworkObjects:ConnectwiseNetworkObject[]=[]

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
    this._le.logStack.push('fetch')

    try {

      // get the access token ..
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received accessToken ..`)

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<networkDevices.length; i++) {
          try {
            const o:ConnectwiseNetworkObject = {
              // mandatory
              observedByConnectwise: true,
              deviceName: networkDevices[i].Name.toString().trim(),
              connectwiseID: networkDevices[i].Id.toString().trim(),
              // strings
              connectwiseLocation: networkDevices[i].Location ? Utilities.CleanedString(networkDevices[i].Location.Name) : undefined,
              connectwiseLocalIpAddress:Utilities.CleanedString(networkDevices[i].LocalIPAddress),
              connectwiseDeviceType:networkDevices[i].DeviceType ? Utilities.CleanedString(networkDevices[i].DeviceType.Name) : undefined,
              connectwiseMacAddress:Utilities.CleanedString(networkDevices[i].MACAddress),
              connectwiseStatus:Utilities.CleanedString(networkDevices[i].Status),
              connectwiseAlertMessage:Utilities.CleanedString(networkDevices[i].AlertMessage),
              connectwiseManufacturerName:Utilities.CleanedString(networkDevices[i].ManufacturerName),
              connectwiseModelName:Utilities.CleanedString(networkDevices[i].ModelName),
              connectwiseDescription:Utilities.CleanedString(networkDevices[i].Description),
              connectwiseClient:networkDevices[i].Client ? Utilities.CleanedString(networkDevices[i].Client.Name) : undefined,
              // dates
              connectwiseLastUpdated:Utilities.CleanedDate(networkDevices[i].LastUpdated),
              connectwiseDateAdded:Utilities.CleanedDate(networkDevices[i].DateAdded),
              connectwiseAssetDate:Utilities.CleanedDate(networkDevices[i].AssetDate),
              connectwiseLastContact:Utilities.CleanedDate(networkDevices[i].LastContact)
            }
            this.ConnectwiseNetworkObjects.push(o)

          }  catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `error: ${err}`)
            console.debug(networkDevices[i])
            throw(err)
          }
          
      }
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. network objects created.`)

    } catch (ex) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${ex}`)
      throw ex;
    } finally {
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'done.')
      this._le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      
      let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
      let tuConnectwiseNetwork:TableUpdate = new TableUpdate('DeviceConnectwiseNetwork', 'DeviceConnectwiseNetworkID')
      
      for(let i=0; i<this.ConnectwiseNetworkObjects.length; i++) {
        
        const DeviceID:number = await this._db.getID("Device", this.ConnectwiseNetworkObjects[i].deviceName, "deviceName")
        const DeviceConnectwiseNetworkID:number = await this._db.getID("DeviceConnectwiseNetwork", this.ConnectwiseNetworkObjects[i].connectwiseID, 'ConnectwiseID')

        // update the device table to add the corresponding DeviceConnectwiseID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.ConnectwiseNetworkObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseNetworkID", mssql.Int, DeviceConnectwiseNetworkID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceConnectwise table values ..
        let ruConnectwiseNetwork = new RowUpdate(DeviceConnectwiseNetworkID)
        ruConnectwiseNetwork.updateName=this.ConnectwiseNetworkObjects[i].deviceName
        // strings
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseLocation", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseLocation))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseLocalIpAddress", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseLocalIpAddress))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseDeviceType", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseDeviceType))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseMacAddress", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseMacAddress))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseStatus", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseStatus))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseAlertMessage", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseAlertMessage))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseManufacturerName", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseManufacturerName))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseModelName", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseModelName))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseDescription", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseDescription))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseClient", mssql.VarChar(255), this.ConnectwiseNetworkObjects[i].connectwiseClient))
        // datetime
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseLastUpdated", mssql.DateTime2, this.ConnectwiseNetworkObjects[i].connectwiseLastUpdated))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseDateAdded", mssql.DateTime2, this.ConnectwiseNetworkObjects[i].connectwiseDateAdded))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseAssetDate", mssql.DateTime2, this.ConnectwiseNetworkObjects[i].connectwiseAssetDate))
        ruConnectwiseNetwork.ColumnUpdates.push(new ColumnUpdate("connectwiseLastContact", mssql.DateTime2, this.ConnectwiseNetworkObjects[i].connectwiseLastContact))
        tuConnectwiseNetwork.RowUpdates.push(ruConnectwiseNetwork)
      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'executing ..')
      await this._db.updateTable(tuDevice, true)
      await this._db.updateTable(tuConnectwiseNetwork, true)
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.logStack.pop()
    }

  }

}