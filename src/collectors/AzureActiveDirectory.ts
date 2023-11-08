// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString, getMaxDateFromObject, minimumJsonDate } from 'whiskey-util'

import { Client, PageCollection, PageIterator, PageIteratorCallback } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import mssql from 'mssql'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"

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

  public readonly id:string=''

  public readonly emailAddress:string|undefined=undefined
  public readonly mail:string|undefined=undefined
  public readonly userPrincipalName:string|undefined=undefined
  public readonly businessPhone:string|undefined=undefined // this is an array, but just take the first entry (for now) for simplicity
  public readonly displayName:string|undefined=undefined
  public readonly givenName:string|undefined=undefined
  public readonly jobTitle:string|undefined=undefined
  public readonly mobilePhone:string|undefined=undefined
  public readonly officeLocation:string|undefined=undefined
  public readonly surname:string|undefined=undefined
  //public readonly assignedLicenses:string|undefined=undefined
  public readonly assignedPlans:string|undefined=undefined
  public readonly city:string|undefined=undefined
  public readonly country:string|undefined=undefined
  
  public readonly creationType:string|undefined=undefined
  
  public readonly department:string|undefined=undefined
  public readonly UserHireDate:string|undefined=undefined
  //public readonly UserLeaveDateTime:string|undefined=undefined
  public readonly UserId:string|undefined=undefined
  public readonly UserOrgData:string|undefined=undefined
  public readonly UserType:string|undefined=undefined
  //public readonly externalUserState:string|undefined=undefined
  //public readonly hireDate:string|undefined=undefined
  
  //public readonly licenseAssignmentStates:string|undefined=undefined
  //public readonly mailNickname:string|undefined=undefined
  public readonly onPremisesDistinguishedName:string|undefined=undefined
  public readonly onPremisesDomainName:string|undefined=undefined
  public readonly onPremisesSamAccountName:string|undefined=undefined
  public readonly onPremisesUserPrincipalName:string|undefined=undefined
  public readonly passwordPolicies:string|undefined=undefined
  //public readonly preferredName:string|undefined=undefined
  //public readonly signInActivity:string|undefined=undefined
  public readonly postalCode:string|undefined=undefined
  public readonly state:string|undefined=undefined
  public readonly streetAddress:string|undefined=undefined
  public readonly userType:string|undefined=undefined

  // bit
  public readonly accountEnabled:boolean=false

  // datetime
  public readonly createdDateTime:Date|undefined=undefined
  public readonly deletedDateTime:Date|undefined=undefined
  public readonly lastPasswordChangeDateTime:Date|undefined=undefined
  public readonly lastSignInDateTime?:Date=undefined

  public readonly services:UserService[] = []

}

