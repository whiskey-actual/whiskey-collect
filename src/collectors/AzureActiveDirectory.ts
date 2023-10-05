// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class AzureActiveDirectoryDevice {
  // mandatory
  public readonly deviceName:string=''
  public readonly azureDeviceId:string=''
  
  // strings
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
  public readonly hireDate:string|undefined=undefined
  public readonly id:string|undefined=undefined
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

export class AzureManagedDevice {
  public readonly observedByAzureMDM:boolean = true
  public readonly deviceName: string=''
  public readonly azureManagedId: string=''
  // strings
  public readonly azureManagedDeviceName:string|undefined=undefined
  public readonly azureManagedUserId:string|undefined=undefined
  public readonly azureManagedDeviceOwnerType:string|undefined=undefined
  public readonly azureManagedOperatingSystem:string|undefined=undefined
  public readonly azureManagedComplianceState:string|undefined=undefined
  public readonly azureManagedJailBroken:string|undefined=undefined
  public readonly azureManagedManagementAgent:string|undefined=undefined
  public readonly azureManagedOperatingSystemVersion:string|undefined=undefined
  public readonly azureManagedEASDeviceID:string|undefined=undefined
  public readonly azureManagedDeviceEnrollmentType:string|undefined=undefined
  public readonly azureManagedActivationLockBypassCode:string|undefined=undefined
  public readonly azureManagedEmailAddress:string|undefined=undefined
  public readonly azureManagedAzureADDeviceID:string|undefined=undefined
  public readonly azureManagedDeviceRegistrationState:string|undefined=undefined
  public readonly azureManagedDeviceCategoryDisplayName:string|undefined=undefined
  public readonly azureManagedExchangeAccessState:string|undefined=undefined
  public readonly azureManagedExchangeAccessStateReason:string|undefined=undefined
  public readonly azureManagedRemoteAssistanceSessionUrl:string|undefined=undefined
  public readonly azureManagedRemoteAssistanceErrorDetails:string|undefined=undefined
  public readonly azureManagedUserPrincipalName:string|undefined=undefined
  public readonly azureManagedModel:string|undefined=undefined
  public readonly azureManagedManufacturer:string|undefined=undefined
  public readonly azureManagedIMEI:string|undefined=undefined
  public readonly azureManagedSerialNumber:string|undefined=undefined
  public readonly azureManagedPhoneNumber:string|undefined=undefined
  public readonly azureManagedAndroidSecurityPatchLevel:string|undefined=undefined
  public readonly azureManagedUserDisplayName:string|undefined=undefined
  public readonly azureManagedConfigurationManagerClientEnabledFeatures:string|undefined=undefined
  public readonly azureManagedWiFiMACAddress:string|undefined=undefined
  public readonly azureManagedDeviceHealthAttestationState:string|undefined=undefined
  public readonly azureManagedSubscriberCarrier:string|undefined=undefined
  public readonly azureManagedMEID:string|undefined=undefined
  public readonly azureManagedPartnerReportedThreatState:string|undefined=undefined
  public readonly azureManagedRequireUserEnrollmentApproval:string|undefined=undefined
  public readonly azureManagedICCID:string|undefined=undefined
  public readonly azureManagedUDID:string|undefined=undefined
  public readonly azureManagedNotes:string|undefined=undefined
  public readonly azureManagedEthernetMacAddress:string|undefined=undefined
  // numbers
  public readonly azureManagedPhysicalMemoryInBytes:number|undefined=0
  public readonly azureManagedTotalStorageSpaceInBytes:number|undefined=undefined
  public readonly azureManagedFreeStorageSpaceInBytes:number|undefined=undefined
  // dates
  public readonly azureManagedEnrolledDateTime:Date|undefined=undefined;
  public readonly azureManagedLastSyncDateTime:Date|undefined=undefined;
  public readonly azureManagedEASActivationDateTime:Date|undefined=undefined;
  public readonly azureManagedExchangeLastSuccessfulSyncDateTime:Date|undefined=undefined;
  public readonly azureManagedComplianceGracePeriodExpirationDateTime:Date|undefined=undefined;
  public readonly azureManagedManagementCertificateExpirationDateTime:Date|undefined=undefined;
  // boolean
  public readonly azureManagedIsEASActivated:boolean=false
  public readonly azureManagedIsAzureADRegistered:boolean=false
  public readonly azureManagedIsSupervised:boolean=false
  public readonly azureManagedIsEncrypted:boolean=false
}

export class AzureActiveDirectory {

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.le=le
    this.db=db

