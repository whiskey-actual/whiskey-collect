import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "./DBEngine"


export class OperatingSystem {
    public Description:string|undefined = undefined
    public VersionMajor:number|undefined = undefined
    public VersionMinor:number|undefined = undefined
    public Build:number|undefined = undefined
    public Revision:number|undefined = undefined
}

export class OperatingSystemEngine {

    constructor(le:LogEngine, db:DBEngine) {
        this._le=le
        this._db=db
      }
      private _le:LogEngine
      private _db:DBEngine

    public async persist(deviceId:number, os:OperatingSystem):Promise<void> {
        this._le.logStack.push("persist")

        try {

            // if there is no description, don't bother storing it.
            if(os.Description) {
                const OperatingSystemID:number = await this._db.getID("OperatingSystem", [
                    new ColumnValuePair('OperatingSystemDescription', os.Description, mssql.VarChar(255)),
                    new ColumnValuePair('OperatingSystemVersionMajor', os.VersionMajor, mssql.Int),
                    new ColumnValuePair('OperatingSystemVersionMinor', os.VersionMinor, mssql.Int),
                    new ColumnValuePair('OperatingSystemBuild', os.Build, mssql.Int)
                ], true)

            }

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }
        
    }

    public parseActiveDirectory(OS:string|undefined, OSVersion:string|undefined):OperatingSystem {
        this._le.logStack.push("parseActiveDirectory")

        let os:OperatingSystem = new OperatingSystem

        try {

            os.Description = OS ? OS : ''

            if(OSVersion) {
                console.debug(`OSVersion: ${OSVersion}`)
                const reBuildNumber = new RegExp('(?<=\\()\\d+(?=\\))')
                const remaBuildNumber:RegExpMatchArray|null = reBuildNumber.exec(OSVersion)
                console.debug(`remaBuildNumber: ${remaBuildNumber}`)
                os.Build = remaBuildNumber ? Number(remaBuildNumber[0]) : undefined

                const reVersions = new RegExp('^\\d+\\.\\d+(?=\\s)')
                const remaVersions:RegExpMatchArray|null = reVersions.exec(OSVersion)
                os.VersionMajor = remaVersions ? Number(remaVersions[0].split('.')[0]) : undefined
                os.VersionMinor = remaVersions ? Number(remaVersions[0].split('.')[1]) : undefined
                console.debug(`OSVersion: ${OSVersion} | Build: ${os.Build} | VersionMajor:${os.VersionMajor} | VersionMinor:${os.VersionMinor}`)
            }

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }

        return os
    }

}