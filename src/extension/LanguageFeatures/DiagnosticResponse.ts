export const results = [
  {
    status: "WARNING",
    message:
      "Entity configuration has unknown and deprecated and redundant settings: entities/instances/providers/dvg.yml",
  },
  {
    status: "INFO",
    message: "  - $.featureProviderType: is deprecated and should be upgraded",
  },
  {
    status: "INFO",
    message: "  - $.types.nw_dvg1_rbz.properties.id.foo: is unknown for type FeatureSchema",
  },
  {
    status: "INFO",
    message: "  - $.connectionInfo.connectorType: is redundant and can be removed",
  },
  {
    status: "INFO",
    message: "  - $.connectionInfo.version: is redundant and can be removed",
  },
  {
    status: "INFO",
    message: "  - $.connectionInfo.method: is redundant and can be removed",
  },
  // test:
  {
    status: "INFO",
    message: "  - $.metadata.contactName: is redundant and can be removed",
  },
];
