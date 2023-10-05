// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import { Client } from '@microsoft/microsoft-graph-client';
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class AzureActiveDirectoryDevice {
  // mandatory
  public readonly deviceName:string=''
  public readonly azureId:string=''
  
  // strings
  public readonly azureDeviceId:string|undefined=undefined
  public readonly azureDeviceCategory:string|undefined=undefined
  public readonly azureDeviceMetadata:string|undefined=undefined
  public readonly azureDeviceOwnership:string|undefined=undefined
  public readonly azureDeviceVersion:string|undefined=undefined
  public readonly azureDomainName:string|undefined=undefined
  public readonly azureEnrollmentProfileType:string|undefined=undefined
  public readonly azureEnrollmentType:string|undefined=undefined
  public readonly azureExternalSourceName:string|undefined=undefined
  public readonly azureManagementType:string|undefined=undefined
  public readonly azureManufacturer:string|undefined=undefined
  public readonly azureMDMAppId:string|undefined=undefined
  public readonly azureModel:string|undefined=undefined
  public readonly azureOperatingSystem:string|undefined=undefined
  public readonly azureOperatingSystemVersion:string|undefined=undefined
  public readonly azureProfileType:string|undefined=undefined
  public readonly azureSourceType:string|undefined=undefined
  public readonly azureTrustType:string|undefined=undefined
  // dates
  public readonly azureDeletedDateTime:Date|undefined=undefined;
  public readonly azureApproximateLastSignInDateTime:Date|undefined=undefined;
  public readonly azureComplianceExpirationDateTime:Date|undefined=undefined;
  public readonly azureCreatedDateTime:Date|undefined=undefined
  public readonly azureOnPremisesLastSyncDateTime:Date|undefined=undefined
  public readonly azureRegistrationDateTime:Date|undefined=undefined
  // booleans
  public readonly azureOnPremisesSyncEnabled:boolean=false;
  public readonly azureAccountEnabled:boolean=false;
  public readonly azureIsCompliant:boolean=false;
  public readonly azureIsManaged:boolean=false;
  public readonly azureIsRooted:boolean=false;
}

export class AzureActiveDirectoryUser {

  public readonly userPrincipalName:string=''
  public readonly AzureID:string=''

  public readonly businessPhones:string[]|undefined=undefined
  public readonly displayName:string|undefined=undefined
  public readonly givenName:string|undefined=undefined
  public readonly jobTitle:string|undefined=undefined
  public readonly mail:string|undefined=undefined
  public readonly mobilePhone:string|undefined=undefined
  public readonly officeLocation:string|undefined=undefined
  public readonly surname:string|undefined=undefined

  public readonly accountEnabled:string|undefined=undefined
  public readonly assignedLicenses:string|undefined=undefined
  public readonly assignedPlans:string|undefined=undefined
  public readonly city:string|undefined=undefined
  public readonly country:string|undefined=undefined
  public readonly createdDateTime:string|undefined=undefined
  public readonly creationType:string|undefined=undefined
  public readonly deletedDateTime:string|undefined=undefined
  public readonly department:string|undefined=undefined
  public readonly employeeHireDate:string|undefined=undefined
  public readonly employeeLeaveDateTime:string|undefined=undefined
  public readonly employeeId:string|undefined=undefined
  public readonly employeeOrgData:string|undefined=undefined
  public readonly employeeType:string|undefined=undefined
  public readonly externalUserState:string|undefined=undefined
  public readonly hireDateid:string|undefined=undefined
  public readonly lastPasswordChangeDateTime:string|undefined=undefined
  public readonly licenseAssignmentStates:string|undefined=undefined
  public readonly mailNickname:string|undefined=undefined
  public readonly onPremisesDistinguishedName:string|undefined=undefined
  public readonly onPremisesDomainName:string|undefined=undefined
  public readonly onPremisesSamAccountName:string|undefined=undefined
  public readonly onPremisesUserPrincipalNAme:string|undefined=undefined
  public readonly preferredName:string|undefined=undefined
  public readonly signInActivity:string|undefined=undefined
  public readonly state:string|undefined=undefined
  public readonly streetAddress:string|undefined=undefined
  public readonly userType:string|undefined=undefined

}