export class UserService {
  public readonly serviceName?:string = ''
  public readonly servicePlanId?:string = ''
  public readonly assignedDateTime?:Date = minimumJsonDate
  public readonly serviceStatus?:string = ''
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

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string) {
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

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching devices ..`)

      const devices = await this.getData('/devices')

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${devices.length} devices; creating objects ..`)

      for(let i=0; i<devices.length; i++) {

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            deviceName: devices[i].displayName.toString().trim(),
            azureDeviceId: devices[i].deviceId.toString().trim(),
            
            // strings
            azureDeviceCategory: CleanedString(devices[i].deviceCategory),
            azureDeviceMetadata: CleanedString(devices[i].deviceMetadata),
            azureDeviceOwnership: CleanedString(devices[i].deviceOwnership),
            azureDeviceVersion: CleanedString(devices[i].deviceVersion),
            azureDomainName: CleanedString(devices[i].domainName),
            azureEnrollmentProfileType: CleanedString(devices[i].enrollmentProfileType),
            azureEnrollmentType: CleanedString(devices[i].enrollmentType),
            azureExternalSourceName: CleanedString(devices[i].externalSourceName),
            azureManagementType: CleanedString(devices[i].managementType),
            azureManufacturer: CleanedString(devices[i].manufacturer),
            azureMDMAppId: CleanedString(devices[i].mdmAppId),
            azureModel: CleanedString(devices[i].model),
            azureOperatingSystem: CleanedString(devices[i].operaingSystem),
            azureOperatingSystemVersion: CleanedString(devices[i].operatingSystemVersion),
            azureProfileType: CleanedString(devices[i].profileType),
            azureSourceType: CleanedString(devices[i].sourceType),
            azureTrustType: CleanedString(devices[i].trustType),
            // dates
            azureDeletedDateTime: CleanedDate(devices[i].deletedDateTime),
            azureApproximateLastSignInDateTime: CleanedDate(devices[i].approximateLastSignInDateTime),
            azureComplianceExpirationDateTime: CleanedDate(devices[i].complianceExpirationDateTime),
            azureCreatedDateTime: CleanedDate(devices[i].createdDateTime),
            azureOnPremisesLastSyncDateTime: CleanedDate(devices[i].onPremisesLastSyncDateTime),
            azureRegistrationDateTime: CleanedDate(devices[i].registrationDateTime),
            // booleans
            azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
            azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
            azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
            azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
            azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          }

          this.AzureActiveDirectoryDevices.push(aado)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }
  
  public async getUsers():Promise<void> {
    this.le.logStack.push("users")

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching users ..`)

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
        'assignedLicenses',
        'assignedPlans',
        'city',
        'country',
        'createdDateTime',
        'creationType',
        'deletedDateTime',
        'department',
        'UserHireDate',
        //'UserLeaveDateTime',
        'UserId',
        'UserOrgData',
        'UserType',
        //'externalUserState',
        //'hireDate',
        'id',
        'jobTitle',
        'lastPasswordChangeDateTime',
        // 'licenseAssignmentStates',
        // 'mailNickname',
        'onPremisesDistinguishedName',
        'onPremisesDomainName',
        'onPremisesSamAccountName',
        'onPremisesUserPrincipalName',
        'passwordPolicies',
        //'preferredName',
        'postalCode',
        'state',
        'streetAddress',
        'userType',
        'signInActivity'
      ]


      const users = await this.getData('/users', fieldsToFetch)

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<users.length; i++) {
        try {

          //console.debug(users[i].signInActivity)

          // assignedLicenses
          // assignedPlans: CleanedString(users[i].assignedPlans),

          //console.debug(users[i].assignedPlans)

          let userServices:UserService[] = []
          for(let j=0; j<users[i].assignedPlans.length; j++) {
            try {
              const us:UserService = {
                serviceName: CleanedString(users[i].assignedPlans[j].service),
                servicePlanId: CleanedString(users[i].assignedPlans[j].servicePlanId),
                assignedDateTime: CleanedDate(users[i].assignedPlans[j].assignedDateTime),
                serviceStatus: CleanedString(users[i].assignedPlans[j].capabilityStatus)
              }
              userServices.push(us);
            } catch(err) {
              console.debug(users[i].assignedPlans)
              console.debug(users[i].assignedPlans[j])
              throw err;
            }
            
          }

          const aadu:AzureActiveDirectoryUser = {
            emailAddress: users[i].mail ? users[i].mail.toString().trim() : users[i].userPrincipalName ? users[i].userPrincipalName.toString().trim() : users[i].onPremisesUserPrincipalName ? users[i].onPremisesUserPrincipalName.toString().trim() : undefined,
            mail: CleanedString(users[i].mail),
            userPrincipalName: CleanedString(users[i].userPrincipalName),
            id: users[i].id.toString().trim(),
            businessPhone: users[i].businessPhones.length ? users[i].businessPhones[0].toString().trim() : undefined, // need to parse this
            displayName: CleanedString(users[i].displayName),
            givenName: CleanedString(users[i].givenName),
            jobTitle: CleanedString(users[i].jobTitle),
            mobilePhone: CleanedString(users[i].mobilePhone),
            officeLocation: CleanedString(users[i].officeLocation),
            surname: CleanedString(users[i].surname),
            assignedPlans: CleanedString(users[i].assignedPlans),
            city: CleanedString(users[i].city),
            country: CleanedString(users[i].country),
            creationType: CleanedString(users[i].creationType),
            department: CleanedString(users[i].department),
            UserHireDate: CleanedString(users[i].UserHireDate),
            UserId: CleanedString(users[i].UserId),
            UserOrgData: CleanedString(users[i].UserOrgData),
            UserType: CleanedString(users[i].UserType),
            onPremisesDistinguishedName: CleanedString(users[i].onPremisesDistinguishedName),
            onPremisesDomainName: CleanedString(users[i].onPremisesDomainName),
            onPremisesSamAccountName: CleanedString(users[i].onPremisesSamAccountName),
            onPremisesUserPrincipalName: CleanedString(users[i].onPremisesUserPrincipalName),
            passwordPolicies: CleanedString(users[i].passwordPolicies),
            postalCode: CleanedString(users[i].postalCode),
            state: CleanedString(users[i].state),
            streetAddress: CleanedString(users[i].streetAddress),
            userType: CleanedString(users[i].userType),
            accountEnabled: users[i].accountEnabled, // should bit boolean
            createdDateTime: CleanedDate(users[i].createdDateTime),
            deletedDateTime: CleanedDate(users[i].deletedDateTime),
            lastPasswordChangeDateTime: CleanedDate(users[i].lastPasswordChangeDateTime),
            services: userServices,
            lastSignInDateTime: users[i].signInActivity ? CleanedDate(users[i].signInActivity.lastSignInDateTime) : undefined
          }

          this.AzureActiveDirectoryUsers.push(aadu)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async getManagedDevices():Promise<void> {
    this.le.logStack.push("managedDevices")

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching managed devices ..`)

      const managedDevices = await this.getData('/deviceManagement/managedDevices')

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${managedDevices.length} devices; creating objects ..`)

      for(let i=0; i<managedDevices.length; i++) {

        try {

          const amd:AzureManagedDevice = {
            observedByAzureMDM: true,
            deviceName: managedDevices[i].deviceName.toString().trim(),
            azureManagedId: managedDevices[i].id.toString().trim(),
            // strings
            azureManagedDeviceName: CleanedString(managedDevices[i].azureManagedDeviceName),
            azureManagedUserId: CleanedString(managedDevices[i].userId),
            azureManagedDeviceOwnerType: CleanedString(managedDevices[i].managedDeviceOwnerType),
            azureManagedOperatingSystem: CleanedString(managedDevices[i].operatingSystem),
            azureManagedComplianceState: CleanedString(managedDevices[i].complianceState),
            azureManagedJailBroken: CleanedString(managedDevices[i].jailBroken),
            azureManagedManagementAgent: CleanedString(managedDevices[i].managementAgent),
            azureManagedOperatingSystemVersion: CleanedString(managedDevices[i].osVersion),
            azureManagedEASDeviceID: CleanedString(managedDevices[i].easDeviceId),
            azureManagedDeviceEnrollmentType: CleanedString(managedDevices[i].deviceEnrollmentType),
            azureManagedActivationLockBypassCode: CleanedString(managedDevices[i].activationLockBypassCode),
            azureManagedEmailAddress: CleanedString(managedDevices[i].emailAddress),
            azureManagedAzureADDeviceID: CleanedString(managedDevices[i].azureADDeviceID),
            azureManagedDeviceRegistrationState: CleanedString(managedDevices[i].deviceRegistrationState),
            azureManagedDeviceCategoryDisplayName: CleanedString(managedDevices[i].deviceCategoryDisplayName),
            azureManagedExchangeAccessState: CleanedString(managedDevices[i].exchangeAccessState),
            azureManagedExchangeAccessStateReason: CleanedString(managedDevices[i].accessStateReason),
            azureManagedRemoteAssistanceSessionUrl: CleanedString(managedDevices[i].remoteAssistanceSessionUrl),
            azureManagedRemoteAssistanceErrorDetails: CleanedString(managedDevices[i].remoteAssistanceErrorDetails),
            azureManagedUserPrincipalName: CleanedString(managedDevices[i].userPrincipalName),
            azureManagedModel: CleanedString(managedDevices[i].model),
            azureManagedManufacturer: CleanedString(managedDevices[i].manufacturer),
            azureManagedIMEI: CleanedString(managedDevices[i].imei),
            azureManagedSerialNumber: CleanedString(managedDevices[i].serialNumber),
            azureManagedPhoneNumber: CleanedString(managedDevices[i].phoneNumber),
            azureManagedAndroidSecurityPatchLevel: CleanedString(managedDevices[i].securityPatchLevel),
            azureManagedUserDisplayName: CleanedString(managedDevices[i].userDisplayName),
            azureManagedConfigurationManagerClientEnabledFeatures: CleanedString(managedDevices[i].configurationManagerClientEnabledFeatures),
            azureManagedWiFiMACAddress: CleanedString(managedDevices[i].wifiMacAddress),
            azureManagedDeviceHealthAttestationState: CleanedString(managedDevices[i].deviceHealthAttestationState),
            azureManagedSubscriberCarrier: CleanedString(managedDevices[i].subscriberCarrier),
            azureManagedMEID: CleanedString(managedDevices[i].meid),
            azureManagedPartnerReportedThreatState: CleanedString(managedDevices[i].partnerReportedThreatState),
            azureManagedRequireUserEnrollmentApproval: CleanedString(managedDevices[i].requireUserEnrollmentApproval),
            azureManagedICCID: CleanedString(managedDevices[i].iccid),
            azureManagedUDID: CleanedString(managedDevices[i].udid),
            azureManagedNotes: CleanedString(managedDevices[i].notes),
            azureManagedEthernetMacAddress: CleanedString(managedDevices[i].ethernetMacAddress),
            // numbers
            azureManagedPhysicalMemoryInBytes: Number(CleanedString(managedDevices[i].physicalMemoryInBytes)),
            azureManagedTotalStorageSpaceInBytes: Number(CleanedString(managedDevices[i].totalStorageSpaceInBytes)),
            azureManagedFreeStorageSpaceInBytes: Number(CleanedString(managedDevices[i].freeStorageSpaceInBytes)),
            // dates
            azureManagedEnrolledDateTime: CleanedDate(managedDevices[i].enrolledDateTime),
            azureManagedLastSyncDateTime: CleanedDate(managedDevices[i].lastSyncDateTime),
            azureManagedEASActivationDateTime: CleanedDate(managedDevices[i].easActivationDateTime),
            azureManagedExchangeLastSuccessfulSyncDateTime: CleanedDate(managedDevices[i].exchangeLastSuccessfulSyncDateTime),
            azureManagedComplianceGracePeriodExpirationDateTime: CleanedDate(managedDevices[i].complianceGracePeriodExpirationDateTime),
            azureManagedManagementCertificateExpirationDateTime: CleanedDate(managedDevices[i].managementCertificateExpirationDateTime),
            // boolean
            azureManagedIsEASActivated: managedDevices[i].easActivated ? managedDevices[i].easActivated : false,
            azureManagedIsAzureADRegistered: managedDevices[i].azureADRegistered ? managedDevices[i].azureADRegistered : false,
            azureManagedIsSupervised: managedDevices[i].isSupervised ? managedDevices[i].isSupervised : false,
            azureManagedIsEncrypted: managedDevices[i].isEncrypted ? managedDevices[i].isEncrypted : false
          }

          this.AzureManagedDevices.push(amd)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(managedDevices[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {
    this.le.logStack.push('persist')
    
    try {

      // AAD devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD device updates ..')
      for(let i=0; i<this.AzureActiveDirectoryDevices.length; i++) {
        try {

          const aadLastSeen = getMaxDateFromObject(this.AzureActiveDirectoryDevices[i], [
            'azureDeletedDateTime',
            'azureCreatedDateTime',
            'azureOnPremisesLastSyncDateTime',
            'azureRegistrationDateTime'
          ])

          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryDevices[i].deviceName, mssql.VarChar(255))], true)
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureActiveDirectoryDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceCategory", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceCategory))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceMetadata", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceMetadata))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceOwnership", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceOwnership))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeviceVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDomainName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDomainName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryEnrollmentProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryEnrollmentType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryExternalSourceName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureExternalSourceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryManagementType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManagementType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryManufacturer", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryMDMAppId", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureMDMAppId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryModel", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectorySourceType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureSourceType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryTrustType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureTrustType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOperatingSystem", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOperatingSystemVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureDeletedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryApproximateLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureApproximateLastSignInDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryComplianceExpirationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureComplianceExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureCreatedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOnPremisesLastSyncDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureOnPremisesLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryRegistrationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureRegistrationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryLastSeen", mssql.DateTime2, aadLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryOnPremisesSyncEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureOnPremisesSyncEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryAccountEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureAccountEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsCompliant", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsCompliant))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsManaged", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsManaged))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryIsRooted", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsRooted))
          await this.db.updateTable('Device', 'DeviceID', [ruDevice])

          
        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureActiveDirectoryDevices[i])
          throw(err);
        }
      }
      
      // AAD Users ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD user updates ..')
      for(let i=0; i<this.AzureActiveDirectoryUsers.length; i++) {
        try {

          // find (insert if missing) this User email address
          let UserID:number = 0
          let UpdateName:string|undefined = undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(this.AzureActiveDirectoryUsers[i].emailAddress) {
            UserID = await this.db.getID("User", [new ColumnValuePair("UserEmailAddress", this.AzureActiveDirectoryUsers[i].emailAddress, mssql.VarChar(255))], false)
            UpdateName = this.AzureActiveDirectoryUsers[i].emailAddress
          }  // otherwise, use the Id; if this doesnt exist, insert it.
          if(UserID===0) {
            UserID = await this.db.getID("User", [new ColumnValuePair("AzureActiveDirectoryId", this.AzureActiveDirectoryUsers[i].id, mssql.VarChar(255))], true)
            UpdateName = this.AzureActiveDirectoryUsers[i].id
          }

          // update the User table
          let ruUser = new RowUpdate(UserID)
          ruUser.updateName = UpdateName ? UpdateName : 'unknown user'
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserEmailAddress", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].emailAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserPrincipalName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userPrincipalName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryId", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].id))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryBusinessPhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].businessPhone))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDisplayName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].displayName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryGivenName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].givenName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryJobTitle", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].jobTitle))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryMobilePhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].mobilePhone))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOfficeLocation", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].officeLocation))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectorySurname", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].surname))
          //ruUser.ColumnUpdates.push(new ColumnUpdate("AzureActiveDirectoryAssignedPlans", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].assignedPlans))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCity", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].city))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCountry", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].country))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCreationType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].creationType))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDepartment", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].department))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserHireDate", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].UserHireDate))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserId", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].UserId))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserOrgData", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].UserOrgData))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].UserType))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesDistinguishedName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDistinguishedName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesDomainName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDomainName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesSamAccountName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesSamAccountName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryOnPremisesUserPrincipalName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesUserPrincipalName))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryPasswordPolicies", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].passwordPolicies))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryPostalCode", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].postalCode))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryState", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].state))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryStreetAddress", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].streetAddress))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryUserType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userType))
          // bit
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryAccountEnabled", mssql.Bit, this.AzureActiveDirectoryUsers[i].accountEnabled))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserObservedByAzureActiveDirectory", mssql.Bit, true))
          // datetime
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].createdDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].deletedDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastPasswordChangeDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].lastPasswordChangeDateTime))
          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].lastSignInDateTime))

          const aadLastSeen = getMaxDateFromObject(this.AzureActiveDirectoryUsers[i], [
            'createdDateTime',
            'lastPasswordChangeDateTime',
            'lastSignInDateTime'
          ])

          ruUser.ColumnUpdates.push(new ColumnUpdate("UserAzureActiveDirectoryLastSeen", mssql.DateTime2, aadLastSeen))

          await this.db.updateTable('User', 'UserID', [ruUser])

          // update licenses

          //console.debug(this.AzureActiveDirectoryUsers[i].services);

          let ruLicenses:RowUpdate[] = []
          let ruUserLicenses:RowUpdate[] = []
          for(let j=0; j<this.AzureActiveDirectoryUsers[i].services.length; j++) {
            
            //console.debug(this.AzureActiveDirectoryUsers[i].services[j])
            
            const LicenseID = await this.db.getID("License", [new ColumnValuePair("LicensePlanID", this.AzureActiveDirectoryUsers[i].services[j].servicePlanId, mssql.VarChar(255))], true)
            let ruLicense:RowUpdate = new RowUpdate(LicenseID)
            ruLicense.ColumnUpdates.push(new ColumnUpdate("LicenseDescription", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].services[j].serviceName))
            ruLicenses.push(ruLicense)
            
            const UserLicenseID = await this.db.getID("UserLicense", [
              new ColumnValuePair("UserID", UserID, mssql.Int),
              new ColumnValuePair("LicenseID", LicenseID, mssql.Int)
            ], true)
            let ruUserLicense:RowUpdate = new RowUpdate(UserLicenseID)
            ruUserLicense.ColumnUpdates.push(new ColumnUpdate("AssignmentDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].services[j].assignedDateTime))
            ruUserLicense.ColumnUpdates.push(new ColumnUpdate("AssignmentStatus", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].services[j].serviceStatus))
            ruUserLicenses.push(ruUserLicense)
          }

          await this.db.updateTable('License', 'LicenseID', ruLicenses)
          await this.db.updateTable('UserLicense', 'UserLicenseID', ruUserLicenses)

        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureActiveDirectoryUsers[i])
          throw(err);
        }

      }

      // AAD managed devices ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD managed device updates ..')
      for(let i=0; i<this.AzureManagedDevices.length; i++) {
        try {

          const mdmLastSeen = getMaxDateFromObject(this.AzureManagedDevices[i], [
            'azureManagedEnrolledDateTime',
            'azureManagedLastSyncDateTime',
            'azureManagedEASActivationDateTime',
            'azureManagedExchangeLastSuccessfulSyncDateTime',
          ])

          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureManagedDevices[i].deviceName, mssql.VarChar(255))], true)
    
          // update the DeviceActiveDirectory table values ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureManagedDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserId", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceOwnerType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceOwnerType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMComplianceState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedComplianceState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMJailBroken", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedJailBroken))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManagementAgent", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManagementAgent))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMOperatingSystem", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMOperatingSystemVersion", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEASDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEASDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceEnrollmentType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMActivationLockBypassCode", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedActivationLockBypassCode))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEmailAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEmailAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMAzureADDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAzureADDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceRegistrationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceRegistrationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceCategoryDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceCategoryDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeAccessState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeAccessStateReason", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessStateReason))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRemoteAssistanceSessionUrl", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceSessionUrl))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRemoteAssistanceErrorDetails", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceErrorDetails))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserPrincipalName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserPrincipalName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMModel", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManufacturer", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIMEI", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedIMEI))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMSerialNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSerialNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPhoneNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPhoneNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMAndroidSecurityPatchLevel", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAndroidSecurityPatchLevel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMConfigurationManagerClientEnabledFeatures", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedConfigurationManagerClientEnabledFeatures))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMWiFiMACAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedWiFiMACAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceHealthAttestationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceHealthAttestationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMSubscriberCarrier", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSubscriberCarrier))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMMEID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedMEID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPartnerReportedThreatState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPartnerReportedThreatState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRequireUserEnrollmentApproval", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRequireUserEnrollmentApproval))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMICCID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedICCID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUDID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUDID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMNotes", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedNotes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEthernetMacAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEthernetMacAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPhysicalMemoryInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedPhysicalMemoryInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMTotalStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedTotalStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMFreeStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedFreeStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEnrolledDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEnrolledDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMLastSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEASActivationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEASActivationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeLastSuccessfulSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedExchangeLastSuccessfulSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMComplianceGracePeriodExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedComplianceGracePeriodExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManagementCertificateExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedManagementCertificateExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMLastSeen", mssql.DateTime2, mdmLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsEASActivated", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEASActivated))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsAzureADRegistered", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsAzureADRegistered))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsSupervised", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsSupervised))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsEncrypted", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEncrypted))
          await this.db.updateTable('Device', 'DeviceID', [ruDevice])
        
        }  catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureManagedDevices[i])
          throw(err);
        }

      }
    
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      this.le.logStack.pop()
    }

  }

  
  private async getData(apiEndpoint:string, selectFields:string[]=[]):Promise<any> {
    this.le.logStack.push('getData')
    var output:any = []
   
    try {

      const gc = this.graphClient.api(apiEndpoint)
      if(selectFields.length>0) {
        gc.select(selectFields.join(","))
      }

      const callback:PageIteratorCallback = (item:any) => {
        //console.debug(item)
        output.push(item)
        return true;
      }

      const response:PageCollection = await gc.get()

      const pageIterator = new PageIterator(this.graphClient, response, callback)

      await pageIterator.iterate();
      
    } catch (err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }

}