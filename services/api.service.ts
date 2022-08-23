/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {IncomingMessage} from "http";
import {Service, ServiceBroker, Context} from "moleculer";
import ApiGateway from "moleculer-web";

const cors = {
	// Configures the Access-Control-Allow-Origin CORS header.
	origin: "*",
	// Configures the Access-Control-Allow-Methods CORS header.
	methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
	// Configures the Access-Control-Allow-Headers CORS header.
	allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "X-Target-Flow"],
	// Configures the Access-Control-Expose-Headers CORS header.
	exposedHeaders: [] as string[],
	// Configures the Access-Control-Allow-Credentials CORS header.
	credentials: false,
	// Configures the Access-Control-Max-Age CORS header.
	maxAge: 3600,
};

export default class ApiService extends Service {
	public constructor(broker: ServiceBroker) {
		super(broker);
		// @ts-ignore
		this.parseServiceSchema({
			name: "api",
			mixins: [ApiGateway],
			// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
			settings: {
				port: process.env.PORT || 3000,

				cors,

				routes: [
					{
						path: "/api",
						whitelist: [
							// Access to any actions in all services under "/api" URL
							"**",
						],

						// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
						use: [],
						// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
						mergeParams: true,

						// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
						authentication: false,

						// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
						authorization: false,

						// The auto-alias feature allows you to declare your route alias directly in your services.
						// The gateway will dynamically build the full routes from service schema.
						autoAliases: true,

						aliases: {
							healthz: "healthz.ping",
						},

						// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
						callingOptions: {},

						bodyParsers: {
							json: {
								strict: false,
								limit: "100Mb",
							},
							urlencoded: {
								extended: true,
								limit: "100Mb",
							},
						},

						// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
						mappingPolicy: "all", // Available values: "all", "restrict"

						// Enable/disable logging
						logging: true,
					},
					{
						path: "/files",

						bodyParsers: {
							json: false,
							urlencoded: false,
						},

						aliases: {
							"POST /upload": {
								action: "files.storeLocalFile",
								type: "multipart",
								// Action level busboy config
								busboyConfig: {
									limits: {
										files: 1,
										// Limit to 2GB
										fileSize: 2 * 1024 * 1024 * 1024,
										fieldSize: 2 * 1024 * 1024 * 1024,
									},
									onPartsLimit(busboy: any, alias: any, svc: any) {
										broker.logger.warn("Busboy parts limit!", busboy);
									},
									onFilesLimit(busboy: any, alias: any, svc: any) {
										broker.logger.warn("Busboy file limit!", busboy);
									},
									onFieldsLimit(busboy: any, alias: any, svc: any) {
										broker.logger.warn("Busboy fields limit!", busboy);
									},
								},
							},
						},

						onBeforeCall(ctx: Context<any, {targetFlow?: string[]}>, route: any, req: IncomingMessage) {
							// Set request headers to context meta
							if (req.headers["x-target-flow"]) {
								ctx.meta.targetFlow = ((req.headers["x-target-flow"] || "") as string).split(",");
							}
						},

						// https://github.com/mscdex/busboy#busboy-methods
						busboyConfig: {
							limits: {
								files: 1,
								// Limit to 2GB
								fileSize: 2 * 1024 * 1024 * 1024,
								fieldSize: 2 * 1024 * 1024 * 1024,
							},
						},

						callOptions: {
							timeout: 0,
							meta: {
								engine: "mol",
							},
						},

						mappingPolicy: "restrict",
					},
				],

				// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
				log4XXResponses: false,
				// Logging the request parameters. Set to any log level to enable it. E.g. "info"
				logRequestParams: null,
				// Logging the response data. Set to any log level to enable it. E.g. "info"
				logResponseData: null,
				// Serve assets from "public" folder
				assets: {
					folder: "public",
					// Options to `server-static` module
					options: {},
				},
			},

			methods: {
				/**
				 * Authenticate the request. It checks the `Authorization` token value in the request header.
				 * Check the token value & resolve the user by the token.
				 * The resolved user will be available in `ctx.meta.user`
				 *
				 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
				 *
				 * @param {Context} ctx
				 * @param {any} route
				 * @param {IncomingMessage} req
				 * @returns {Promise}

				async authenticate (ctx: Context, route: any, req: IncomingMessage): Promise < any >  => {
					// Read the token from header
					const auth = req.headers.authorization;

					if (auth && auth.startsWith("Bearer")) {
						const token = auth.slice(7);

						// Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
						if (token === "123456") {
							// Returns the resolved user. It will be set to the `ctx.meta.user`
							return {
								id: 1,
								name: "John Doe",
							};

						} else {
							// Invalid token
							throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN, {
								error: "Invalid Token",
							});
						}

					} else {
						// No token. Throw an error or do nothing if anonymous access is allowed.
						// Throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
						return null;
					}
				},
				 */
				/**
				 * Authorize the request. Check that the authenticated user has right to access the resource.
				 *
				 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
				 *
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingMessage} req
				 * @returns {Promise}

				async authorize (ctx: Context < any, {
					user: string;
				} > , route: Record<string, undefined>, req: IncomingMessage): Promise < any > => {
					// Get the authenticated user.
					const user = ctx.meta.user;

					// It check the `auth` property in action schema.
					// @ts-ignore
					if (req.$action.auth === "required" && !user) {
						throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", {
							error: "Unauthorized",
						});
					}
				},
				 */
			},
		});
	}
}
