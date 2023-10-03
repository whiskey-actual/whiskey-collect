import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from "./DBEngine"


export class OperatingSystemObject {
    public Description:string|undefined = undefined
    public VersionMajor:number|undefined = undefined
    public VersionMinor:number|undefined = undefined
    public Build:number|undefined = undefined
    public Revision:number|undefined = undefined
}

export class OperatingSystem {

    constructor(le:LogEngine, db:DBEngine, operatingSystemObject:OperatingSystemObject) {
        this._le=le
        this._db=db
        this._os=operatingSystemObject
      }
      private _le:LogEngine
      private _db:DBEngine
      private _os:OperatingSystemObject

    public async persist(deviceId:number):Promise<void> {

        try {

            // if there is no description, don't bother storing it.
            if(this._os.Description) {
                const OperatingSystemID:number = await this._db.getID("OperatingSystem", [
                    new ColumnValuePair('OperatingSystemDescription', this._os.Description, mssql.VarChar(255)),
                    new ColumnValuePair('OperatingSystemVersionMajor', this._os.VersionMajor, mssql.Int),
                    new ColumnValuePair('OperatingSystemVersionMinor', this._os.VersionMinor, mssql.Int),
                    new ColumnValuePair('OperatingSystemBuild', this._os.Build, mssql.Int)
                ], true)

            }

        }catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'done')
            this._le.logStack.pop()
        }


        
    }

    public static parseActiveDirectory(OS:string|undefined, OSVersion:string|undefined):OperatingSystemObject {

        let os:OperatingSystemObject = new OperatingSystemObject

        try {

            os.Description = OS ? OS : ''

            if(OSVersion) {
                //console.debug(`OSVersion: ${OSVersion}`)
                const reBuildNumber = new RegExp('(?<=\\()\\d+(?=\\))')
                const remaBuildNumber:RegExpMatchArray|null = reBuildNumber.exec(OSVersion)
                //console.debug(`remaBuildNumber: ${remaBuildNumber}`)
                os.Build = remaBuildNumber ? Number(remaBuildNumber[0]) : undefined

                const reVersions = new RegExp('^\\d+\\.\\d+(?=\\s)')
                const remaVersions:RegExpMatchArray|null = reVersions.exec(OSVersion)
                //console.debug(`remaVersions: ${remaVersions}`)
                os.VersionMajor = remaVersions ? Number(remaVersions[0].split('.')[0]) : undefined
                os.VersionMinor = remaVersions ? Number(remaVersions[0].split('.')[1]) : undefined
            }

        } catch(err) {
            throw(`OperatingSystem:parseActiveDirectory:${err}`);
        }

        return os
    }

}