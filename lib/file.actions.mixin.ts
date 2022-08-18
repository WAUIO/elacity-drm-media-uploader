/* eslint-disable capitalized-comments */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import fs from "fs";
import path from "path";
import {uid} from "@elacity-js/lib";
import {Service, ServiceSchema} from "moleculer";
import {IFile} from "../types";

const mkdir = require("mkdirp").sync;

export default class FilesActionsMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor(uploadDir: string) {
		mkdir(uploadDir);

		this.schema = {
			actions: {
				/**
				 * Upload a file and store in local fs with a random name.
				 */
				storeLocalFile: {
					timeout: 0,
					async handler(ctx) {
						this.logger.info("Received upload $params:", ctx.meta.$params);
						return new this.Promise((resolve: (arg0: IFile) => void, reject: (arg0: Error) => void) => {
							// prepare destination subfolder
							const subFolder = uid();
							mkdir(path.join(uploadDir, subFolder));

							// prepare file writting
							const uniqueFileName = this.randomName(ctx.meta.filename.replace(/[^\w\.\-\_]+/gi, ""));
							const filePath = path.join(uploadDir, subFolder, uniqueFileName);
							const f = fs.createWriteStream(filePath);
							f.on("close", async () => {
								// File written successfully
								this.logger.info(`file uploaded to '${filePath}'`);

								const fileOutput: IFile = {
									name: uniqueFileName,
									originalFileName: ctx.meta.filename,
									path: filePath,
								};

								resolve(fileOutput);
							});

							ctx.params.on("error", (err: Error) => {
								this.logger.info("File error received", err.message);
								reject(err);

								// Destroy the local file
								f.destroy(err);
							});

							f.on("error", () => {
								// Remove the errored file.
								fs.unlinkSync(filePath);
							});

							ctx.params.pipe(f);
						});
					},
				},
			},

			methods: {
				randomName: (name: string) => Date.now() + "_" + (name || "unnamed.png"),
			},
		};
	}

	public scheme(): Partial<ServiceSchema> & ThisType<Service> {
		return this.schema;
	}
}
