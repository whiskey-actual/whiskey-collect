export class CrowdstrikeDevice {
    // mandatory
    public readonly observedByCrowdstrike:boolean = true
    public readonly deviceName: string=''
    public readonly crowdstrikeDeviceId:string=''
    // strings
    public readonly crowdstrikeCID: string|undefined=undefined
    public readonly crowdstrikeAgentVersion: string|undefined=undefined
    public readonly crowdstrikeBIOSManufacturer: string|undefined=undefined
    public readonly crowdstrikeBIOSVersion: string|undefined=undefined
    public readonly crowdstrikeExternalIP: string|undefined=undefined
    public readonly crowdstrikeMACAddress: string|undefined=undefined
    public readonly crowdstrikeLocalIP: string|undefined=undefined
    public readonly crowdstrikeMachineDomain: string|undefined=undefined
    public readonly crowdstrikeMajorVersion: string|undefined=undefined
    public readonly crowdstrikeMinorVersion: string|undefined=undefined
    public readonly crowdstrikeOSBuild: string|undefined=undefined
    public readonly crowdstrikeOSVersion: string|undefined=undefined
    public readonly crowdstrikePlatformName: string|undefined=undefined
    public readonly crowdstrikeReducedFunctionalityMode: string|undefined=undefined
    public readonly crowdstrikeProductTypeDesc: string|undefined=undefined
    public readonly crowdstrikeProvisionStatus: string|undefined=undefined
    public readonly crowdstrikeSerialNumber: string|undefined=undefined
    public readonly crowdstrikeServicePackMajor: string|undefined=undefined
    public readonly crowdstrikeServicePackMinor: string|undefined=undefined
    public readonly crowdstrikeStatus: string|undefined=undefined
    public readonly crowdstrikeSystemManufacturer: string|undefined=undefined
    public readonly crowdstrikeSystemProductName: string|undefined=undefined
    public readonly crowdstrikeKernelVersion: string|undefined=undefined
    // dates
    public readonly crowdstrikeFirstSeenDateTime: Date|undefined=undefined
    public readonly crowdstrikeLastSeenDateTime: Date|undefined=undefined
    public readonly crowdstrikeModifiedDateTime: Date|undefined=undefined
  }