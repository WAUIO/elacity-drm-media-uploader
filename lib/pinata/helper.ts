/* eslint-disable space-before-function-paren, prefer-arrow/prefer-arrow-functions */
import fs from "fs";
import {ServiceSchema, Context} from "moleculer";
import {set} from "lodash";
import {IPinataServiceSettings} from "./types";

export const populateActions = (schema: Partial<ServiceSchema<IPinataServiceSettings>>) => {
	const methods = schema.settings.exposeMethods;

	(methods || []).forEach(method => {
		// Handle action run handler
		const handler = async function (ctx: Context<any>): Promise<any> {
			const args = ctx?.params?.args || [];

			// Service caller normally take path as parameters for those methods that accept stream
			// We will trsnaform them before passing through the API
			if (["pinFileToIPFS"].includes(method)) {
				args[0] = fs.createReadStream(args[0]);
			}

			return await schema.pinataApi[method](...args);
		};
		set(schema, ["actions", method], {
			handler,
		});
	});
};
