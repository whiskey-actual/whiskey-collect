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