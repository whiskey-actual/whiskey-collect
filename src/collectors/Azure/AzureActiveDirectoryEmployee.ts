import { EmployeeService } from "./EmployeeService"

export class AzureActiveDirectoryEmployee {

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
    public readonly EmployeeHireDate:string|undefined=undefined
    //public readonly UserLeaveDateTime:string|undefined=undefined
    public readonly EmployeeId:string|undefined=undefined
    public readonly EmployeeOrgData:string|undefined=undefined
    public readonly EmployeeType:string|undefined=undefined
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
  
    public readonly services:EmployeeService[] = []
  
  }