    // set up the graph client
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {scopes: ['https://graph.microsoft.com/.default']})
    this.graphClient = Client.initWithMiddleware({authProvider: authProvider})

  }
  private le:LogEngine
  private db:DBEngine
  private graphClient:Client
  public readonly AzureActiveDirectoryDevices:AzureActiveDirectoryDevice[]=[]
  public readonly AzureActiveDirectoryUsers:AzureActiveDirectoryUser[]=[]
  public readonly AzureManagedDevices:AzureManagedDevice[]=[]


  public async getDevices():Promise<void> {
    this.le.logStack.push("devices")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching devices ..`)

      const response = await this.graphClient.api('/devices').get()
      const devices = response.value

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${devices.length} devices; creating objects ..`)

      for(let i=0; i<devices.length; i++) {

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            deviceName: devices[i].displayName.toString().trim(),
            azureDeviceId: devices[i].deviceId.toString().trim(),
            
            // strings
            azureDeviceCategory: Utilities.CleanedString(devices[i].deviceCategory),
            azureDeviceMetadata: Utilities.CleanedString(devices[i].deviceMetadata),
            azureDeviceOwnership: Utilities.CleanedString(devices[i].deviceOwnership),
            azureDeviceVersion: Utilities.CleanedString(devices[i].deviceVersion),
            azureDomainName: Utilities.CleanedString(devices[i].domainName),
            azureEnrollmentProfileType: Utilities.CleanedString(devices[i].enrollmentProfileType),
            azureEnrollmentType: Utilities.CleanedString(devices[i].enrollmentType),
            azureExternalSourceName: Utilities.CleanedString(devices[i].externalSourceName),
            azureManagementType: Utilities.CleanedString(devices[i].managementType),
            azureManufacturer: Utilities.CleanedString(devices[i].manufacturer),
            azureMDMAppId: Utilities.CleanedString(devices[i].mdmAppId),
            azureModel: Utilities.CleanedString(devices[i].model),
            azureOperatingSystem: Utilities.CleanedString(devices[i].operaingSystem),
            azureOperatingSystemVersion: Utilities.CleanedString(devices[i].operatingSystemVersion),
            azureProfileType: Utilities.CleanedString(devices[i].profileType),
            azureSourceType: Utilities.CleanedString(devices[i].sourceType),
            azureTrustType: Utilities.CleanedString(devices[i].trustType),
            // dates
            azureDeletedDateTime: Utilities.CleanedDate(devices[i].deletedDateTime),
            azureApproximateLastSignInDateTime: Utilities.CleanedDate(devices[i].approximateLastSignInDateTime),
            azureComplianceExpirationDateTime: Utilities.CleanedDate(devices[i].complianceExpirationDateTime),
            azureCreatedDateTime: Utilities.CleanedDate(devices[i].createdDateTime),
            azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(devices[i].onPremisesLastSyncDateTime),
            azureRegistrationDateTime: Utilities.CleanedDate(devices[i].registrationDateTime),
            // booleans
            azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
            azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
            azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
            azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
            azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
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

  
  public async getUsers():Promise<void> {
    this.le.logStack.push("users")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching users ..`)

      const fieldsToFetch = [
        'userPrincipalName',
        'azureID',
        'businessPhones',
        'displayName',
        'givenName',
        'jobTitle',
        'mail',
        'mobilePhone',
        'officeLocation',
        'surname',
        'accountEnabled',
        //'assignedLicenses',
        'assignedPlans',
        'city',
        'country',
        'createdDateTime',
        'creationType',
        'deletedDateTime',
        'department',
        'employeeHireDate',
        //'employeeLeaveDateTime',
        'employeeId',
        'employeeOrgData',
        'employeeType',
        //'externalUserState',
        //'hireDate',
        'id',
        'jobTitle',
        // 'lastPasswordChangeDateTime',
        // 'licenseAssignmentStates',
        // 'mail',
        // 'mailNickname',
        // 'onPremisesDistinguishedName',
        // 'onPremisesDomainName',
        // 'onPremisesSamAccountName',
        // 'onPremisesUserPrincipalName',
        'passwordPolicies',
        'preferredName',
        'postalCode',
        'state',
        'streetAddress',
        'userType',
      ]

      const response = await this.graphClient
        .api('/users')
        .select(fieldsToFetch.join(","))
        .get()

        console.debug(response)

      const users = response.value

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<1; i++) {

        try {

          console.debug(users[i])
          // const aadu:AzureActiveDirectoryUser = {
          //   mandatory
          //   deviceName: devices[i].displayName.toString().trim(),
          //   azureId: devices[i].id.toString().trim(),
            
          //   strings
          //   azureDeviceId: Utilities.CleanedString(devices[i].deviceId),
          //   azureDeviceCategory: Utilities.CleanedString(devices[i].deviceCategory),
          //   azureDeviceMetadata: Utilities.CleanedString(devices[i].deviceMetadata),
          //   azureDeviceOwnership: Utilities.CleanedString(devices[i].deviceOwnership),
          //   azureDeviceVersion: Utilities.CleanedString(devices[i].deviceVersion),
          //   azureDomainName: Utilities.CleanedString(devices[i].domainName),
          //   azureEnrollmentProfileType: Utilities.CleanedString(devices[i].enrollmentProfileType),
          //   azureEnrollmentType: Utilities.CleanedString(devices[i].enrollmentType),
          //   azureExternalSourceName: Utilities.CleanedString(devices[i].externalSourceName),
          //   azureManagementType: Utilities.CleanedString(devices[i].managementType),
          //   azureManufacturer: Utilities.CleanedString(devices[i].manufacturer),
          //   azureMDMAppId: Utilities.CleanedString(devices[i].mdmAppId),
          //   azureModel: Utilities.CleanedString(devices[i].model),
          //   azureOperatingSystem: Utilities.CleanedString(devices[i].operaingSystem),
          //   azureOperatingSystemVersion: Utilities.CleanedString(devices[i].operatingSystemVersion),
          //   azureProfileType: Utilities.CleanedString(devices[i].profileType),
          //   azureSourceType: Utilities.CleanedString(devices[i].sourceType),
          //   azureTrustType: Utilities.CleanedString(devices[i].trustType),
          //   dates
          //   azureDeletedDateTime: Utilities.CleanedDate(devices[i].deletedDateTime),
          //   azureApproximateLastSignInDateTime: Utilities.CleanedDate(devices[i].approximateLastSignInDateTime),
          //   azureComplianceExpirationDateTime: Utilities.CleanedDate(devices[i].complianceExpirationDateTime),
          //   azureCreatedDateTime: Utilities.CleanedDate(devices[i].createdDateTime),
          //   azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(devices[i].onPremisesLastSyncDateTime),
          //   azureRegistrationDateTime: Utilities.CleanedDate(devices[i].registrationDateTime),
          //   booleans
          //   azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
          //   azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
          //   azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
          //   azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
          //   azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          // }

          // this.AzureActiveDirectoryDevices.push(aado)
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

  public async getManagedDevices():Promise<void> {
    this.le.logStack.push("managedDevices")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching managed devices ..`)

      

      const response = await this.graphClient
        .api('/deviceManagement/managedDevices')
        .get()

        console.debug(response)

      const managedDevices = response.value

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${managedDevices.length} devices; creating objects ..`)

      for(let i=0; i<1; i++) {

        try {

          console.debug(managedDevices[i])
          // const aadu:AzureActiveDirectoryUser = {
          //   mandatory
          //   deviceName: devices[i].displayName.toString().trim(),
          //   azureId: devices[i].id.toString().trim(),
            
          //   strings
          //   azureDeviceId: Utilities.CleanedString(devices[i].deviceId),
          //   azureDeviceCategory: Utilities.CleanedString(devices[i].deviceCategory),
          //   azureDeviceMetadata: Utilities.CleanedString(devices[i].deviceMetadata),
          //   azureDeviceOwnership: Utilities.CleanedString(devices[i].deviceOwnership),
          //   azureDeviceVersion: Utilities.CleanedString(devices[i].deviceVersion),
          //   azureDomainName: Utilities.CleanedString(devices[i].domainName),
          //   azureEnrollmentProfileType: Utilities.CleanedString(devices[i].enrollmentProfileType),
          //   azureEnrollmentType: Utilities.CleanedString(devices[i].enrollmentType),
          //   azureExternalSourceName: Utilities.CleanedString(devices[i].externalSourceName),
          //   azureManagementType: Utilities.CleanedString(devices[i].managementType),
          //   azureManufacturer: Utilities.CleanedString(devices[i].manufacturer),
          //   azureMDMAppId: Utilities.CleanedString(devices[i].mdmAppId),
          //   azureModel: Utilities.CleanedString(devices[i].model),
          //   azureOperatingSystem: Utilities.CleanedString(devices[i].operaingSystem),
          //   azureOperatingSystemVersion: Utilities.CleanedString(devices[i].operatingSystemVersion),
          //   azureProfileType: Utilities.CleanedString(devices[i].profileType),
          //   azureSourceType: Utilities.CleanedString(devices[i].sourceType),
          //   azureTrustType: Utilities.CleanedString(devices[i].trustType),
          //   dates
          //   azureDeletedDateTime: Utilities.CleanedDate(devices[i].deletedDateTime),
          //   azureApproximateLastSignInDateTime: Utilities.CleanedDate(devices[i].approximateLastSignInDateTime),
          //   azureComplianceExpirationDateTime: Utilities.CleanedDate(devices[i].complianceExpirationDateTime),
          //   azureCreatedDateTime: Utilities.CleanedDate(devices[i].createdDateTime),
          //   azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(devices[i].onPremisesLastSyncDateTime),
          //   azureRegistrationDateTime: Utilities.CleanedDate(devices[i].registrationDateTime),
          //   booleans
          //   azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
          //   azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
          //   azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
          //   azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
          //   azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          // }

          // this.AzureActiveDirectoryDevices.push(aado)
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
  


  public async persist() {
    this.le.logStack.push('persist')
    this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {

      for(let i=0; i<this.AzureActiveDirectoryDevices.length; i++) {

        //console.debug(this.AzureActiveDirectoryDevices[i])

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuAzureActiveDirectory:TableUpdate = new TableUpdate('DeviceAzureActiveDirectory', 'DeviceAzureActiveDirectoryID')
        
        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryDevices[i].deviceName, mssql.VarChar(255))], true)
        const DeviceAzureActiveDirectoryID:number = await this.db.getID("DeviceAzureActiveDirectory", [new ColumnValuePair('AzureID', this.AzureActiveDirectoryDevices[i].azureDeviceId, mssql.VarChar(255))], true)

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
}