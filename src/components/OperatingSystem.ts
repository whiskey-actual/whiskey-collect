import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "./DBEngine"


export class OperatingSystem {
    public Description:string|undefined = undefined
    public Variant:string|undefined = undefined
    public Version:string|undefined = undefined
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

                const OperatingSystemVersionID:number = await this._db.getID("OperatingSystemVersion", [
                    new ColumnValuePair('OperatingSystemVersionDescription', os.Version, mssql.VarChar(255))
                ])

                const OperatingSystemVariantID:number = await this._db.getID("OperatingSystemVariant", [
                    new ColumnValuePair('OperatingSystemVariantDescription', os.Variant, mssql.VarChar(255)),
                ])

                const OperatingSystemID:number = await this._db.getID("OperatingSystem", [
                    new ColumnValuePair('OperatingSystemDescription', os.Description, mssql.VarChar(255)),
                ], true)

                const OperatingSystemXRefID:number = await this._db.getID('OperatingSystemXRef', [
                    new ColumnValuePair('OperatingSystemID', OperatingSystemID, mssql.Int),
                    new ColumnValuePair('OperatingSystemVariantID', OperatingSystemVariantID, mssql.Int),
                    new ColumnValuePair('OperatingSystemVersionID', OperatingSystemVersionID, mssql.Int)
                ])
            }

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }
        
    }

    public parseActiveDirectory(OperatingSystemDescription:string|undefined, OperatingSystemVersion:string|undefined):OperatingSystem {
        this._le.logStack.push("parseActiveDirectory")

        let os:OperatingSystem = new OperatingSystem

        try {

            if(OperatingSystemDescription) {

                const reOperatingSystem = new RegExp('(^Windows\s(Server\s)?\d+(?=\s))|macOS')
                const remaOperatingSystem:RegExpMatchArray|null = reOperatingSystem.exec(OperatingSystemDescription)

                console.debug(remaOperatingSystem)

                if(remaOperatingSystem) {
                    os.Description = remaOperatingSystem[0]
                    os.Variant = OperatingSystemDescription.replace(os.Description, '').trim()
                    
                    if(OperatingSystemVersion) {

                        let versionStack:string[] = []
                        
                        const reVersions = new RegExp('^\\d+\\.\\d+(?=\\s)')
                        const remaVersions:RegExpMatchArray|null = reVersions.exec(OperatingSystemVersion)
                        versionStack.push(remaVersions ? remaVersions[0].split('.')[0] : '?')
                        versionStack.push(remaVersions ? remaVersions[0].split('.')[1] : '?')
    
                        const reBuildNumber = new RegExp('(?<=\\()\\d+(?=\\))')
                        const remaBuildNumber:RegExpMatchArray|null = reBuildNumber.exec(OperatingSystemVersion)
                        versionStack.push(remaBuildNumber ? remaBuildNumber[0] : '?')
    
                        os.Version = versionStack.join('.')
    
                        console.debug(`OS: ${OperatingSystemDescription} | OSVersion: ${OperatingSystemVersion} ==> Description: ${os.Description} | Variant: ${os.Variant} | Version:${os.Version}`)
                    }
                }

                
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