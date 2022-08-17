export interface IFile {
	storage?: string;
	path: string;
	name?: string;
	originalFileName?: string;
}

export interface IUploadMetadata {
	title?: string;
	description?: string;
	price?: string;
	payToken?: string;
	author?: string;
}
