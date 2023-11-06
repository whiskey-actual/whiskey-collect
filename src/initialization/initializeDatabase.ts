// imports
import { LogEngine } from 'whiskey-log';
import { DBEngine } from 'whiskey-sql';
import mssql from 'mssql'
import { ColumnDefinition } from 'whiskey-sql/lib/components/columnDefinition';

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

      // source table
      let columns:ColumnDefinition[] = []
      columns.push(new ColumnDefinition('URI', mssql.VarChar(255), true, true))
      columns.push(new ColumnDefinition('Credential', mssql.VarChar(255), true, true))
      columns.push(new ColumnDefinition('Authentication', mssql.VarChar(255), true, true))
      await this.db.createTable('Source', columns)
      
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