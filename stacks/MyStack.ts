import { StackContext, Api, Table } from "sst/constructs";

export function API({ stack }: StackContext) {
  const webhooksTable = new Table(stack, "webhooks", {
    fields: {
      id: 'string',
      url: 'string',
      serverId: 'string',
      createdBy: 'string',
      createdAt: 'string',
      updatedAt: 'string',
      deletedAt: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });


  const api = new Api(stack, "api", {
    customDomain: {
      hostedZone: "wiktorkowalski.pl",
      domainName: "xkom-deals.aws.wiktorkowalski.pl",
    },
    routes: {
      "GET /api/v1/ping": "packages/functions/src/ping.main",

      "GET /api/v1/webhooks": "packages/functions/src/webhooks.getAll",
      "GET /api/v1/webhooks/{id}": "packages/functions/src/webhooks.getOne",
      "POST /api/v1/webhooks": "packages/functions/src/webhooks.create",
      "PATCH /api/v1/webhooks/{id}": "packages/functions/src/webhooks.update",
      "DELETE /api/v1/webhooks/{id}": "packages/functions/src/webhooks.deleteOne",
    },

    defaults: {
      function: {
        timeout: 30,
        memorySize: 256,
        bind: [webhooksTable],
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl,
  });
}
