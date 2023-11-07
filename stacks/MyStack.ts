import { StackContext, Api, Table, NextjsSite, Config } from "sst/constructs";

export function API({ stack }: StackContext) {

  const clientId = new Config.Parameter(stack, "DISCORD_CLIENT_ID", {
    value: process.env.DISCORD_CLIENT_ID ?? "a",
  });
  const clientSecret = new Config.Parameter(stack, "DISCORD_CLIENT_SECRET", {
    value: process.env.DISCORD_CLIENT_SECRET ?? "a",
  });
  const nextAuthSecret = new Config.Parameter(stack, "NEXTAUTH_SECRET", {
    value: process.env.NEXTAUTH_SECRET ?? "a",
  });
  const nextAuthUrl = new Config.Parameter(stack, "NEXTAUTH_URL", {
    value: process.env.NEXTAUTH_URL ?? "https://dashboard.xkom-deals.aws.wiktorkowalski.pl",
  });
  const baseUrl = new Config.Parameter(stack, "BASE_URL", {
    value: process.env.BASE_URL ?? "https://dashboard.xkom-deals.aws.wiktorkowalski.pl",
  });
  

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
      domainName: "api.xkom-deals.aws.wiktorkowalski.pl",
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

  const website = new NextjsSite(stack, "xkom-deal-notifier-dashboard", {
    path: "dashboard",
    customDomain: {
      domainName: "dashboard.xkom-deals.aws.wiktorkowalski.pl",
      hostedZone: "wiktorkowalski.pl",
    },
    environment: {
      DISCORD_CLIENT_ID: clientId.value,
      DISCORD_CLIENT_SECRET: clientSecret.value,
      NEXTAUTH_SECRET: nextAuthSecret.value,
      NEXTAUTH_URL: nextAuthUrl.value,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl,
    WebsiteUrl: website.customDomainUrl,
  });
}
