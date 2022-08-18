"use strict";
import {Service, ServiceBroker, ServiceSchema} from "moleculer";
import {PinataService, IPinataServiceSettings} from "../lib/pinata";

export default class PinataServiceImpl extends Service {
	public constructor(public broker: ServiceBroker, schema: ServiceSchema<IPinataServiceSettings> = {name: "pinata"}) {
		super(broker);
		this.parseServiceSchema(
			this.mergeSchemas(
				{
					name: "pinata",
					settings: {},
					mixins: [
						PinataService({
							apiKey: process.env.PINATA_API_KEY,
							apiSecretKey: process.env.PINATA_SECRET_API_KEY,
						}),
					],
				},
				schema,
			),
		);
	}
}
