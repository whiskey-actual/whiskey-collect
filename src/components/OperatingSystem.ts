
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import mssql, { IProcedureResult } from 'mssql'

export class OperatingSystem {

    constructor(operatingSystemLabel:string) {

        this.sourceLabel = operatingSystemLabel

        if(Utilities.doesRegexMatch(operatingSystemLabel, ['/microsoft/gi','/windows/gi'])) {
            this.vendor='Microsoft'
            this.platform='Windows'
        }

        //now remove the matches
        operatingSystemLabel = operatingSystemLabel.replace('microsoft', '');
        operatingSystemLabel = operatingSystemLabel.replace('windows', '')
        operatingSystemLabel = operatingSystemLabel.trim();

        if(Utilities.doesRegexMatch(operatingSystemLabel, ['/server/gi'])) {
            this.class="Server"
        } else {
            this.class="End-user device"
        }

        operatingSystemLabel = operatingSystemLabel.replace('server','')

        this.remainder=operatingSystemLabel
        
    }

    public readonly sourceLabel:string=''
    public readonly class:string=''
    public readonly vendor:string=''
    public readonly platform:string=''
    public readonly version:string=''
    public readonly variant:string=''
    public readonly remainder:string=''

    public async fetch(mssqlConfig:any) {

        const sqlPool = await mssql.connect(mssqlConfig)

        const q = await sqlPool.query(
            `SELECT OperatingSystemID FROM OperatingSystem WHERE sourceLabel="${this.sourceLabel}"`
        );

        if(q.recordset.length===0) {
            const insertQuery = await sqlPool.query('INSERT INTO OperatingSystemID(OperatingSystemDescription) VALUES ("${this.sourceLabel")')
        } else {
            
        }

    }

}