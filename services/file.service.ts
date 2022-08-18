"use strict";

import path from "path";
import fs from "fs";
import {Service, ServiceBroker, Context} from "moleculer";
import FilesActionsMixin from "../lib/file.actions.mixin";
import {IFile, IUploadMetadata} from "../types";

const downloadFolder = process.env.UPLOAD_DIR || path.join(__dirname, "../downloads");

const sanitizeFile = (file: IFile): IFile => ({
	...file,
	path: file.path?.replace(downloadFolder, ""),
});

const getFragmentedFilePath = (filePath: string): string => {
	const fileArr = filePath.split("/") as string[];

	fileArr[fileArr.length - 1] = `fragmented-${fileArr[fileArr.length - 1]}`;

	return fileArr.join("/");
};

export default class FilesService extends Service {
	private FilesMixin = new FilesActionsMixin(downloadFolder).scheme();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "files",
			mixins: [this.FilesMixin],
			settings: {},
			hooks: {
				after: {
					storeLocalFile: [
						// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
						async function dashVideo(
							ctx: Context<any, {targetFlow?: string[]; $multipart?: IUploadMetadata}>,
							file: IFile,
						) {
							if (ctx.meta.targetFlow?.includes("dash")) {
								const fragmentedFile = getFragmentedFilePath(file.path);
								// 2. mp4fragment it (2000 ms per fragment)
								// 3. mp4encrypt (skip for now)
								// 4. mp4dash inside a dedicated folder
								await ctx.call("bento.mp4fragment", {
									args: [[file.path, fragmentedFile, "--fragment-duration", "2000"]],
								});

								const outputDir = path.join(path.dirname(file.path), "output");
								await ctx.call("bento.mp4dash", {
									args: [
										fragmentedFile,
										[
											`--output-dir=${outputDir}`,
											// @todo: investigate --smooth option for a better video rendering,
											// Actually it is not working
											// "--smooth",
										],
									],
								});

								// Output the folder so whole folder will be uploaded onto IPFS
								file.path = outputDir;
							}

							return file;
						},

						// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
						async function ipfs(
							ctx: Context<any, {targetFlow?: string[]; $multipart?: IUploadMetadata}>,
							file: IFile,
						) {
							if (ctx.meta.targetFlow?.includes("ipfs")) {
								// Check if it's file or a directory
								const stats = fs.statSync(file.path);

								// Prepare pinata metadata
								const metadata = {
									pinataMetadata: {
										name: file.name,
										keyvalues: ctx.meta.$multipart || {},
									},
									pinataOptions: {
										cidVersion: 0,
									},
								};

								if (stats.isFile()) {
									const cid: any = await ctx.call("pinata.pinFileToIPFS", {
										args: [file.path, metadata],
									});
									file.path = cid.IpfsHash;
									file.storage = "ipfs";
								} else if (stats.isDirectory()) {
									const cid: any = await ctx.call("pinata.pinFromFS", {
										args: [file.path, metadata],
									});
									file.path = cid.IpfsHash;
									file.storage = "ipfs";
								} else {
									broker.logger.warn("Requested to flow with IPFS but stats return failure", file.path);
								}
							}

							return sanitizeFile(file);
						},
					],
				},
			},
		});
	}
}
