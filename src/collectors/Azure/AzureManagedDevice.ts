
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