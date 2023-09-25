// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import { AzureActiveDirectoryDevice } from '../models/Device'
import sql from 'mssql'

export class ConnectwiseControl {

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])
  

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureActiveDirectoryDevice[]> {
   this._le.logStack.push('fetch')

    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Note, 'initializing ..')
    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Note, '.. getting access token.. ')
    const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const accessToken = authResponse.accessToken;
    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Note, '.. got access token ..')
    let output:Array<AzureActiveDirectoryDevice> = []

    output = await this.devices(GRAPH_ENDPOINT, accessToken);

    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Verified, '.. done.')
   this._le.logStack.pop()
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
  }

  private async devices(GRAPH_ENDPOINT:string, accessToken:string):Promise<AzureActiveDirectoryDevice[]> {

    let output:Array<AzureActiveDirectoryDevice> = []
   this._le.logStack.push('devices')
    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Note, `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    this._le.AddLogEntry(LogEngine.Severity.Ok, LogEngine.Action.Verified, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const d:AzureActiveDirectoryDevice = {
        deviceName: deviceList[i].displayName.toString(),
        observedByAzureActiveDirectory: true,
        azureDisplayName: deviceList[i].displayName.toString(),
        azureId: deviceList[i].id,
        azureDeviceCategory: deviceList[i].deviceCategory ? deviceList[i].deviceCategory.toString() : undefined,
        azureDeviceId: deviceList[i].deviceId ? deviceList[i].deviceId.toString() : undefined,
        azureDeviceMetadata: deviceList[i].deviceMetadata ? deviceList[i].deviceMetadata.toString() : undefined,
        azureDeviceOwnership: deviceList[i].deviceOwnership ? deviceList[i].deviceOwnership.toString() : undefined,
        azureDeviceVersion: deviceList[i].deviceVersion ? deviceList[i].deviceVersion.toString() : undefined,
        azureDomainName: deviceList[i].domainName ? deviceList[i].domainName.toString() : undefined,
        azureEnrollmentProfileType: deviceList[i].enrollmentProfileType ? deviceList[i].enrollmentProfileType.toString() : undefined,
        azureEnrollmentType: deviceList[i].enrollmentType ? deviceList[i].enrollmentType.toString() : undefined,
        azureExternalSourceName: deviceList[i].externalSourceName ? deviceList[i].externalSourceName.toString() : undefined,
        azureManagementType: deviceList[i].managementType ? deviceList[i].managementType.toString() : undefined,
        azureManufacturer: deviceList[i].manufacturer ? deviceList[i].manufacturer.toString() : undefined,
        azureMDMAppId: deviceList[i].mdmAppId ? deviceList[i].mdmAppId.toString() : undefined,
        azureModel: deviceList[i].model ? deviceList[i].model.toString() : undefined,
        azureOperatingSystem: deviceList[i].operaingSystem ? deviceList[i].operaingSystem.toString() : undefined,
        azureOperatingSystemVersion: deviceList[i].operatingSystemVersion ? deviceList[i].operatingSystemVersion.toString() : undefined,
        azureProfileType: deviceList[i].profileType ? deviceList[i].profileType.toString() : undefined,
        azureSourceType: deviceList[i].sourceType ? deviceList[i].sourceType.toString() : undefined,
        azureTrustType: deviceList[i].trustType ? deviceList[i].trustType.toString() : undefined,
        azureDeletedDateTime: new Date(deviceList[i].deletedDateTime),
        azureApproximateLastSignInDateTime: new Date(deviceList[i].approximateLastSignInDateTime),
        azureComplianceExpirationDateTime: new Date(deviceList[i].complianceExpirationDateTime),
        azureCreatedDateTime: new Date(deviceList[i].createdDateTime),
        azureOnPremisesLastSyncDateTime: new Date(deviceList[i].onPremisesLastSyncDateTime),
        azureRegistrationDateTime: new Date(deviceList[i].registrationDateTime),
        azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false,
        azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false,
        azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : false,
        azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : false,
        azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : false,
      }

      output.push(d)
    }

   this._le.logStack.pop()
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
  }

  private async getToken(AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {

    const msalConfig:msal.Configuration = {
      auth: {
        clientId: CLIENT_ID,
        authority: `${AAD_ENDPOINT}/${TENANT_ID}`,
        clientSecret: CLIENT_SECRET
      }
    }

    const tokenRequest:msal.ClientCredentialRequest = { scopes: [`${GRAPH_ENDPOINT}/.default`]}

    const cca:msal.ConfidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);


    const result:msal.AuthenticationResult|null =  await cca.acquireTokenByClientCredential(tokenRequest)

    if(result!=null) {
      return new Promise<msal.AuthenticationResult>((resolve) => {resolve(result)})
    }
    else {
      throw('error getting token')
    }

  }

  private async callAPI(accessToken:string, endpoint:string):Promise<any> {

    let output:any = undefined
   this._le.logStack.push('callAPI')

    const options = { headers: { Authorization: `Bearer ${accessToken}`}}

    try {
      const response = await axios.get(endpoint, options)
      output = response.data
    } catch (error:any) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `error: ${error.toString()}`)
      return error;
    }

   this._le.logStack.pop();
    return new Promise<any>((resolve) => {resolve(output)})


  }

  private async getData(accesstoken:string, uri:string):Promise<any> {

    var output:any = []
   this._le.logStack.push('getData')

    try {

       const response = await this.callAPI(accesstoken, uri);
       for(const value of response.value) {
        output.push(value)
       }

       var nextLink = response['@odata.nextLink']
       while(nextLink) {
        const nextPage = await this.callAPI(accesstoken, nextLink)
        nextLink = nextPage['@odata.nextLink']

        for(const value of nextPage.value) {
          output.push(value)
        }
       }
    } catch (error:any) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `error: ${error.toString()}`)
    }

   this._le.logStack.pop()
    return new Promise<any>((resolve) => {resolve(output)})

  }

  public async persist(sqlConfig:any, devices:AzureActiveDirectoryDevice[]):Promise<Boolean> {

   this._le.logStack.push("persist");
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `persisting ${devices.length} devices ..`)

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. connecting to mssql @ ${sqlConfig.server} ..`)
    let pool = await sql.connect(sqlConfig)
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Verified, `.. connected, persisting devices .. `)

    for(let i=0; i<devices.length; i++) {
      try {
        const result = await pool.request()
        .input('deviceName', sql.VarChar(255), devices[i].azureDisplayName)
        .input('azureId', sql.VarChar(255), devices[i].azureId)
        .input('azureDeviceCategory', sql.VarChar(255), devices[i].azureDeviceCategory)
        .input('azureDeviceId', sql.VarChar(255), devices[i].azureDeviceId)
        .input('azureDeviceMetadata', sql.VarChar(255), devices[i].azureDeviceMetadata)
        .input('azureDeviceOwnership', sql.VarChar(255), devices[i].azureDeviceOwnership)
        .input('azureDeviceVersion', sql.VarChar(255), devices[i].azureDeviceVersion)
        .input('azureDomainName', sql.VarChar(255), devices[i].azureDomainName)
        .input('azureEnrollmentProfileType', sql.VarChar(255), devices[i].azureEnrollmentProfileType)
        .input('azureEnrollmentType', sql.VarChar(255), devices[i].azureEnrollmentType)
        .input('azureExternalSourceName', sql.VarChar(255), devices[i].azureExternalSourceName)
        .input('azureManagementType', sql.VarChar(255), devices[i].azureManagementType)
        .input('azureManufacturer', sql.VarChar(255), devices[i].azureManufacturer)
        .input('azureMDMAppId', sql.VarChar(255), devices[i].azureMDMAppId)
        .input('azureModel', sql.VarChar(255), devices[i].azureModel)
        .input('azureOperatingSystem', sql.VarChar(255), devices[i].azureOperatingSystem)
        .input('azureOperatingSystemVersion', sql.VarChar(255), devices[i].azureOperatingSystemVersion)
        .input('azureProfileType', sql.VarChar(255), devices[i].azureProfileType)
        .input('azureSourceType', sql.VarChar(255), devices[i].azureSourceType)
        .input('azureTrustType', sql.VarChar(255), devices[i].azureTrustType)
        // dates
        .input('azureDeletedDateTime', sql.DateTime2, devices[i].azureDeletedDateTime)
        .input('azureApproximateLastSignInDateTime', sql.DateTime2, devices[i].azureApproximateLastSignInDateTime)
        .input('azureComplianceExpirationDateTime', sql.DateTime2, devices[i].azureComplianceExpirationDateTime)
        .input('azureCreatedDateTime', sql.DateTime2, devices[i].azureCreatedDateTime)
        .input('azureOnPremisesLastSyncDateTime', sql.DateTime2, devices[i].azureOnPremisesLastSyncDateTime)
        .input('azureRegistrationDateTime', sql.DateTime2, devices[i].azureRegistrationDateTime)
        // booleans
        .input('azureOnPremisesSyncEnabled', sql.Bit, devices[i].azureOnPremisesSyncEnabled)
        .input('azureAccountEnabled', sql.Bit, devices[i].azureAccountEnabled)
        .input('azureIsCompliant', sql.Bit, devices[i].azureIsCompliant)
        .input('azureIsManaged', sql.Bit, devices[i].azureIsManaged)
        .input('azureIsRooted', sql.Bit, devices[i].azureIsRooted)
        .execute('sp_add_device_azureActiveDirectory')
        //console.debug(result)
        
      }
      catch(err) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `ERR: ${err}`)
       this._le.logStack.pop()
        throw(err)
      }
    }

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `done.`)
    
   this._le.logStack.pop()
    return new Promise<Boolean>((resolve) => {resolve(true)})
  }

}
