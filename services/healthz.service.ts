"use strict";

import {Context, Service, ServiceBroker} from "moleculer";

export default class HealthzService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "healthz",
			actions: {
				ping: {
					async handler(ctx: Context<{}>): Promise<string> {
						return this.ActionOk();
					},
				},
			},
		});
	}

	// Action
	public ActionOk(): string {
		return "OK";
	}
}
