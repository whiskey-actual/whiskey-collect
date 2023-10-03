import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { ColumnUpdate, DBEngine, RowUpdate, TableUpdate } from "./DBEngine"


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
                const OperatingSystemID:number = await this._db.getID("OperatingSystem", this._os.Description, 'OperatingSystemDescription')

                let tu = new TableUpdate("OperatingSystem", "OperatingSystemID")
                let ru:RowUpdate = new RowUpdate(OperatingSystemID)
                ru.updateName = this._os.Description
                ru.ColumnUpdates.push(new ColumnUpdate("OperatingSystemVersionMajor", mssql.Int, this._os.VersionMajor))
                ru.ColumnUpdates.push(new ColumnUpdate("OperatingSystemVersionMinor", mssql.Int, this._os.VersionMinor))
                ru.ColumnUpdates.push(new ColumnUpdate("OperatingSystemBuild", mssql.Int, this._os.Build))
                ru.ColumnUpdates.push(new ColumnUpdate("OperatingSystemRevision", mssql.Int, this._os.Revision))
                tu.RowUpdates.push(ru)
                this._db.updateTable(tu, true)
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
                console.debug(`OSVersion: ${OSVersion}`)
                const reBuildNumber = new RegExp('(?<=\()\d+(?=\))')
                const remaBuildNumber:RegExpMatchArray|null = OSVersion.match(reBuildNumber)
                console.debug(`remaBuildNumber: ${remaBuildNumber}`)
                os.Build = remaBuildNumber ? Number(remaBuildNumber[0]) : undefined

                const reVersions = new RegExp('^\d+\.\d+(?=\s)')
                const remaVersions:RegExpMatchArray|null = OSVersion.match(reVersions)
                console.debug(`remaVersions: ${remaVersions}`)
                os.VersionMajor = remaVersions ? Number(remaVersions[0].split('.')[0]) : undefined
                os.VersionMinor = remaVersions ? Number(remaVersions[0].split('.')[1]) : undefined
            }

        } catch(err) {
            throw(`OperatingSystem:parseActiveDirectory:${err}`);
        }

        return os
    }

}