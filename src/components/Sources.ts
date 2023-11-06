// imports
import { LogEngine } from 'whiskey-log';
import { CleanedString, ldapTimestampToJS, getMaxDateFromObject } from 'whiskey-util'
import { DBEngine } from 'whiskey-sql';

import mssql from 'mssql'

export class Source {
  public readonly SourceName:string
  public readonly SourceType:Source.SourceType
  public readonly SourceHost:string
  public readonly SourceUserName?:string
  public readonly SourcePassword?:string
  public readonly SourceParameter?:string
  public readonly SourceLastQueryMessage?:string

  // numbers
  public readonly SourceLastQueryObjectCount:number=0
  public readonly SourceQueryIntervalInMinutes:number=1440

  // dates
  public readonly SourceLastQueriedDateTime?:Date

  


  public constructor(encryptionKey:string, sourceName:string, sourceType:Source.SourceType, sourceHost:string, sourceUsername:string, sourcePassword:string, sourceParameter:string='') {


    this.SourceName = sourceName
    this.SourceType = sourceType
    this.SourceHost = sourceHost
    this.SourceUserName = sourceUsername
    //this.SourcePassword = this.encrypt(encryptionKey, sourcePassword)
    this.SourceParameter = sourceParameter
  }

  public async verify() {

  }

  private async encrypt(encryptionKey:string, stringToEncrypt:string) {
    let enc = new TextEncoder()
    const encodedString = enc.encode(stringToEncrypt)

    //const k = c.exportKey()

    const c = new SubtleCrypto()
    //await c.encrypt({name: "RSA-OAEP"}, encryptionKey, stringToEncrypt)

    return ""

  }
  
}

export namespace Source {

  export enum SourceType {
    ActiveDirectory,
    AzureActiveDirectory,
    Connectwise,
    Crowdstrike
  }
}