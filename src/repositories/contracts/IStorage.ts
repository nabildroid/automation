export default interface IStorage {
	addScreenshot(localpath: string): Promise<string>;
}
