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