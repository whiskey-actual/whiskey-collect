// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import { AzureActiveDirectoryDevice } from '../models/Device'

export class AzureActiveDirectory {

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureActiveDirectoryDevice[]> {
   this._le.logStack.push('fetch')

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'initializing ..')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token.. ')
    const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const accessToken = authResponse.accessToken;
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. got access token ..')
    let output:Array<AzureActiveDirectoryDevice> = []

    output = await this.devices(GRAPH_ENDPOINT, accessToken);

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. done.')
   this._le.logStack.pop()
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
  }

  private async devices(GRAPH_ENDPOINT:string, accessToken:string):Promise<AzureActiveDirectoryDevice[]> {

    let output:Array<AzureActiveDirectoryDevice> = []
   this._le.logStack.push('devices')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {

      // let q = new sql.Request()
      // .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
      // .input('azureId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
      // .input('azureDeviceCategory', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceCategory))
      // .input('azureDeviceId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceId))
      // .input('azureDeviceMetadata', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceMetadata))
      // .input('azureDeviceOwnership', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceOwnership))
      // .input('azureDeviceVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceVersion))
      // .input('azureDomainName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].domainName))
      // .input('azureEnrollmentProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentProfileType))
      // .input('azureEnrollmentType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentType))
      // .input('azureExternalSourceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].externalSourceName))
      // .input('azureManagementType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managementType))
      // .input('azureManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].manufacturer))
      // .input('azureMDMAppId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].mdmAppId))
      // .input('azureModel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].model))
      // .input('azureOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operaingSystem))
      // .input('azureOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operatingSystemVersion))
      // .input('azureProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].profileType))
      // .input('azureSourceType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].sourceType))
      // .input('azureTrustType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].trustType))
      // // dates
      // .input('azureDeletedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].deletedDateTime))
      // .input('azureApproximateLastSignInDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].approximateLastSignInDateTime))
      // .input('azureComplianceExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].complianceExpirationDateTime))
      // .input('azureCreatedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].createdDateTime))
      // .input('azureOnPremisesLastSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime))
      // .input('azureRegistrationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].registrationDateTime))
      // // booleans
      // .input('azureOnPremisesSyncEnabled', sql.Bit, deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false)
      // .input('azureAccountEnabled', sql.Bit, deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false)
      // .input('azureIsCompliant', sql.Bit, deviceList[i].isCompliant ? deviceList[i].isCompliant : false)
      // .input('azureIsManaged', sql.Bit, deviceList[i].isManaged ? deviceList[i].isManaged : false)
      // .input('azureIsRooted', sql.Bit, deviceList[i].isRooted ? deviceList[i].isRooted : false)
      // output.sqlRequests.push(q)

      const d:AzureActiveDirectoryDevice = {
        // mandatory
        observedByAzureActiveDirectory: true,
        deviceName: deviceList[i].displayName.toString().trim(),
        azureDeviceId: deviceList[i].deviceId.toString().trim(),
        // strings
        azureDisplayName: Utilities.CleanedString(deviceList[i].displayName),
        azureId: Utilities.CleanedString(deviceList[i].id),
        azureDeviceCategory: Utilities.CleanedString(deviceList[i].deviceCategory),
        azureDeviceMetadata: Utilities.CleanedString(deviceList[i].deviceMetadata),
        azureDeviceOwnership: Utilities.CleanedString(deviceList[i].deviceOwnership),
        azureDeviceVersion: Utilities.CleanedString(deviceList[i].deviceVersion),
        azureDomainName: Utilities.CleanedString(deviceList[i].domainName),
        azureEnrollmentProfileType: Utilities.CleanedString(deviceList[i].enrollmentProfileType),
        azureEnrollmentType: Utilities.CleanedString(deviceList[i].enrollmentType),
        azureExternalSourceName: Utilities.CleanedString(deviceList[i].externalSourceName),
        azureManagementType: Utilities.CleanedString(deviceList[i].managementType),
        azureManufacturer: Utilities.CleanedString(deviceList[i].manufacturer),
        azureMDMAppId: Utilities.CleanedString(deviceList[i].mdmAppId),
        azureModel: Utilities.CleanedString(deviceList[i].model),
        azureOperatingSystem: Utilities.CleanedString(deviceList[i].operaingSystem),
        azureOperatingSystemVersion: Utilities.CleanedString(deviceList[i].operatingSystemVersion),
        azureProfileType: Utilities.CleanedString(deviceList[i].profileType),
        azureSourceType: Utilities.CleanedString(deviceList[i].sourceType),
        azureTrustType: Utilities.CleanedString(deviceList[i].trustType),
        // dates
        azureDeletedDateTime: Utilities.CleanedDate(deviceList[i].deletedDateTime),
        azureApproximateLastSignInDateTime: Utilities.CleanedDate(deviceList[i].approximateLastSignInDateTime),
        azureComplianceExpirationDateTime: Utilities.CleanedDate(deviceList[i].complianceExpirationDateTime),
        azureCreatedDateTime: Utilities.CleanedDate(deviceList[i].createdDateTime),
        azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime),
        azureRegistrationDateTime: Utilities.CleanedDate(deviceList[i].registrationDateTime),
        // booleans
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
}