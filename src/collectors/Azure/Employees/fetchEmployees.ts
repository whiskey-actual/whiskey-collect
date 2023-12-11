import { LogEngine } from "whiskey-log"
import { CleanedString, CleanedDate } from "whiskey-util"
import { Client } from "@microsoft/microsoft-graph-client"
import { callAPI } from "../callAPI"

import { AzureActiveDirectoryEmployee } from "./AzureActiveDirectoryEmployee"
import { EmployeeService } from "./EmployeeService"

export async function fetchEmployees(le:LogEngine, graphClient:Client):Promise<AzureActiveDirectoryEmployee[]> {
    le.logStack.push("fetchEmployees")

    let output:AzureActiveDirectoryEmployee[] = []
    try {

      le.AddLogEntry(LogEngine.EntryType.Info, `fetching employees ..`)

      const fieldsToFetch = [
        'userPrincipalName',
        'azureID',
        'businessPhones',
        'displayName',
        'givenName',
        'jobTitle',
        'mail',
        'mobilePhone',
        'officeLocation',
        'surname',
        'accountEnabled',
        'assignedLicenses',
        'assignedPlans',
        'city',
        'country',
        'createdDateTime',
        'creationType',
        'deletedDateTime',
        'department',
        'EmployeeHireDate',
        //'UserLeaveDateTime',
        'EmployeeId',
        'EmployeeOrgData',
        'EmployeeType',
        //'externalUserState',
        //'hireDate',
        'id',
        'jobTitle',
        'lastPasswordChangeDateTime',
        // 'licenseAssignmentStates',
        // 'mailNickname',
        'onPremisesDistinguishedName',
        'onPremisesDomainName',
        'onPremisesSamAccountName',
        'onPremisesUserPrincipalName',
        'passwordPolicies',
        //'preferredName',
        'postalCode',
        'state',
        'streetAddress',
        'userType',
        'signInActivity'
      ]


      const users = await callAPI(le, graphClient, '/users', fieldsToFetch)

      le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<users.length; i++) {
        try {

          //console.debug(users[i].signInActivity)

          // assignedLicenses
          // assignedPlans: CleanedString(users[i].assignedPlans),

          //console.debug(users[i].assignedPlans)

          let employeeServices:EmployeeService[] = []
          for(let j=0; j<users[i].assignedPlans.length; j++) {
            try {
              const es:EmployeeService = {
                serviceName: CleanedString(users[i].assignedPlans[j].service),
                servicePlanId: CleanedString(users[i].assignedPlans[j].servicePlanId),
                assignedDateTime: CleanedDate(users[i].assignedPlans[j].assignedDateTime),
                serviceStatus: CleanedString(users[i].assignedPlans[j].capabilityStatus)
              }
              employeeServices.push(es);
            } catch(err) {
              console.debug(users[i].assignedPlans)
              console.debug(users[i].assignedPlans[j])
              throw err;
            }
            
          }

          const aade:AzureActiveDirectoryEmployee = {
            emailAddress: users[i].mail ? users[i].mail.toString().trim() : users[i].userPrincipalName ? users[i].userPrincipalName.toString().trim() : users[i].onPremisesUserPrincipalName ? users[i].onPremisesUserPrincipalName.toString().trim() : undefined,
            mail: CleanedString(users[i].mail),
            userPrincipalName: CleanedString(users[i].userPrincipalName),
            id: users[i].id.toString().trim(),
            businessPhone: users[i].businessPhones.length ? users[i].businessPhones[0].toString().trim() : undefined, // need to parse this
            displayName: CleanedString(users[i].displayName),
            givenName: CleanedString(users[i].givenName),
            jobTitle: CleanedString(users[i].jobTitle),
            mobilePhone: CleanedString(users[i].mobilePhone),
            officeLocation: CleanedString(users[i].officeLocation),
            surname: CleanedString(users[i].surname),
            assignedPlans: CleanedString(users[i].assignedPlans),
            city: CleanedString(users[i].city),
            country: CleanedString(users[i].country),
            creationType: CleanedString(users[i].creationType),
            department: CleanedString(users[i].department),
            EmployeeHireDate: CleanedString(users[i].EmployeeHireDate),
            EmployeeId: CleanedString(users[i].EmployeeId),
            EmployeeOrgData: CleanedString(users[i].EmployeeOrgData),
            EmployeeType: CleanedString(users[i].EmployeeType),
            onPremisesDistinguishedName: CleanedString(users[i].onPremisesDistinguishedName),
            onPremisesDomainName: CleanedString(users[i].onPremisesDomainName),
            onPremisesSamAccountName: CleanedString(users[i].onPremisesSamAccountName),
            onPremisesUserPrincipalName: CleanedString(users[i].onPremisesUserPrincipalName),
            passwordPolicies: CleanedString(users[i].passwordPolicies),
            postalCode: CleanedString(users[i].postalCode),
            state: CleanedString(users[i].state),
            streetAddress: CleanedString(users[i].streetAddress),
            userType: CleanedString(users[i].userType),
            accountEnabled: users[i].accountEnabled, // should bit boolean
            createdDateTime: CleanedDate(users[i].createdDateTime),
            deletedDateTime: CleanedDate(users[i].deletedDateTime),
            lastPasswordChangeDateTime: CleanedDate(users[i].lastPasswordChangeDateTime),
            services: employeeServices,
            lastSignInDateTime: users[i].signInActivity ? CleanedDate(users[i].signInActivity.lastSignInDateTime) : undefined
          }

          output.push(aade)
        } catch (err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureActiveDirectoryEmployee[]>((resolve) => {resolve(output)})

  }