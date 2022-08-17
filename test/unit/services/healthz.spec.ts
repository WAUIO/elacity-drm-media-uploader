"use strict";

import { Errors, ServiceBroker} from "moleculer";
import TestService from "../../../services/healthz.service";

describe("Test 'helthz' service", () => {
	const broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'healthz.ping' action", () => {
		it("should return with 'OK'", async () => {
			const res = await broker.call("healthz.ping");
			expect(res).toBe("OK");
		});
	});
});
