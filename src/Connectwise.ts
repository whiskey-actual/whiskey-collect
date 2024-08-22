// imports
import le from './config/le';
import { LogEntryType } from 'whiskey-log';
import https from 'https'
import axios, { AxiosInstance } from 'axios'
import { CleanedDate, CleanedString } from 'whiskey-util'

export class ConnectwiseCollector
{

  constructor(baseUrl:string, clientId:string, username:string, password:string) {
    this.baseUrl=baseUrl
    this.clientId=clientId
    this.username=username
    this.password=password
  }
  private baseUrl:string
  private clientId:string
  private username:string
  private password:string

  public async fetchUserDevices(showDebugOutput:boolean=false):Promise<ConnectwiseDevice[]> {
      le.logStack.push("fetchUserDevices")

      let output:ConnectwiseDevice[] = []

      try {

          // get access token
          let axiosInstance = axios.create({baseURL:this.baseUrl, headers: {clientId:this.clientId}});
          const httpsAgent = new https.Agent({ rejectUnauthorized: false})
          axiosInstance.defaults.httpsAgent=httpsAgent;
          const accessToken = await this.getAccessToken(axiosInstance)
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`

          const computers = await this.callAPI(axiosInstance, '/Computers?pagesize=10000&orderby=ComputerName asc')
          le.AddLogEntry(LogEntryType.Info, `.. ${computers.length} devices received; processing ..`)
          for(let i=0; i<computers.length; i++) {

            if(showDebugOutput) { console.debug(computers[i]) }

              try {
                  const o:ConnectwiseDevice = {
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
                  output.push(o)
              } catch (err) {
                  le.AddLogEntry(LogEntryType.Error, `${err}`)
                  console.debug(computers[i])
                  throw(err)
              } 
          }
      
      } catch (ex) {
          le.AddLogEntry(LogEntryType.Error, `${ex}`)
          throw ex;
      } finally {
          le.AddLogEntry(LogEntryType.Info, 'done.')
          le.logStack.pop()
      }

  return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})

  }


  public async fetchNetworkDevices(showDebugOutput:boolean=false):Promise<ConnectwiseDevice[]> {
    le.logStack.push("fetchNetworkDevices")

    let output:ConnectwiseDevice[] = []

    try {

      // get access token
      let axiosInstance = axios.create({baseURL:this.baseUrl, headers: {clientId:this.clientId}});
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axiosInstance.defaults.httpsAgent=httpsAgent;
      const accessToken = await this.getAccessToken(axiosInstance)
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`

      le.AddLogEntry(LogEntryType.Info, `.. querying network devices ..`)
      const networkDevices = await this.callAPI(axiosInstance, '/NetworkDevices?pagesize=10000&orderby=Name asc')
      le.AddLogEntry(LogEntryType.Info, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<networkDevices.length; i++) {

        if(showDebugOutput) { console.debug(networkDevices[i]) }

          try {
          const cwd:ConnectwiseDevice = {
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
          output.push(cwd)

          }  catch(err) {
            le.AddLogEntry(LogEntryType.Error, `error: ${err}`)
            console.debug(networkDevices[i])
            throw(err)
          }
      
      }
      le.AddLogEntry(LogEntryType.Info, `.. network objects created.`)


      } catch (ex) {
          le.AddLogEntry(LogEntryType.Error, `${ex}`)
          throw ex;
      } finally {
          le.AddLogEntry(LogEntryType.Info, 'done.')
          le.logStack.pop()
      }

    return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})

}

private  async getAccessToken(axiosInstance:AxiosInstance):Promise<string> {
    le.logStack.push("getAccessToken")
    let output:string

    try {
        le.AddLogEntry(LogEntryType.Info, 'getting access token ..')
        const response = await axiosInstance.post('/apitoken', { UserName:this.username, Password:this.password});
        output = response.data.AccessToken;
        le.AddLogEntry(LogEntryType.Success, `.. accessToken received.`)
    } catch (ex) {
        le.AddLogEntry(LogEntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.logStack.pop()
    }

    return new Promise<string>((resolve) => {resolve(output)})

}

private async callAPI(axiosInstance:AxiosInstance, apiEndpoint:string):Promise<any> {
  le.logStack.push("callAPI")
  let output:any
  try {
      le.AddLogEntry(LogEntryType.Info, `fetching API: ${apiEndpoint}`)
      const response = await axiosInstance.get(apiEndpoint)
      output = response.data
      le.AddLogEntry(LogEntryType.Success, `.. API call successful.`)
  } catch (ex) {
      le.AddLogEntry(LogEntryType.Error, `${ex}`)
      throw ex;
  } finally {
      le.logStack.pop()
  }
  
  return new Promise<any>((resolve) => {resolve(output)})

}

}
  
export class ConnectwiseDevice {
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