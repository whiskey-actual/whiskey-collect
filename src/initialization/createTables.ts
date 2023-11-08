import { LogEngine } from "whiskey-log"
import { SourceTable } from './tables/SourceTable';
import { UserTable } from './tables/UserTable';
import { LicenseTable } from './tables/LicenseTable';
import { UserLicenseTable } from './tables/UserLicenseTable';
import { DeviceTable } from './tables/DeviceTable';
import { DBEngine } from "whiskey-sql";

export async function createTables(le:LogEngine, db:DBEngine):Promise<void> {
    le.logStack.push('createTables')

    try {
      le.AddLogEntry(LogEngine.EntryType.Info, '.. building tables ..')
      await db.createTable('Source', SourceTable())
      await db.createTable('User', UserTable())
      await db.createTable('License', LicenseTable())
      await db.createTable('UserLicense', UserLicenseTable())
      await db.createTable('Device', DeviceTable())
    } catch (ex) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }