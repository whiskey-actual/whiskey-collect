// imports
import { LogEngine } from 'whiskey-log';
import { DBEngine } from 'whiskey-sql';

// table definitions
import { SourceTable } from './tables/SourceTable';
import { UserTable } from './tables/UserTable';
import { LicenseTable } from './tables/LicenseTable';
import { UserLicenseTable } from './tables/UserLicenseTable';
import { DeviceTable } from './tables/DeviceTable';

export class initializeDatabase
{

  constructor(le:LogEngine, db:DBEngine) {
    this.le=le
    this.db=db
  }
  private le:LogEngine
  private db:DBEngine

  public async build():Promise<void> {
    this.le.logStack.push('build')

    try {
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. building tables ..')
      await this.db.createTable('Source', SourceTable())
      await this.db.createTable('User', UserTable())
      await this.db.createTable('License', LicenseTable())
      await this.db.createTable('UserLicense', UserLicenseTable())
      await this.db.createTable('Device', DeviceTable())
    } catch (ex) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

}