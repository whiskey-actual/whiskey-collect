import * as crypto from 'crypto';
import { LogEngine } from 'whiskey-log';

export function encrypt(le:LogEngine, stringToEncrypt:string, encryptionKey:string, initializationVector:string): string {
    le.logStack.push("encrypt")

    let output:string = ""

    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, initializationVector);
        let encrypted = cipher.update(stringToEncrypt, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        output = encrypted
    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.logStack.pop()
    }

    return output

  }