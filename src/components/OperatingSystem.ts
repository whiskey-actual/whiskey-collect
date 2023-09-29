export class OperatingSystem {

    constructor(OperatingSystemDescription:string, OperatingSystemMajorVersion:number=0, OperatingSystemMinorVersion:number=0, OperatingSystemBuild:number=0, OperatingSystemRevision:number=0) {
        this.Description=OperatingSystemDescription
        this.VersionMajor=OperatingSystemMajorVersion
        this.VersionMinor=OperatingSystemMinorVersion
        this.Build=OperatingSystemBuild
        this.Revision=OperatingSystemRevision
    }
    public readonly ID:number=0
    public readonly Description:string
    public readonly VersionMajor:number
    public readonly VersionMinor:number
    public readonly Build:number
    public readonly Revision:number

}