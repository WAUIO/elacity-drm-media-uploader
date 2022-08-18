"use strict";
import {Service, ServiceBroker, ServiceSchema} from "moleculer";
import {Bento4Service, IBentoServiceSettings} from "../lib/bento4";

export default class PinataServiceImpl extends Service {
	public constructor(public broker: ServiceBroker, schema: ServiceSchema<IBentoServiceSettings> = {name: "bento"}) {
		super(broker);
		this.parseServiceSchema(
			this.mergeSchemas(
				{
					name: "bento",
					settings: {},
					mixins: [
						Bento4Service({
							bin: process.env.BENTO4_BIN,
							use: ["mp4dash", "mp4info", "mp4fragment", "mp4encrypt"],
						}),
					],
				},
				schema,
			),
		);
	}
}
