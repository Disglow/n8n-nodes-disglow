import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class Disglow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Disglow',
		name: 'disglow',
		icon: 'file:disglow.png',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Disglow API',
		defaults: {
			name: 'Disglow',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'disglowApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Connection',
						value: 'connection',
					},
					{
						name: 'Server',
						value: 'server',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Logs',
						value: 'logs',
					},
					{
						name: 'Stats',
						value: 'stats',
					},
				],
				default: 'connection',
			},

			// Connection Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['connection'],
					},
				},
				options: [
					{
						name: 'Test Connection',
						value: 'test',
						description: 'Test API connection',
						action: 'Test API connection',
					},
				],
				default: 'test',
			},

			// Server Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['server'],
					},
				},
				options: [
					{
						name: 'Get Servers',
						value: 'getServers',
						description: 'Get list of Discord servers',
						action: 'Get Discord servers',
					},
					{
						name: 'Get Server Roles',
						value: 'getServerRoles',
						description: 'Get roles of a specific server',
						action: 'Get server roles',
					},
					{
						name: 'Generate Invite',
						value: 'generateInvite',
						description: 'Generate Discord invite link',
						action: 'Generate Discord invite',
					},
					{
						name: 'Validate Server',
						value: 'validateServer',
						description: 'Validate server connectivity',
						action: 'Validate Discord server',
					},
				],
				default: 'getServers',
			},

			// User Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Add User to Roles',
						value: 'addUserToRoles',
						description: 'Add user to Discord roles',
						action: 'Add user to roles',
					},
					{
						name: 'Remove User from Roles',
						value: 'removeUserFromRoles',
						description: 'Remove user from Discord roles',
						action: 'Remove user from roles',
					},
				],
				default: 'addUserToRoles',
			},

			// Logs Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['logs'],
					},
				},
				options: [
					{
						name: 'Get API Logs',
						value: 'getLogs',
						description: 'Retrieve API usage logs',
						action: 'Get API logs',
					},
				],
				default: 'getLogs',
			},

			// Stats Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['stats'],
					},
				},
				options: [
					{
						name: 'Get API Stats',
						value: 'getStats',
						description: 'Get API usage statistics',
						action: 'Get API statistics',
					},
				],
				default: 'getStats',
			},

			// Server ID field (used by multiple operations)
			{
				displayName: 'Server ID',
				name: 'serverId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['getServerRoles', 'generateInvite', 'validateServer', 'addUserToRoles', 'removeUserFromRoles'],
					},
				},
				default: '',
				placeholder: '1234567890123456789',
				description: 'Discord server ID',
			},

			// User identifier field
			{
				displayName: 'User Identifier',
				name: 'userIdentifier',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['addUserToRoles', 'removeUserFromRoles'],
					},
				},
				default: '',
				placeholder: '889979478867066971',
				description: 'Discord user ID or email',
			},

			// Identifier type field
			{
				displayName: 'Identifier Type',
				name: 'identifierType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['addUserToRoles', 'removeUserFromRoles'],
					},
				},
				options: [
					{
						name: 'Discord ID',
						value: 'discord_id',
					},
					{
						name: 'Email',
						value: 'email',
					},
				],
				default: 'discord_id',
				description: 'Type of identifier used for the user',
			},

			// Roles field
			{
				displayName: 'Role IDs',
				name: 'roles',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['addUserToRoles'],
					},
				},
				default: '',
				placeholder: '1234567890123456789,9876543210987654321',
				description: 'Comma-separated list of Discord role IDs',
			},

			{
				displayName: 'Role IDs',
				name: 'roles',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['removeUserFromRoles'],
						removeFromServer: [false],
					},
				},
				default: '',
				placeholder: '1234567890123456789,9876543210987654321',
				description: 'Comma-separated list of Discord role IDs (not required if removing from server)',
			},

			// Remove from server option
			{
				displayName: 'Remove from Server',
				name: 'removeFromServer',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['removeUserFromRoles'],
					},
				},
				default: false,
				description: 'Whether to remove user from server entirely instead of specific roles',
			},

			// Email field for invite generation
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['generateInvite'],
					},
				},
				default: '',
				placeholder: 'user@example.com',
				description: 'Email address for the invite',
			},

			// Max age for invite
			{
				displayName: 'Max Age (seconds)',
				name: 'maxAge',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['generateInvite'],
					},
				},
				default: 86400,
				description: 'Invite expiration time in seconds',
			},

			// Max uses for invite
			{
				displayName: 'Max Uses',
				name: 'maxUses',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['generateInvite'],
					},
				},
				default: 1,
				description: 'Maximum number of invite uses',
			},

			// Logs filters
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getLogs'],
					},
				},
				default: 50,
				description: 'Number of logs to retrieve (max 100)',
			},

			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getLogs'],
					},
				},
				default: 0,
				description: 'Number of logs to skip for pagination',
			},

			{
				displayName: 'Method Filter',
				name: 'method',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['getLogs'],
					},
				},
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
					},
				],
				default: '',
				description: 'Filter logs by HTTP method',
			},

			{
				displayName: 'Endpoint Filter',
				name: 'endpoint',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getLogs'],
					},
				},
				default: '',
				placeholder: '/discord/servers',
				description: 'Filter logs by endpoint (partial match)',
			},

			{
				displayName: 'Status Filter',
				name: 'status',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getLogs'],
					},
				},
				default: '',
				placeholder: '200',
				description: 'Filter logs by HTTP status code',
			},

			// Stats period
			{
				displayName: 'Period (days)',
				name: 'days',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getStats'],
					},
				},
				default: 30,
				description: 'Number of days for statistics',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let responseData;

				if (resource === 'connection') {
					if (operation === 'test') {
						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'GET',
							baseURL: 'https://api.disglow.app/api/v1',
							url: '/test',
						});
					}
				}

				if (resource === 'server') {
					if (operation === 'getServers') {
						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'GET',
							baseURL: 'https://api.disglow.app/api/v1',
							url: '/discord/servers',
						});
					}

					if (operation === 'getServerRoles') {
						const serverId = this.getNodeParameter('serverId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'GET',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/discord/servers/${serverId}/roles`,
						});
					}

					if (operation === 'generateInvite') {
						const serverId = this.getNodeParameter('serverId', i) as string;
						const email = this.getNodeParameter('email', i) as string;
						const maxAge = this.getNodeParameter('maxAge', i) as number;
						const maxUses = this.getNodeParameter('maxUses', i) as number;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'POST',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/discord/servers/${serverId}/invite`,
							body: {
								email,
								max_age: maxAge,
								max_uses: maxUses,
							},
						});
					}

					if (operation === 'validateServer') {
						const serverId = this.getNodeParameter('serverId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'POST',
							baseURL: 'https://api.disglow.app/api/v1',
							url: '/discord/servers/validate',
							body: {
								server_id: serverId,
							},
						});
					}
				}

				if (resource === 'user') {
					const serverId = this.getNodeParameter('serverId', i) as string;
					const userIdentifier = this.getNodeParameter('userIdentifier', i) as string;
					const identifierType = this.getNodeParameter('identifierType', i) as string;

					if (operation === 'addUserToRoles') {
						const roles = this.getNodeParameter('roles', i) as string;
						const roleArray = roles.split(',').map(role => role.trim()).filter(role => role);

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'POST',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/discord/servers/${serverId}/users/${userIdentifier}/roles`,
							body: {
								roles: roleArray,
								identifier_type: identifierType,
							},
						});
					}

					if (operation === 'removeUserFromRoles') {
						const removeFromServer = this.getNodeParameter('removeFromServer', i) as boolean;
						const body: any = {
							identifier_type: identifierType,
							remove_from_server: removeFromServer,
						};

						if (!removeFromServer) {
							const roles = this.getNodeParameter('roles', i) as string;
							const roleArray = roles.split(',').map(role => role.trim()).filter(role => role);
							body.roles = roleArray;
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'DELETE',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/discord/servers/${serverId}/users/${userIdentifier}/roles`,
							body,
						});
					}
				}

				if (resource === 'logs') {
					if (operation === 'getLogs') {
						const limit = this.getNodeParameter('limit', i) as number;
						const offset = this.getNodeParameter('offset', i) as number;
						const method = this.getNodeParameter('method', i) as string;
						const endpoint = this.getNodeParameter('endpoint', i) as string;
						const status = this.getNodeParameter('status', i) as number;

						const params = new URLSearchParams();
						params.append('limit', limit.toString());
						params.append('offset', offset.toString());
						
						if (method) params.append('method', method);
						if (endpoint) params.append('endpoint', endpoint);
						if (status) params.append('status', status.toString());

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'GET',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/logs?${params.toString()}`,
						});
					}
				}

				if (resource === 'stats') {
					if (operation === 'getStats') {
						const days = this.getNodeParameter('days', i) as number;
						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'disglowApi', {
							method: 'GET',
							baseURL: 'https://api.disglow.app/api/v1',
							url: `/stats?days=${days}`,
						});
					}
				}

				if (responseData === undefined) {
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error instanceof Error ? error.message : String(error) },
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}