export class ActiveDirectoryEmployee {
  public readonly employeeDN:string=''
  public readonly emailAddress:string|undefined=undefined
  public readonly employeeCN:string|undefined=undefined
  public readonly employeeSN:string|undefined=undefined
  public readonly employeeCountry:string|undefined=undefined
  public readonly employeeCity:string|undefined=undefined
  public readonly employeeState:string|undefined=undefined
  public readonly employeeTitle:string|undefined=undefined
  public readonly employeePhysicalDeliveryOfficeName:string|undefined=undefined
  public readonly employeeTelephoneNumber:string|undefined=undefined
  public readonly employeeGivenName:string|undefined=undefined
  public readonly employeeDisplayName:string|undefined=undefined
  public readonly employeeDepartment:string|undefined=undefined
  public readonly employeeStreetAddress:string|undefined=undefined
  public readonly employeeName:string|undefined=undefined
  public readonly employeeUserID:string|undefined=undefined
  public readonly employeeLogonCount:number|undefined=undefined
  public readonly employeeSAMAccountName:string|undefined=undefined
  public readonly employeeUserPrincipalName:string|undefined=undefined
  public readonly employeeMail:string|undefined=undefined
  public readonly employeeManager?:string
  // dates
  public readonly employeeCreatedDate:Date|undefined=undefined
  public readonly employeeChangedDate:Date|undefined=undefined
  public readonly employeeBadPasswordTime:Date|undefined=undefined
  public readonly employeeLastLogon:Date|undefined=undefined
  public readonly employeeLastLogonTimestamp:Date|undefined=undefined

}
