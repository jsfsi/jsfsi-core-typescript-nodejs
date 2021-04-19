export abstract class FileStorage<C> {
  protected configuration: C

  constructor(configuration: C) {
    this.configuration = configuration
  }

  public abstract getFile(filePath: string): Promise<string | URL>
  public abstract saveFile(filePath: string, file: Buffer): Promise<string | URL>
}
