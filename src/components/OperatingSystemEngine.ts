import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "whiskey-sql"


export class OperatingSystem {
    public Description:string|undefined = undefined
    public Variant:string|undefined = undefined
    public Version:string|undefined = undefined
}

export class OperatingSystemEngine {

    constructor(le:LogEngine, db:DBEngine) {
        this.le=le
        this.db=db
      }
      private le:LogEngine
      private db:DBEngine

    public async getId(os:OperatingSystem, insertIfMissing:boolean=false):Promise<number> {
        this.le.logStack.push("persist")
        let output:number = 0

        try {

            let OperatingSystemVariantID:number = await this.getOperatingSystemVariantID(os.Variant, insertIfMissing)

            if(os.Description && os.Description!=='') {
                let OperatingSystemVersionID:number = await this.getOperatingSystemVersionID(os.Version, insertIfMissing)
                let OperatingSystemID:number = await this.getOperatingSystemID(os.Description, insertIfMissing)
                output = await this.getOperatingSystemXRefId(OperatingSystemID, OperatingSystemVersionID, OperatingSystemVariantID, insertIfMissing)
            } else if (os.Version && os.Version!=='') {
                // we dont know the description, so find it from the Version in the XRef table.
                let OperatingSystemVersionID:number = await this.getOperatingSystemVersionID(os.Version, insertIfMissing)
                let OperatingSystemID:number = await this.db.getSingleValue('OperatingSystemXRef', 'operatingSystemVersionID', OperatingSystemVersionID, 'OperatingSystemID')
                output = await this.getOperatingSystemXRefId(OperatingSystemID, OperatingSystemVersionID, OperatingSystemVariantID, insertIfMissing)
            }

            this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `got OsXRefId: ${output} (desc: ${os.Description} | var: ${os.Variant} | ver: ${os.Version})`)
        }
        catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }

        return new Promise<number>((resolve) => {resolve(output)})
        
    }

    private async getOperatingSystemID(OperatingSystemDescription:string|undefined, insertIfMissing:boolean=false):Promise<number> {
        let output = 0
        try {
            if(OperatingSystemDescription && OperatingSystemDescription!=='') {
                output = await this.db.getID("OperatingSystem", [
                    new ColumnValuePair('OperatingSystemDescription', OperatingSystemDescription, mssql.VarChar(255)),
                ], insertIfMissing)
            }
        }
        catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return new Promise<number>((resolve) => {resolve(output)})        
    }

    private async getOperatingSystemVariantID(OperatingSystemVariantDescription:string|undefined, insertIfMissing:boolean=false):Promise<number> {
        let output = 0
        try {
            if(OperatingSystemVariantDescription && OperatingSystemVariantDescription!=='') {
                output = await this.db.getID("OperatingSystemVariant", [
                    new ColumnValuePair('OperatingSystemVariantDescription', OperatingSystemVariantDescription, mssql.VarChar(255)),
                ], insertIfMissing)
            }
        }
        catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return new Promise<number>((resolve) => {resolve(output)})        
    }

    private async getOperatingSystemVersionID(OperatingSystemVersionDescription:string|undefined, insertIfMissing:boolean=false):Promise<number> {
        let output = 0
        try {
            if(OperatingSystemVersionDescription && OperatingSystemVersionDescription!=='') {
                output = await this.db.getID("OperatingSystemVersion", [
                    new ColumnValuePair('OperatingSystemVersionDescription', OperatingSystemVersionDescription, mssql.VarChar(255)),
                ], insertIfMissing)
            }
        }
        catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return new Promise<number>((resolve) => {resolve(output)})        
    }

    private async getOperatingSystemXRefId(OperatingSystemID:number, OperatingSystemVersionID:number, OperatingSystemVariantID:number, insertIfMissing:boolean=false):Promise<number> {
        let output:number = 0
        try {
            output = await this.db.getID('OperatingSystemXRef', [
                new ColumnValuePair('OperatingSystemID', OperatingSystemID, mssql.Int),
                new ColumnValuePair('OperatingSystemVersionID', OperatingSystemVersionID, mssql.Int),
                new ColumnValuePair('OperatingSystemVariantID', OperatingSystemVariantID, mssql.Int)
            ], insertIfMissing)
        }
        catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return new Promise<number>((resolve) => {resolve(output)})    
    }

    public parseActiveDirectory(OperatingSystemDescription:string|undefined, OperatingSystemVersion:string|undefined):OperatingSystem {
        this.le.logStack.push("parseActiveDirectory")
        let os:OperatingSystem = new OperatingSystem
        try {
            if(OperatingSystemDescription) {
                const reOperatingSystem = new RegExp('(^Windows\\s(Server\\s)?\\d+(?=\\s))|macOS')
                const remaOperatingSystem:RegExpMatchArray|null = reOperatingSystem.exec(OperatingSystemDescription)
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
                        // now that we know the version, we can look up the OS.
                    }
                }
            }
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return os
    }

    // Azure AD device objects have operatingSystem details in a description a version field;
    // note that the description field is highly abstracted (eg, 'Windows'), so use the version instead.
    public parseAzureActiveDirectory(OperatingSystemDescription:string|undefined, OperatingSystemVersion:string|undefined):OperatingSystem {
        this.le.logStack.push("parseAzureActiveDirectory")
        let os:OperatingSystem = new OperatingSystem
        try {
            if(OperatingSystemDescription) {
                if(OperatingSystemDescription==='Windows') {
                    if(OperatingSystemVersion) {
                        let versionStack:string[] = []
                        const reVersions = new RegExp('^\\d+\\.\\d+\\.\\d+(\\.\\d+)?')
                        const remaVersions:RegExpMatchArray|null = reVersions.exec(OperatingSystemVersion)
                        versionStack.push(remaVersions ? remaVersions[0].split('.')[0] : '?')
                        versionStack.push(remaVersions ? remaVersions[0].split('.')[1] : '?')
                        versionStack.push(remaVersions ? remaVersions[0].split('.')[2] : '?')
                        os.Version = versionStack.join('.')
                    }
                }
            }
            console.debug(OperatingSystemDescription)
            console.debug(OperatingSystemVersion)
            console.debug(os)
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return os
    }
}