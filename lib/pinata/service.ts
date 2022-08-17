/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
import {ServiceSchema} from "moleculer";
import {merge} from "lodash";
import {populateActions} from "./helper";
import {IPinataServiceSettings} from "./types";

const pinataSDK = require("@pinata/sdk");

export default (settings: IPinataServiceSettings): ServiceSchema<IPinataServiceSettings> => ({
	name: "pinata",
	settings: merge(
		{
      // @see https://www.npmjs.com/package/@pinata/sdk#setup
			apiKey: null,

      apiSecretKey: null,

      exposeMethods: [
        "hashMetadata",
        "pinByHash",
        "pinFileToIPFS",
        "pinFromFS",
        "pinJSONToIPFS",
        "unpin",
        "userPinnedDataTotal",
        "testAuthentication",
      ],
		},
		settings,
	),

	pinataApi: null as ReturnType<typeof pinataSDK>,

	actions: {},

	methods: {},

	// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
	merged(schema: Partial<ServiceSchema<IPinataServiceSettings>>) {
		const serviceSettings = schema.settings as IPinataServiceSettings;
		schema.pinataApi = pinataSDK(serviceSettings.apiKey, serviceSettings.apiSecretKey);

    populateActions(schema);
	},
});
