// imports
import { LogEngine } from 'whiskey-log';
import { Client } from 'ldapts'
import { CleanedString, ldapTimestampToJS } from 'whiskey-util';

export class ActiveDirectoryCollector
{

  constructor(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500) {
    this.bindDN=bindDN
    this.pw=pw
    this.searchDN=searchDN
    this.isPaged=isPaged
    this.sizeLimit=sizeLimit
    this.ldapClient = new Client({url: ldapURL, tlsOptions:{rejectUnauthorized: false}});
  }
  private le:LogEngine=new LogEngine(["ActiveDirectory"])
  private bindDN:string
  private pw:string
  private searchDN:string
  private isPaged:boolean
  private sizeLimit:number
  private ldapClient:Client

  public async getDevices():Promise<ActiveDirectoryDevice[]> {
    this.le.logStack.push("getDevices")
    let output:ActiveDirectoryDevice[] = []
    try {
  
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'binding LDAP ..')
        await this.ldapClient.bind(this.bindDN, this.pw);
  
          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '&(objectClass=computer)', paged:this.isPaged, sizeLimit:this.sizeLimit});
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} devices, processing ..`)
          for(let i=0; i<searchEntries.length; i++) {
            try {
              const add:ActiveDirectoryDevice = {
                deviceDN: searchEntries[i].dn.toString().trim(),
                deviceName: searchEntries[i].cn.toString().trim(),
                activeDirectoryOperatingSystem: CleanedString(searchEntries[i].operatingSystem),
                activeDirectoryOperatingSystemVersion: CleanedString(searchEntries[i].operatingSystemVersion),
                activeDirectoryDNSHostName: CleanedString(searchEntries[i].dNSHostName),
                activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                activeDirectoryWhenCreated: ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
                activeDirectoryWhenChanged: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                activeDirectoryLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
                activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
              }
              output.push(add)
  
            } catch (err) {
              this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      await this.ldapClient.unbind();
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})
  }

  public async getEmployes():Promise<ActiveDirectoryEmployee[]> {
    this.le.logStack.push("fetchEmployeesFromActiveDirectory")
    let output:ActiveDirectoryEmployee[] = []
    try {

          this.le.AddLogEntry(LogEngine.EntryType.Info, 'binding LDAP ..')
          await this.ldapClient.bind(this.bindDN, this.pw);

          const { searchEntries } = await this.ldapClient.search(this.searchDN,  {filter: '(&(objectClass=user)(&(!(objectClass=computer))))', paged:this.isPaged, sizeLimit:this.sizeLimit},);
          this.le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} employees, processing ..`)
          for(let i=0; i<searchEntries.length; i++) {

            //console.debug(searchEntries[i])

            try {
              const ade:ActiveDirectoryEmployee = {
                emailAddress: searchEntries[i].mail ? searchEntries[i].mail.toString().trim() : searchEntries[i].EmployeePrincipalName ? searchEntries[i].EmployeePrincipalName.toString().trim() : undefined,
                employeeDN: searchEntries[i].dn.toString().trim(),
                employeeCN: CleanedString(searchEntries[i].cn),
                employeeSN: CleanedString(searchEntries[i].sn),
                employeeCountry: CleanedString(searchEntries[i].c),
                employeeCity: CleanedString(searchEntries[i].l),
                employeeState: CleanedString(searchEntries[i].st),
                employeeTitle: CleanedString(searchEntries[i].title),
                employeePhysicalDeliveryOfficeName: CleanedString(searchEntries[i].physicalDeliveryOfficeName),
                employeeTelephoneNumber: CleanedString(searchEntries[i].telephoneNumber),
                employeeGivenName: CleanedString(searchEntries[i].givenName),
                employeeDisplayName: CleanedString(searchEntries[i].displayName),
                employeeDepartment: CleanedString(searchEntries[i].department),
                employeeStreetAddress: CleanedString(searchEntries[i].streetAddress),
                employeeName: CleanedString(searchEntries[i].name),
                employeeUserID: CleanedString(searchEntries[i].userID),
                employeeLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                employeeSAMAccountName: CleanedString(searchEntries[i].sAMAccountName),
                employeeUserPrincipalName: CleanedString(searchEntries[i].userPrincipalName),
                employeeMail: CleanedString(searchEntries[i].mail),
                employeeManager: CleanedString(searchEntries[i].manager),
                employeeCreatedDate: searchEntries[i].whenCreated ? ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : undefined,
                employeeChangedDate: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                employeeBadPasswordTime: searchEntries[i].badPasswordTime ? ldapTimestampToJS(searchEntries[i].badPasswordTime.toString()) : undefined,
                employeeLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                employeeLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined,
              }
            output.push(ade)
            } catch (err) {
              this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      await this.ldapClient.unbind();
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    return new Promise<ActiveDirectoryEmployee[]>((resolve) => {resolve(output)})
  }

}
  





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
  