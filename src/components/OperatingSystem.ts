// import { LogEngine } from "whiskey-log"
// import { DBEngine } from "./DBEngine"

// import mssql from 'mssql'

// export class OperatingSystem {

//     constructor(OperatingSystemDescription:string, Class:string="", Vendor:string="", Platform:string="", Version:string="", Variant:string="", Remainder:string="") {
//         this.Description=OperatingSystemDescription
//         this.Class=Class
//         this.Vendor=Vendor
//         this.Platform=Platform
//         this.Version=Version
//         this.Variant=Variant
//         this.Remainder=Remainder
//     }
//     public readonly ID:number=0
//     public readonly Description:string
//     public readonly Class:string
//     public readonly Vendor:string
//     public readonly Platform:string
//     public readonly Version:string
//     public readonly Variant:string
//     public readonly Remainder:string
    
//     public async getId(le:LogEngine, sqlConfig:string):Promise<number> {

//         le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `OperatingSystem.getId`)

//         const ms = new MicrosoftSql(le, sqlConfig)
        
//         // see if we already have a record
//         let id:number = await ms.getID("OperatingSystem", this.Description)

//         // if there is no entry, add one
//         if(id===0) {
//             await this.addToDatabase(le, sqlConfig)
//             id = await ms.getID("OperatingSystem", this.Description)
//             if(id===0) {
//                 throw('unable to find added record!')
//             }
//         } else {
//             // we found an entry, check the fields.
//         }

//         return new Promise<number>((resolve) => {resolve(id)})

//     }

//     public async addToDatabase(le:LogEngine, sqlConfig:string):Promise<void> {

//         const r = new mssql.Request()
//         r.input('OperatingSystemDescription', mssql.VarChar(255), this.Description)
//         r.input('OperatingSystemClass', mssql.VarChar(255), this.Class)
//         r.input('OperatingSystemVendor', mssql.VarChar(255), this.Vendor)
//         r.input('OperatingSystemPlatform', mssql.VarChar(255), this.Platform)
//         r.input('OperatingSystemVersion', mssql.VarChar(255), this.Version)
//         r.input('OperatingSystemVariant', mssql.VarChar(255), this.Variant)
//         r.input('OperatingSystemRemainder', mssql.VarChar(255), this.Remainder)

//         r.query(`
//             INSERT INTO OperatingSystem(
//                 OperatingSystemDescription,
//                 OperatingSystemClass,
//                 OperatingSystemVendor,
//                 OperatingSystemPlatform,
//                 OperatingSystemVersion,
//                 OperatingSystemVariant,
//                 OperatingSystemRemainder
//                 ) 
//             VALUES (
//                 @OperatingSystemDescription,
//                 @OperatingSystemClass,
//                 @OperatingSystemVendor,
//                 @OperatingSystemPlatform,
//                 @OperatingSystemVersion,
//                 @OperatingSystemVariant,
//                 @OperatingSystemRemainder
//                 )
//         `)

//         const sqlPool = new mssql.ConnectionPool(sqlConfig)
//         const ps = new mssql.PreparedStatement(sqlPool)
//         const queryText:string = `
//             INSERT INTO OperatingSystem(
//                 OperatingSystemDescription,
//                 OperatingSystemClass,
//                 OperatingSystemVendor,
//                 OperatingSystemPlatform,
//                 OperatingSystemVersion,
//                 OperatingSystemVariant,
//                 OperatingSystemRemainder
//                 ) 
//             VALUES (
//                 @OperatingSystemDescription,
//                 @OperatingSystemClass,
//                 @OperatingSystemVendor,
//                 @OperatingSystemPlatform,
//                 @OperatingSystemVersion,
//                 @OperatingSystemVariant,
//                 @OperatingSystemRemainder
//                 )`

//         try {
//             await ps.prepare(queryText);
//             const result = await ps.execute({
//                 OperatingSystemDescription: this.Description,
//                 OperatingSystemClass: this.Class,
//                 OperatingSystemVendor: this.Vendor,
//                 OperatingSystemPlatform: this.Platform,
//                 OperatingSystemVersion: this.Version,
//                 OperatingSystemVariant: this.Variant,
//                 OperatingSystemRemainder: this.Remainder
//             })
//             console.debug(result)
//         }
//         catch(err) {
//             le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
//             throw(err)
//         } finally {
//             await ps.unprepare();
//         }

//         return new Promise<void>((resolve) => {resolve()})

//     }

//     private getObjectFromID(le:LogEngine, sqlConfig:string, id:number) {

//     }


//     public async getValues(le:LogEngine, sqlConfig:string, OperatingSystemID:number):Promise<void> {

//         const sqlPool = new mssql.ConnectionPool(sqlConfig)
//         const ps = new mssql.PreparedStatement(sqlPool)
//         const queryText:string = `
//             SELECT
//                 OperatingSystemClass,
//                 OperatingSystemVendor,
//                 OperatingSystemPlatform,
//                 OperatingSystemVersion,
//                 OperatingSystemVariant,
//                 OperatingSystemRemainder
//             FROM
//                 OperatingSystem
//             WHERE
//                 OperatingSystemID=@OperatingSystemID`

//         try {
//             await ps.prepare(queryText);
//             const result = await ps.execute({
//                 OperatingSystemID: OperatingSystemID
//             })
//             console.debug(result)
            
//         }
//         catch(err) {
//             le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
//             throw(err)
//         } finally {
//             await ps.unprepare();
//         }

//         return new Promise<void>((resolve) => {resolve()})

//     }
    
//     private _le:LogEngine = new LogEngine([])
//     private _sqlConfig:string = ''
// }