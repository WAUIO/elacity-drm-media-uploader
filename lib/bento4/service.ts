/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
import {ServiceSchema, Context, Errors} from "moleculer";
import {merge, set} from "lodash";
const bento4 = require("fluent-bento4");

export interface IBentoServiceSettings {
  /**
   * Bin will receive the binary path in the file system.
   */
  bin: string;

  /**
   * This is the list of all tools we will make available to the service.
   * All available are listed below
   * see https://github.com/markusdaehn/node-fluent-bento4/blob/b6f0207aa331227ffd5cefda6b576c7da37c8c3a/src/bento4.js#L35
   */
  use?: string[];
}


export default (settings: IBentoServiceSettings): ServiceSchema<IBentoServiceSettings> => ({
	name: "pinata",
	settings: merge(
		{
			bin: null,

      use: [
      ],
		},
		settings,
	),

	bento4: null as typeof bento4,

	actions: {},

	methods: {},

	// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
	merged(schema: Partial<ServiceSchema<IBentoServiceSettings>>) {
		const serviceSettings = schema.settings as IBentoServiceSettings;
		schema.bento4 = bento4.setBinPath(serviceSettings.bin || process.env.BENTO4_BIN);

    (serviceSettings.use || []).forEach(
      tool => {
        // Handle action run handler
        // @see https://www.npmjs.com/package/fluent-bento4#executing-commands
        const handler = async function(ctx: Context<any>): Promise<any> {
          if (!schema.bento4[tool].exec) {
            throw new Errors.ServiceNotAvailableError(`${tool} is not available`);
          }
          return await schema.bento4[tool].exec(
            ...(ctx?.params?.args || [])
          );
        };
        set(schema, ["actions", tool], {
          handler,
        });
      }
    );
	},
});
