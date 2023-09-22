import mssql from 'mssql'

export class SqlRequestCollection {

    constructor(sprocName:string) {
        this.sprocName=sprocName
    }
    public sprocName:string=''
    public sqlRequests:mssql.Request[] = []

}