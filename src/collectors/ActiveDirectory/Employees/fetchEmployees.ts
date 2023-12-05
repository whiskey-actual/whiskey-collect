import { Client } from "ldapts";
import { LogEngine } from "whiskey-log";
import { CleanedString } from "whiskey-util";
import { ldapTimestampToJS } from "whiskey-util";
import { ActiveDirectoryEmployee } from "./ActiveDirectoryEmployee";

export async function fetchEmployees(le:LogEngine, ldapClient:Client, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryEmployee[]> {
    le.logStack.push("fetchEmployee")
    let output:ActiveDirectoryEmployee[] = []
    try {
          const { searchEntries } = await ldapClient.search(searchDN,  {filter: '(&(objectClass=user)(&(!(objectClass=computer))))', paged:isPaged, sizeLimit:sizeLimit},);
          le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} employees, processing ..`)
          for(let i=0; i<searchEntries.length; i++) {

            console.debug(searchEntries[i])

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
                employeeCreatedDate: searchEntries[i].whenCreated ? ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : undefined,
                employeeChangedDate: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                employeeBadPasswordTime: searchEntries[i].badPasswordTime ? ldapTimestampToJS(searchEntries[i].badPasswordTime.toString()) : undefined,
                employeeLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                employeeLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined,
              }
            output.push(ade)
            } catch (err) {
              le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.logStack.pop()
    }
    return new Promise<ActiveDirectoryEmployee[]>((resolve) => {resolve(output)})
  }