export class AzureActiveDirectory {

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.le=le
    this.db=db
    this.tenantId=TENANT_ID
    this.aadEndpoint=AAD_ENDPOINT
    this.graphEndpoint=GRAPH_ENDPOINT
    this.clientId=CLIENT_ID
    this.clientSecret=CLIENT_SECRET
  }
  private le:LogEngine
  private db:DBEngine
  private tenantId:string
  private aadEndpoint:string
  private graphEndpoint:string
  private clientId:string
  private clientSecret:string
  public readonly AzureActiveDirectoryDevices:AzureActiveDirectoryDevice[]=[]

  public async fetch():Promise<void> {
    this.le.logStack.push('fetch')

    try {

      await this.getToken()

      const accessToken = await this.getToken()

      await this.devices(accessToken)
      //await this.users(`${GRAPH_ENDPOINT}/v1.0/users`, accessToken)

    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})
  }

  private async devices(accessToken:string):Promise<void> {
    this.le.logStack.push("devices")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching devices ..`)

      const deviceList = await this.getData(accessToken, 'devices')

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${deviceList.length} devices; creating objects ..`)

      for(let i=0; i<deviceList.length; i++) {

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            deviceName: deviceList[i].displayName.toString().trim(),
            azureId: deviceList[i].id.toString().trim(),
            
            // strings
            azureDeviceId: Utilities.CleanedString(deviceList[i].deviceId),
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

          this.AzureActiveDirectoryDevices.push(aado)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  private async users(uri:string, accessToken:string):Promise<void> {
    this.le.logStack.push("users")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching users ..`)

      const userList = await this.getData(accessToken, uri)

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${userList.length} users; creating objects ..`)

      for(let i=0; i<userList.length; i++) {

        console.debug(userList[i])

        // try {
        //   const aado:AzureActiveDirectoryObject = {
        //     // mandatory
        //     observedByAzureActiveDirectory: true,
        //     deviceName: deviceList[i].displayName.toString().trim(),
        //     azureId: deviceList[i].id.toString().trim(),
            
        //     // strings
        //     azureDeviceId: Utilities.CleanedString(deviceList[i].deviceId),
        //     azureDeviceCategory: Utilities.CleanedString(deviceList[i].deviceCategory),
        //     azureDeviceMetadata: Utilities.CleanedString(deviceList[i].deviceMetadata),
        //     azureDeviceOwnership: Utilities.CleanedString(deviceList[i].deviceOwnership),
        //     azureDeviceVersion: Utilities.CleanedString(deviceList[i].deviceVersion),
        //     azureDomainName: Utilities.CleanedString(deviceList[i].domainName),
        //     azureEnrollmentProfileType: Utilities.CleanedString(deviceList[i].enrollmentProfileType),
        //     azureEnrollmentType: Utilities.CleanedString(deviceList[i].enrollmentType),
        //     azureExternalSourceName: Utilities.CleanedString(deviceList[i].externalSourceName),
        //     azureManagementType: Utilities.CleanedString(deviceList[i].managementType),
        //     azureManufacturer: Utilities.CleanedString(deviceList[i].manufacturer),
        //     azureMDMAppId: Utilities.CleanedString(deviceList[i].mdmAppId),
        //     azureModel: Utilities.CleanedString(deviceList[i].model),
        //     azureOperatingSystem: Utilities.CleanedString(deviceList[i].operaingSystem),
        //     azureOperatingSystemVersion: Utilities.CleanedString(deviceList[i].operatingSystemVersion),
        //     azureProfileType: Utilities.CleanedString(deviceList[i].profileType),
        //     azureSourceType: Utilities.CleanedString(deviceList[i].sourceType),
        //     azureTrustType: Utilities.CleanedString(deviceList[i].trustType),
        //     // dates
        //     azureDeletedDateTime: Utilities.CleanedDate(deviceList[i].deletedDateTime),
        //     azureApproximateLastSignInDateTime: Utilities.CleanedDate(deviceList[i].approximateLastSignInDateTime),
        //     azureComplianceExpirationDateTime: Utilities.CleanedDate(deviceList[i].complianceExpirationDateTime),
        //     azureCreatedDateTime: Utilities.CleanedDate(deviceList[i].createdDateTime),
        //     azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime),
        //     azureRegistrationDateTime: Utilities.CleanedDate(deviceList[i].registrationDateTime),
        //     // booleans
        //     azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false,
        //     azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false,
        //     azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : false,
        //     azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : false,
        //     azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : false,
        //   }

        //   this.AzureActiveDirectoryDevices.push(aado)
        // } catch (err) {
        //   this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
        //   throw(err)
        // }
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }


  public async persist() {
    this.le.logStack.push('persist')
    this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {

      for(let i=0; i<this.AzureActiveDirectoryDevices.length; i++) {

        //console.debug(this.AzureActiveDirectoryDevices[i])

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuAzureActiveDirectory:TableUpdate = new TableUpdate('DeviceAzureActiveDirectory', 'DeviceAzureActiveDirectoryID')
        
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryDevices[i].deviceName, mssql.VarChar(255))], true)
        const DeviceAzureActiveDirectoryID:number = await this.db.getID("DeviceAzureActiveDirectory", [new ColumnValuePair('AzureID', this.AzureActiveDirectoryDevices[i].azureId, mssql.VarChar(255))], true)

        // update the device table to add the corresponding DeviceAzureActiveDirectoryID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.AzureActiveDirectoryDevices[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryID", mssql.Int, DeviceAzureActiveDirectoryID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceActiveDirectory table values ..
        let ruAzureActiveDirectory = new RowUpdate(DeviceAzureActiveDirectoryID)
        ruAzureActiveDirectory.updateName=this.AzureActiveDirectoryDevices[i].deviceName
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceCategory", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceCategory))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceMetadata", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceMetadata))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceOwnership", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceOwnership))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceVersion))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDomainName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDomainName))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentProfileType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureExternalSourceName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureExternalSourceName))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManagementType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManagementType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManufacturer", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManufacturer))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureMDMAppId", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureMDMAppId))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureModel", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureModel))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystem", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystem))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystemVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystemVersion))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureProfileType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureSourceType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureSourceType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureTrustType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureTrustType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureDeletedDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureApproximateLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureApproximateLastSignInDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureComplianceExpirationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureComplianceExpirationDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureCreatedDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesLastSyncDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureOnPremisesLastSyncDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureRegistrationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureRegistrationDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesSyncEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureOnPremisesSyncEnabled))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureAccountEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureAccountEnabled))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsCompliant", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsCompliant))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsManaged", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsManaged))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsRooted", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsRooted))
        tuAzureActiveDirectory.RowUpdates.push(ruAzureActiveDirectory)

        await this.db.updateTable(tuDevice, true)
        await this.db.updateTable(tuAzureActiveDirectory, true)

       }
      
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'done')
      this.le.logStack.pop()
    }

  }

  private async getToken():Promise<string> {
    this.le.logStack.push('getToken')
    let output:any = undefined
   
    try {
      const endpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`

      const formData = new FormData()
      formData.append('client_id', this.clientId)
      formData.append('scope', 'https://graph.microsoft.com/.default')
      formData.append('client_secret', this.clientSecret)
      formData.append('grant_type', 'client_credentials')
      const response = await axios({
        method: 'post',
        url: endpoint,
        data: formData,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`,
        },
    });
      output = response.data.access_token
    } catch (err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop();
    }

    return new Promise<any>((resolve) => {resolve(output)})

  }

  private async callAPI(accessToken:string, endpoint:string):Promise<any> {
    this.le.logStack.push('callAPI')
    let output:any = undefined
   
    try {
      const options = { headers: { Authorization: `Bearer ${accessToken}`}}
      const response = await axios.get(endpoint, options)
      output = response.data
    } catch (err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop();
    }

    return new Promise<any>((resolve) => {resolve(output)})

  }

  private async getData(accesstoken:string, api_endpoint:string):Promise<any> {
    this.le.logStack.push('getData')
    var output:any = []
   
    try {

       const response = await this.callAPI(accesstoken, `${this.graphEndpoint}/v1.0/${api_endpoint}`);
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
    } catch (err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }
}