import { ColumnDefinition } from 'whiskey-sql/lib/create/columnDefinition'

export function UserTable():ColumnDefinition[] {
    let Columns:ColumnDefinition[] = []
    Columns.push(new ColumnDefinition('EmailAddress', "VARCHAR", true, true))
    Columns.push(new ColumnDefinition('LastObserved', "DATETIME2"))
    Columns.push(new ColumnDefinition('IsActive', "BIT", false, true, undefined, false))

    Columns.push(new ColumnDefinition('ObservedByActiveDirectory', "BIT", false, true, undefined, false))
    Columns.push(new ColumnDefinition('ObservedByAzureActiveDirectory', "BIT", false, true, undefined, false))
    
    Columns.push(new ColumnDefinition('ActiveDirectoryDN', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryCN', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectorySN', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryCountry', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryCity', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryState', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryTitle', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryOffice', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryTelephoneNumber', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryGivenName', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryDisplayName', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryDepartment', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryStreetAddress', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryUserName', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryEmployeeID', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectorySAMAccountName', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryPrincipalName', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryUserMail', "VARCHAR"))
    Columns.push(new ColumnDefinition('ActiveDirectoryLogonCount', "INT"))
    Columns.push(new ColumnDefinition('ActiveDirectoryCreatedDate', "DATETIME2"))
    Columns.push(new ColumnDefinition('ActiveDirectoryChangedDate', "DATETIME2"))
    Columns.push(new ColumnDefinition('ActiveDirectoryBadPasswordTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('ActiveDirectoryLastLogon', "DATETIME2"))
    Columns.push(new ColumnDefinition('ActiveDirectoryLastLogonTimestamp', "DATETIME2"))
    Columns.push(new ColumnDefinition('ActiveDirectoryLastSeen', "DATETIME2"))
    
    Columns.push(new ColumnDefinition('AzureActiveDirectoryAccountEnabled', "BIT", true, true))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryUserPrincipalName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryId', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryBusinessPhone', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryDisplayName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryGivenName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryJobTitle', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryMobilePhone', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryOfficeLocation', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectorySurname', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryAssignedPlans', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryCity', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryCountry', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryCreationType', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryDepartment', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryEmployeeHireDate', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryEmployeeId', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryEmployeeOrgData', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryEmployeeType', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryOnPremisesDistinguishedName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryOnPremisesDomainName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryOnPremisesSamAccountName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryOnPremisesUserPrincipalName', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryPasswordPolicies', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryPostalCode', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryState', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryStreetAddress', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryUserType', "VARCHAR"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryCreatedDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryDeletedDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryLastPasswordChangeDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryLastSignInDateTime', "DATETIME2"))
    Columns.push(new ColumnDefinition('AzureActiveDirectoryLastSeen', "DATETIME2"))
    return Columns
}