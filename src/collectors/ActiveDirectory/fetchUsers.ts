import { Client } from "ldapts";
import { LogEngine } from "whiskey-log";
import { CleanedString } from "whiskey-util";
import { ldapTimestampToJS } from "whiskey-util";
import { ActiveDirectoryUser } from "./ActiveDirectoryUser";

export async function fetchUsers(le:LogEngine, ldapClient:Client, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryUser[]> {
    le.logStack.push("fetchUsers")

    let output:ActiveDirectoryUser[] = []
    try {
          le.AddLogEntry(LogEngine.EntryType.Info, '.. querying users ..')
          const { searchEntries } = await ldapClient.search(searchDN,  {filter: '(&(objectClass=user)(&(!(objectClass=computer))))', paged:isPaged, sizeLimit:sizeLimit},);
          le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} users .. `)
          
          le.AddLogEntry(LogEngine.EntryType.Info, `.. creating objects ..`)
          for(let i=0; i<searchEntries.length; i++) {
            try {
              const adu:ActiveDirectoryUser = {
                emailAddress: searchEntries[i].mail ? searchEntries[i].mail.toString().trim() : searchEntries[i].userPrincipalName ? searchEntries[i].userPrincipalName.toString().trim() : undefined,
                userDN: searchEntries[i].dn.toString().trim(),
                userCN: CleanedString(searchEntries[i].cn),
                userSN: CleanedString(searchEntries[i].sn),
                userCountry: CleanedString(searchEntries[i].c),
                userCity: CleanedString(searchEntries[i].l),
                userState: CleanedString(searchEntries[i].st),
                userTitle: CleanedString(searchEntries[i].title),
                userPhysicalDeliveryOfficeName: CleanedString(searchEntries[i].physicalDeliveryOfficeName),
                userTelephoneNumber: CleanedString(searchEntries[i].telephoneNumber),
                userGivenName: CleanedString(searchEntries[i].givenName),
                userDisplayName: CleanedString(searchEntries[i].displayName),
                userDepartment: CleanedString(searchEntries[i].department),
                userStreetAddress: CleanedString(searchEntries[i].streetAddress),
                userName: CleanedString(searchEntries[i].name),
                userEmployeeID: CleanedString(searchEntries[i].employeeID),
                userLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
                userSAMAccountName: CleanedString(searchEntries[i].sAMAccountName),
                userPrincipalName: CleanedString(searchEntries[i].userPrincipalName),
                userMail: CleanedString(searchEntries[i].mail),
                userCreatedDate: searchEntries[i].whenCreated ? ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : undefined,
                userChangedDate: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
                userBadPasswordTime: searchEntries[i].badPasswordTime ? ldapTimestampToJS(searchEntries[i].badPasswordTime.toString()) : undefined,
                userLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
                userLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined,
              }
            output.push(adu)
            } catch (err) {
              le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            }  
          }
          le.AddLogEntry(LogEngine.EntryType.Info, `.. ${output.length} objects created.`)
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.logStack.pop()
    }

    return new Promise<ActiveDirectoryUser[]>((resolve) => {resolve(output)})

  }