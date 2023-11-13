export class ActiveDirectoryDevice {
  // mandatory
  public readonly deviceName:string=''
  public readonly deviceDN:string=''
  // strings
  public readonly activeDirectoryOperatingSystem:string|undefined=undefined
  public readonly activeDirectoryOperatingSystemVersion:string|undefined=undefined
  public readonly activeDirectoryDNSHostName:string|undefined=undefined
  // numbers
  public readonly activeDirectoryLogonCount:number=0
  // dates
  public readonly activeDirectoryWhenCreated:Date|undefined=undefined
  public readonly activeDirectoryWhenChanged:Date|undefined=undefined
  public readonly activeDirectoryLastLogon:Date|undefined=undefined
  public readonly activeDirectoryPwdLastSet:Date|undefined=undefined
  public readonly activeDirectoryLastLogonTimestamp:Date|undefined=undefined
}
