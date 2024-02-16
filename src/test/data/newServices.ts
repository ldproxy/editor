export const servicesNew = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: { serviceType: { enum: ["OGC_API"] } },
  required: ["serviceType"],
  allOf: [
    {
      if: { properties: { serviceType: { const: "OGC_API" } }, required: ["serviceType"] },
      then: { $ref: "#/$defs/OgcApiDataV2" },
    },
  ],
  $defs: {
    OgcApiDataV2: {
      title: "OgcApiDataV2",
      description:
        "# OGC API       Each API represents a deployment of a single OGC Web API, i.e., an API that implements     conformance classes from OGC API standards.       ## General rules       ### Response encoding       For operations that return a response, the encoding is chosen using standard HTTP content     negotiation with `Accept` headers.       GET operations that support more than one encoding additionally support the query     parameter `f`, which allows to explicitly choose the encoding and override the result of the     content negotiation. The supported encodings depend on the affected resource and the     configuration.       ### Response language       For operations that return a response, the language for linguistic texts is chosen using     standard HTTP content negiotiation with `Accept-Language` headers.       If enabled in [Common Core](building-blocks/common_core.md), GET operations additionally     support the query parameter `lang`, which allows to explicitely choose the language and     override the result of the content negotiation. The supported languages depend on the     affected resource and the configuration. Support for multilingualism is currently limited.     There are four possible sources for linguistic texts:        - Static texts: For example link labels or static texts in HTML represenations. Currently the languages English (`en`) and German (`de`) are supported. - Texts contained in the data: Currently not supported. - Texts set in the configuration: Currently not supported. - Error messages: These are always in english, the messages are currently hard-coded.        ### Resource paths       All resource paths in this documentation are relative to the base URI of the API. For     example given the base URI `https://example.com/pfad/zu/apis/{apiId}` and the relative     resource path `collections`, the full path would be     `https://example.com/pfad/zu/apis/{apiId}/collections`.  ## Configuration       Details regarding the API modules can be found [here](building-blocks/README.md), see     `api` in the table below.       {@docTable:properties }  ### Collection       Every collection corresponds to a feature type defined in the feature provider (only     *Feature Collections* are currently supported).       {@docTable:collectionProperties }  ### Building Blocks       Building blocks might be configured for the API or for single collections. The final     configuration is formed by merging the following sources in this order:        - The building block defaults, see [Building Blocks](building-blocks/README.md). - Optional deployment defaults in the `defaults` directory. - API level configuration. - Collection level configuration. - Optional deployment overrides in the `overrides` directory.          ### Metadata       {@docVar:metadata }       {@docTable:metadataProperties }  ### External document       {@docVar:externalDocument }       {@docTable:externalDocumentProperties }  ### Default extent       {@docVar:extent }       {@docTable:extentProperties }  ### Caching       {@docVar:caching }       {@docTable:cachingProperties }  ### Access Control       {@docVar:security }       #### Configuration       {@docTable:securityProperties }       {@docVar:policies }       {@docTable:policies }  ### Examples       See the [API     configuration](https://github.com/interactive-instruments/ldproxy/blob/master/demo/vineyards/store/entities/services/vineyards.yml)     of the API [Vineyards in Rhineland-Palatinate, Germany](https://demo.ldproxy.net/vineyards).  ## Storage       API configurations reside under the relative path `store/entities/services/{apiId}.yml` in     the data directory.",
      type: "object",
      properties: {
        id: {
          title: "id",
          description:
            "Unique identifier of the entity, has to match the filename. Allowed characters are     (A-Z, a-z), numbers (0-9), underscore and hyphen.",
          type: ["string", "number", "boolean", "null"],
        },
        createdAt: {
          title: "createdAt",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        lastModified: {
          title: "lastModified",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        entityStorageVersion: {
          title: "entityStorageVersion",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        label: {
          title: "label",
          description: "Human readable label.",
          type: ["string", "number", "boolean", "null"],
        },
        description: {
          title: "description",
          description: "Human readable description.",
          type: ["string", "number", "boolean", "null"],
        },
        enabled: {
          title: "enabled",
          description:
            "Option to disable the service, which means its REST API will not be available and     background tasks will not be running.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        shouldStart: {
          title: "shouldStart",
          description: "*Deprecated* See `enabled`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        apiVersion: {
          title: "apiVersion",
          description:
            "Adds a version to the URL path, instead of `/{id}` it will be `/{id}/v{apiVersion}`.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        auto: {
          title: "auto",
          description: "Option to generate missing definitions automatically from the data source.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        autoPersist: {
          title: "autoPersist",
          description:
            "*Deprecated, use the editor instead.* Option to persist definitions generated with     `auto` to the configuration file. The [Store](/application/40-store.md) must not be     `READ_ONLY` for this to take effect.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        serviceType: {
          title: "serviceType",
          description: "Always `OGC_API`.",
          type: ["string", "number", "boolean", "null"],
        },
        metadata: {
          title: "metadata",
          description: "General [Metadata](#metadata) for the API.",
          type: "object",
          $ref: "#/$defs/ApiMetadata",
        },
        externalDocs: {
          title: "externalDocs",
          description:
            "Link to a [document or website](#external-document) with more information about this     API.",
          type: "object",
          $ref: "#/$defs/ExternalDocumentation",
        },
        defaultExtent: {
          title: "defaultExtent",
          description:
            "By default, the spatial and temporal extent of data is derived from the data when     starting the API, but the [Default Extent](#default-extent) can also be configured.",
          type: "object",
          $ref: "#/$defs/CollectionExtent",
        },
        defaultCaching: {
          title: "defaultCaching",
          description: "Sets fixed values for [HTTP Caching Headers](#caching) for the resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        accessControl: {
          title: "accessControl",
          description: "[Access Control](#access-control) configuration.",
          type: "object",
          $ref: "#/$defs/ApiSecurity",
        },
        apiValidation: {
          title: "apiValidation",
          description:
            "During startup of an API, the configuration can be validated. The supported values are     `NONE`, `LAX`, and `STRICT`. `STRICT` will block the start of an API with warnings, while     an API with warnings, but no errors will start with `LAX`. If the value is set to `NONE`,     no validation will occur. Warnings are issued for problems in the configuration that can     affect the use of the API while errors are issued for cases where the API cannot be used.     Typically, API validation during startup will only be used in development and testing     environments since the API validating results in a slower startup time and should not be     necessary in production environments.",
          type: ["string", "number", "boolean", "null"],
        },
        tags: {
          title: "tags",
          description:
            "Tags for this API. Every tag is a string without white space. Tags are shown in the     *API Catalog* and can be used to filter the catalog response with the query parameter     `tags`, e.g. `tags=INSPIRE`.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        api: {
          title: "api",
          description: "[API Building Blocks](#building-blocks) configuration.",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/ExtensionConfiguration" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/ExtensionConfiguration" } },
          ],
        },
        collections: {
          title: "collections",
          description:
            "Collection configurations, the key is the collection id, for the value see     [Collection](#collection) below.",
          type: "object",
          additionalProperties: { $ref: "#/$defs/FeatureTypeConfigurationOgcApi" },
        },
      },
      additionalProperties: false,
    },
    ApiMetadata: {
      title: "ApiMetadata",
      description:
        "General metadata for the API (version, contact details, license information). Supported     keys with affected resources:        - `version`: API Definition, - `contactName`: API Definition, HTML Landing Page - `contactUrl`: API Definition, HTML Landing Page - `contactEmail`: API Definition, HTML Landing Page - `contactPhone`: HTML Landing Page, - `licenseName`: API Definition, HTML Landing Page, Feature Collections, Feature Collection - `licenseUrl`: API Definition, HTML Landing Page, Feature Collections, Feature Collection - `keywords`: HTML meta tages and schema:Dataset in HTML Landing Page - `attribution`: Landing Page, maps - `creatorName`: schema:Dataset in HTML - `creatorUrl`: schema:Dataset in HTML - `creatorLogoUrl`: schema:Dataset in HTML - `publisherName`: schema:Dataset in HTML - `publisherUrl`: schema:Dataset in HTML - `publisherLogoUrl`: schema:Dataset in HTML            All values are strings, except `keywords`, which is an array of strings.",
      type: "object",
      properties: {
        contactName: {
          title: "contactName",
          description: "Optional name of a contact person or organization for the API.",
          type: ["string", "number", "boolean", "null"],
        },
        contactUrl: {
          title: "contactUrl",
          description: "Optional URL of a contact webpage for the API.",
          type: ["string", "number", "boolean", "null"],
        },
        contactEmail: {
          title: "contactEmail",
          description: "Optional email address for information about the API.",
          type: ["string", "number", "boolean", "null"],
        },
        contactPhone: {
          title: "contactPhone",
          description: "Optional phone number for information about the API.",
          type: ["string", "number", "boolean", "null"],
        },
        creatorName: {
          title: "creatorName",
          description: "Optional name of a creator of data shared via the API.",
          type: ["string", "number", "boolean", "null"],
        },
        creatorUrl: {
          title: "creatorUrl",
          description: "Optional URL of a website of the creator of data shared via the API.",
          type: ["string", "number", "boolean", "null"],
        },
        creatorLogoUrl: {
          title: "creatorLogoUrl",
          description:
            "Optional URL of a logo bitmap image of the creator of data shared via the API.",
          type: ["string", "number", "boolean", "null"],
        },
        publisherName: {
          title: "publisherName",
          description: "Optional name of the publisher of this API.",
          type: ["string", "number", "boolean", "null"],
        },
        publisherUrl: {
          title: "publisherUrl",
          description: "Optional URL of a website of the publisher of this API.",
          type: ["string", "number", "boolean", "null"],
        },
        publisherLogoUrl: {
          title: "publisherLogoUrl",
          description: "Optional URL of a logo bitmap image of the publisher of this API.",
          type: ["string", "number", "boolean", "null"],
        },
        licenseName: {
          title: "licenseName",
          description: "Name of the license of the data shared via this API.",
          type: ["string", "number", "boolean", "null"],
        },
        licenseUrl: {
          title: "licenseUrl",
          description: "URL of the license of the data shared via this API.",
          type: ["string", "number", "boolean", "null"],
        },
        keywords: {
          title: "keywords",
          description: "Keywords describing this API.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        version: {
          title: "version",
          description: "Version for this API in the OpenAPI definition.",
          type: ["string", "number", "boolean", "null"],
        },
        attribution: {
          title: "attribution",
          description: "Attribution text for data shared via this API, e.g., for display in maps.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    ExternalDocumentation: {
      title: "ExternalDocumentation",
      description:
        "External document with additional information about this API, the `url` key is required,     the `description` key is recommended.",
      type: "object",
      properties: {
        description: {
          title: "description",
          description: "Description of the content of the document or website.",
          type: ["string", "number", "boolean", "null"],
        },
        url: {
          title: "url",
          description: "URL of the document or website.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    EpsgCrs: {
      title: "EpsgCrs",
      description: "",
      type: "object",
      properties: {
        code: {
          title: "code",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        verticalCode: {
          title: "verticalCode",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        forceLongitudeFirst: {
          title: "forceLongitudeFirst",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        forceAxisOrder: {
          title: "forceAxisOrder",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    BoundingBox: {
      title: "BoundingBox",
      description: "",
      type: "object",
      properties: {
        xmin: {
          title: "xmin",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        ymin: {
          title: "ymin",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        zmin: {
          title: "zmin",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        xmax: {
          title: "xmax",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        ymax: {
          title: "ymax",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        zmax: {
          title: "zmax",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        epsgCrs: { title: "epsgCrs", description: "", type: "object", $ref: "#/$defs/EpsgCrs" },
      },
      additionalProperties: false,
    },
    TemporalExtent: {
      title: "TemporalExtent",
      description: "",
      type: "object",
      properties: {
        start: {
          title: "start",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        end: {
          title: "end",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    CollectionExtent: {
      title: "CollectionExtent",
      description:
        "By default, spatial and temporal extents of the collections are derived from the data     during startup. The extent of the dataset is always the union of the collection extents. For     large datasets the automated derivation will slow down the startup of the API.       If the spatial extent should not be derived from the data source on startup, set     `spatialComputed` to `false`.       If the temporal extent should not be derived from the data source on startup, set     `temporalComputed` to `false`.       As an alternative, a default value for the spatial (`spatial`) and/or temporal     (`temporal`) extent for each collection can be set.        - Required keys for spatial extents (all values in `CRS84`): `xmin` (western longitude), `ymin` (southern latitude), `xmax` (eastern longitude), `ymax` (northern latitude). - Required keys for temporal extents (all values in milliseconds since 1 January 1970): `start`, `end`.",
      type: "object",
      properties: {
        spatial: {
          title: "spatial",
          description:
            "West- and east-bound longitude (`xmin`, `xmax`), south- and north-bound latitude     (`ymin`, `ymax`) of the data. Optionally, minimum and maximum elevation (`zmin`, `zmax`)     can be provided, too.",
          type: "object",
          $ref: "#/$defs/BoundingBox",
        },
        spatialComputed: {
          title: "spatialComputed",
          description:
            "The spatial extent of each collection is automatically dervied from the data during the     startup of the API. If the collection has no temporal properties, the collection will not     have a temporal extent.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        temporal: {
          title: "temporal",
          description:
            "`start` and `end` of the temporal extent of the data, specified as a RFC 3339 string in     UTC. Unspecified values indicate an unbounded interval end.",
          type: "object",
          $ref: "#/$defs/TemporalExtent",
        },
        temporalComputed: {
          title: "temporalComputed",
          description:
            "The temporal extent of each collection is automatically dervied from the data during     the startup of the API. If the collection has no temporal properties, the collection will     not have a temporal extent.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    Caching: {
      title: "Caching",
      description: "",
      type: "object",
      properties: {
        lastModified: {
          title: "lastModified",
          description:
            "For the resources in the building block, the `Last-Modified` header is set to the     configured value. The value overrides any modification time determined from the resource.",
          type: ["string", "number", "boolean", "null"],
        },
        expires: {
          title: "expires",
          description:
            "For the resources in the building block, the `Expires` header is set to the configured     value.",
          type: ["string", "number", "boolean", "null"],
        },
        cacheControl: {
          title: "cacheControl",
          description:
            "For the resources in the building block, the `Cache-Control` header is set to the     configured value. Exception are the *Features* and *Feature* resources, where     `cacheControlItems` is to be used.",
          type: ["string", "number", "boolean", "null"],
        },
        cacheControlItems: {
          title: "cacheControlItems",
          description:
            "For the *Features* und *Feature* resources in the building block, the `Cache-Control`     header is set to the configured value.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    PolicyAttribute: {
      title: "PolicyAttribute",
      description: "",
      type: "object",
      properties: {
        constant: { title: "constant", description: "", type: "object" },
        property: {
          title: "property",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        parameter: {
          title: "parameter",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    Policies: {
      title: "Policies",
      description: "##### Policies",
      type: "object",
      properties: {
        enabled: {
          title: "enabled",
          description:
            "Enable an additional authorization layer using a *Policy Decision Point* defined in     the [global configuration](../application/70-reference.md).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        attributes: {
          title: "attributes",
          description:
            "Add the given attributes to the request sent to the *Policy Decision Point*. Keys are     attribute ids, values are single key objects using either `constant` for a fixed string ,     `property` for a property path or `parameter` for a query parameter. Attributes using     `property` are only relevant for operations involving features. May be defined per     collection.",
          type: "object",
          additionalProperties: { $ref: "#/$defs/PolicyAttribute" },
        },
        obligations: {
          title: "obligations",
          description:
            "Applies the given attributes of obligations returned by the *Policy Decision Point*.     Keys are attribute ids, values are single key objects using `parameter` for a query     parameter. Parameters defined in an obligation will overwrite parameters in the request     with the exception if `filter`, which is merged using `AND`, May be defined per     collection.",
          type: "object",
          additionalProperties: { $ref: "#/$defs/PolicyAttribute" },
        },
      },
      additionalProperties: false,
    },
    ApiSecurity: {
      title: "ApiSecurity",
      description:
        "Access control for all API operations (combination of endpoint and HTTP method).       #### Permissions       Access control is based on permissions and permission groups.       Permissions are a combination of a group prefix (see below) and an OpenAPI operation id     (without any prefix), for example `data:getItems` or `tiles:getTile`. These can be used if a     more fine-grained control is needed in comparison to permission groups.       #### Permission groups       These are the **predefined main permission groups**, every operation/permission is     contained in exactly one main group:        - `discover`: access API landing pages, conformance declarations and OpenAPI definitions - `collections:read`: access feature collection metadata - `data:read`: access and query features - `data:write`: mutate features - `tiles:read`: access tiles - `styles:read`: access styles and their metadata - `styles:write`: mutate styles and update their metadata - `resources:read`: access file resources - `resources:write`: mutate file resources - `search:read`: access stored queries and their parameters - `search:write`: mutate stored queries - `routes:read`: access stored routes and their definition - `routes:write`: compute and store routes, delete stored routes        These are the **predefined parent permission groups** (convenient unions of main groups):        - `collections`: includes `collections:read` - `data`: includes `data:read` and `data:write` - `tiles`: includes `tiles:read` - `styles`: includes `styles:read` and `styles:write` - `resources`: includes `resources:read` and `resources:write` - `search`: includes `search:read` and `search:write` - `routes`: includes `routes:read` and `routes:write`        These are the **predefined base permission groups** (convenient unions of main groups):        - `read`: includes `discover`, `collections:read`, `data:read`, `tiles:read`, `styles:read`, `resources:read`, `search:read` and `routes:read` - `write`: includes `data:write`, `styles:write`, `resources:write`, `search:write` and `routes:write`        **Custom permission groups** are defined in `groups`, they may contain permissions and/or     predefined permission groups.       The special **permission group `public`** defines the list of permissions and/or     predefined permission groups that every user possesses, if authenticated or not.       #### Data-specific permissions       The permissions groups and permissions described above will permit access to any API and     collection. To restrict the access to specific APIs or collections, a suffix can be added to     permission groups and permissions, for example `read::daraa` or     `data:getItems::daraa:AeronauticSrf`.       #### Scopes       *OAuth2 Scopes* are an optional additional authorization layer. They are typically used     when access to an API is granted to a third-party application on behalf of a user. Scopes     then allow to limit which of the users permissions should be granted to the application. The     application would request the scopes it needs and the user would be presented a consent form     where he can choose the scopes he wishes to grant.       Scopes are disabled by default and can be enabled by setting the `scopes` option. The     value is a list of the permission group types that should be used as scopes. That allows to     set the granularity of scopes, since presenting too many scopes in a consent form might be     overwhelming and all the enabled scopes have to actually exist in the identity provider.       For example setting `scopes` to `[BASIC]` would enable the scopes `read` and `write`. When     a user then grants the `write` scope to an application, that does not automatically mean the     application is allowed to write anything. What the application can write is still defined by     the users permissions. But not granting the `write` scope is an easy way to prohibit any     write access, even if the user has such permissions.       #### Authentication and authorization       To support authenticated users, a bearer token has to be included in the `Authorization`     header in requests to the API. Validation and evaluation of these tokens has to be configured     in the [global configuration](../application/70-reference.md).       To determine if a user is authorized to perform the requested operation, the following     steps are executed:        1. If the operation is covered by the `public` group, authorization is granted, even if no token or an invalid token were provided. (Then jump to 6.) 2. If no token or an invalid token (wrong signature or expired) are provided, authorization is rejected. 3. If `audience` is non-empty and does not intersect the audience claim of the provided token, authorization is rejected. 4. If `scopes` is non-empty and the scope claim of the provided token does not contain at least one permission group that covers    the requested operation, authorization is rejected. 5. If the permissions claim of the provided token does not contain at least one permission, predefined permission group or custom    permission group that covers the requested operation, authorization is rejected. 6. If `policies` is enabled and the PDP returns `Deny`, authorization is rejected.",
      type: "object",
      properties: {
        enabled: {
          title: "enabled",
          description: "Option to disable access control.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        publicScopes: {
          title: "publicScopes",
          description:
            "*Deprecated, see `groups'.* List of permissions that every user possesses, if     authenticated or not.",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        groups: {
          title: "groups",
          description:
            "Definition of custom permission groups, the key is the group name, the value a list of     permissions and/or predefined permission groups. The group `public` defines the list of     permissions that every user possesses, if authenticated or not.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { type: ["string", "number", "boolean", "null"] } },
              },
              { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
            ],
          },
        },
        scopes: {
          title: "scopes",
          description:
            "If non-empty, *OAuth2 Scopes* are added to the OpenAPI definition. Then only tokens     that contain at least one scope that covers the requested operation are accepted. Scopes     reuse permissions groups, values are the types of permission groups that should be used:     `BASE` (e.g. `read`), `PARENT` (e.g. `data`), `MAIN` (e.g. `data:read`) and `CUSTOM`     (everything defined in `groups` besides `public`).",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        audience: {
          title: "audience",
          description:
            "If non-empty, only tokens that contain at least one of the given values in the audience     claim are accepted.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        policies: {
          title: "policies",
          description:
            "Optional additional authorization layer using a *Policy Decision Point* defined in the     [global configuration](../application/65-auth.md), see [Policies](#policies).",
          type: "object",
          $ref: "#/$defs/Policies",
        },
      },
      additionalProperties: false,
    },
    Link: {
      title: "Link",
      description: "",
      type: "object",
      properties: {
        "rel": { title: "rel", description: "", type: ["string", "number", "boolean", "null"] },
        "type": { title: "type", description: "", type: ["string", "number", "boolean", "null"] },
        "anchor": {
          title: "anchor",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        "title": { title: "title", description: "", type: ["string", "number", "boolean", "null"] },
        "href": { title: "href", description: "", type: ["string", "number", "boolean", "null"] },
        "hreflang": {
          title: "hreflang",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        "length": {
          title: "length",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        "templated": {
          title: "templated",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        "var-base": {
          title: "var-base",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    CollectionsConfiguration: {
      title: "CollectionsConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `COLLECTIONS`.",
          type: ["string", "number", "boolean", "null"],
          const: "COLLECTIONS",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "COLLECTIONS",
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        additionalLinks: {
          title: "additionalLinks",
          description:
            "Add additional links to the *Collections* resource. The value is an array of link     objects. Required properties of a link are a URI (`href`), a label (`label`) and a relation     (`rel`).",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/Link" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/Link" } },
          ],
        },
        collectionIdAsParameter: {
          title: "collectionIdAsParameter",
          description:
            "Controls whether each feature collection and subresource is listed as a single resource     in the API definition (`false`), or whether a path parameter `collectionId` is used and     each resource is specified only once in the definition (`true`). With `true` the API     definition becomes simpler and shorter, but the schema is no longer collection-specific and     collection-specific query parameters can no longer be specified in the API definition.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        collectionDefinitionsAreIdentical: {
          title: "collectionDefinitionsAreIdentical",
          description:
            "If in the case of `collectionIdAsParameter: true` all collections have a structurally     identical schema and the same queryables, the value `true` can be used to control that in     the API definition schema and queryables are determined from any collection.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    QueryablesConfiguration: {
      title: "QueryablesConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `QUERYABLES`.",
          type: ["string", "number", "boolean", "null"],
          const: "QUERYABLES",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "QUERYABLES",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        included: {
          title: "included",
          description:
            "The list of properties that can be used in CQL2 filter expressions and/or for which     filtering query parameters are provided for a collection. Properties that are not of type     `OBJECT` or `OBJECT_ARRAY` are eligible as queryables unless `isQueryable` is set to     `false` for the property. The special value `*` includes all eligible properties as     queryables. By default, no property is queryable (this is for backwards compatibility, in     v4.0 the default behaviour will change to all eligible properties).",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        excluded: {
          title: "excluded",
          description:
            "The list of properties that would be queryables based on `included`, but which should     not be queryables.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        pathSeparator: {
          title: "pathSeparator",
          description:
            "The character that is used as the path separator in case of object-valued properties.     Either `DOT` or `UNDERSCORE`.",
          type: ["string", "number", "boolean", "null"],
        },
        enableEndpoint: {
          title: "enableEndpoint",
          description: "If `true`, the Queryables endpoint will be enabled.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        asQueryParameters: {
          title: "asQueryParameters",
          description:
            "If `true`, all queryables with a simple value (string, number or boolean) will be     provided query parameters to filter features.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    CommonConfiguration: {
      title: "CommonConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `COMMON`.",
          type: ["string", "number", "boolean", "null"],
          const: "COMMON",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "COMMON",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        additionalLinks: {
          title: "additionalLinks",
          description:
            "Add additional links to the *Landing Page* resource. The value is an array of link     objects. Required properties of a link are a URI (`href`), a label (`label`) and a relation     (`rel`).",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/Link" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/Link" } },
          ],
        },
      },
      additionalProperties: false,
    },
    CrsConfiguration: {
      title: "CrsConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `CRS`.",
          type: ["string", "number", "boolean", "null"],
          const: "CRS",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "CRS",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        additionalCrs: {
          title: "additionalCrs",
          description:
            "Lists additional coordinate reference systems to be supported in the API or for a     feature collection. The native coordinate reference system of the data and the default     coordinate reference system of the API are automatically enabled. Coordinate reference     systems are identified by their EPSG code (`code`). Additionally, the order of the     coordinate axes must be specified in `forceAxisOrder` (`NONE`: as in the coordinate     reference system, `LON_LAT` or `LAT_LON`: the order in the coordinate reference system is     ignored and the specified order is used).",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/EpsgCrs" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/EpsgCrs" } },
          ],
        },
        suppressGlobalCrsList: {
          title: "suppressGlobalCrsList",
          description:
            "If `true`, the coordinate reference systems will be included in every Collection     resource that is embedded in the Collections resource. The global `crs` array will not be     used or referenced. Use this option, if the API is intended to be used with a client that     does not support the global `crs` array.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    PropertyTransformation: {
      title: "PropertyTransformation",
      description:
        "# Transformations  Transformations are supported in multiple parts of the configuration. Transformations do     not affect data sources, they are applied on-the-fly as part of the encoding. Filter     expressions do not take transformations into account, they have to be based on the source     values.  {@docTable:properties }  ## Examples for `stringFormat`       <span v-pre>`https://example.com/id/kinder/kita/{{value}}`</span> inserts the value into     the URI template.       <span v-pre>`{{value | replace:'\\\\s*[0-9].*$':''}}`</span> removes all white space and     numbers at the end (e.g. to remove a street number)       <span v-pre>`{{value | replace:'^[^0-9]*':''}}`</span> removes everything before the first     digit       <span v-pre>`{{value | toUpper}}`</span> transforms the value to upper case       <span v-pre>`{{value | toLower}}`</span> transforms the value to lower case       <span v-pre>`{{value | urlEncode}}`</span> encodes special characters in the text for     usage as aprt of an URI       <span v-pre>`[{{value}}](https://de.wikipedia.org/wiki/{{value | replace:' ':'_' |     urlencode}})`</span> transforms a value into a markdown link to a Wikipedia entry",
      type: "object",
      properties: {
        rename: {
          title: "rename",
          description: "Rename a property.",
          type: ["string", "number", "boolean", "null"],
        },
        remove: {
          title: "remove",
          description:
            "`IN_COLLECTION` (until version 3.0: `OVERVIEW`) skips the property only for the     *Features* resource, `ALWAYS` always skips it, `NEVER` never skips it.",
          type: ["string", "number", "boolean", "null"],
        },
        flatten: {
          title: "flatten",
          description:
            "Flattens object or array properties using the given separator. For arrays the property     name is formed by the original property name followed by pairs of separator and array     position. For objects the property name is formed by concatenating the original property     separated by the given separator. Can only be applied on the feature level in the provider     or using the wildcard property name `*` otherwise.",
          type: ["string", "number", "boolean", "null"],
        },
        objectReduceFormat: {
          title: "objectReduceFormat",
          description:
            "Reduces an object to a string using the same syntax as `stringFormat` but with     additional replacements for the object property names.",
          type: ["string", "number", "boolean", "null"],
        },
        reduceStringFormat: {
          title: "reduceStringFormat",
          description: "*Deprecated* See `objectReduceFormat`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        objectReduceSelect: {
          title: "objectReduceSelect",
          description:
            "Reduces an object to one of its properties, the value is the desired property name.",
          type: ["string", "number", "boolean", "null"],
        },
        objectMapFormat: {
          title: "objectMapFormat",
          description:
            "Maps an object to another object, the value is map where the keys are the new property     names. The values use the same syntax as `stringFormat` but with additional replacements     for the source object property names.",
          type: "object",
          additionalProperties: { type: "string" },
        },
        stringFormat: {
          title: "stringFormat",
          description:
            "Format a value, where `{{value}}` is replaced with the actual value and     `{{serviceUrl}}` is replaced with the API landing page URI. Additonal operations can be     applied to `{{value}}` by chaining them with `|`, see the examples below.",
          type: ["string", "number", "boolean", "null"],
        },
        dateFormat: {
          title: "dateFormat",
          description:
            "Format date(-time) values with the given     [pattern](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns),     e.g. `dd.MM.yyyy` for German notation.",
          type: ["string", "number", "boolean", "null"],
        },
        codelist: {
          title: "codelist",
          description:
            "Maps the value according to the given [codelist](../../auxiliaries/codelists.md). If     the value is not found in the codelist or the codelist does not exist, the original value     is passed through. Falls der Wert nicht in der Codelist enthalten ist oder die Codelist     nicht gefunden wird, bleibt der Wert unverändert. Not applicable for properties containing     objects.",
          type: ["string", "number", "boolean", "null"],
        },
        nullify: {
          title: "nullify",
          description:
            "Maps all values matching the list of regular expressions to `null`. Not applicable for     properties containing objects.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        null: {
          title: "null",
          description: "*Deprecated* See `nullify`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
      },
      additionalProperties: false,
    },
    CityJsonConfiguration: {
      title: "CityJsonConfiguration",
      description:
        "### Prerequisites       The module requires that the feature provider includes a type `building` that is mapped to     a CityJSON Building feature. Properties of the type `building` are mapped to CityJSON as     follows:        - `consistsOfBuildingPart`: The value must be an object with the same properties as `building`.   The object is encoded as a BuildingPart feature of the Building feature. - `address`: The value must be an array of address objects. The following attributes are mapped   to an Address object, all other properties are ignored:   - `multiPoint`: a  MULTI_POINT geometry representing the address location   - `ThoroughfareName`: a string   - `ThoroughfareNumber`: a string   - `LocalityName`: a string   - `PostalCode`: a string   - `AdministrativeArea`: a string   - `CountryName`: a string - `lod1Solid`: a closed MULTI_POLYGON geometry that represents the shell of the building at LoD 1. - `lod2Solid`: a closed MULTI_POLYGON geometry that represents the shell of the building at LoD 2. - `surfaces`: an array of semantic surface objects. The object must have a `surfaceType` and the   values must be one of the following: `CeilingSurface`, `ClosureSurface`, `Door`, `FloorSurface`,   `GroundSurface`, `InteriorWallSurface`, `OuterCeilingSurface`, `OuterFloorSurface`, `RoofSurface`,   `WallSurface`, or `Window`. The object should have a property with a POLYGON or MULTI_POLYGON   geometry that represents the surface geometry. - all other properties: The property will be mapped to a CityJSON attribute, except for `gml_id` properties.            The property of the `building` with the role `ID` will be used as the CityJSON id. Since     the embedded building parts do not have a property with a role `ID`, the building part     feature will use the value of a property `id` as the id of the CityJSON building part,     otherwise a UUID will be generated. If `id` is provided, its values must be unique.       The [example](#examples) includes a sample type definition for the building features in a     PostgreSQL feature provider based on the CityGML profile of the German surveying and mapping     authorities.",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `CITY_JSON`.",
          type: ["string", "number", "boolean", "null"],
          const: "CITY_JSON",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "CITY_JSON",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        textSequences: {
          title: "textSequences",
          description:
            "Enables support for CityJSON text sequences (media type `application/city+json-seq`).     Requires version 1.1 or later.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        version: {
          title: "version",
          description:
            "Select the CityJSON version that should be returned. Supported versions are `V10`     (CityJSON 1.0) and `V11` (CityJSON 1.1).",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    FeaturesCollectionQueryables: {
      title: "FeaturesCollectionQueryables",
      description: "",
      type: "object",
      properties: {
        spatial: {
          title: "spatial",
          description: "",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        temporal: {
          title: "temporal",
          description: "",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        q: {
          title: "q",
          description: "",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        other: {
          title: "other",
          description: "",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    FeaturesCoreConfiguration: {
      title: "FeaturesCoreConfiguration",
      description: "",
      type: "object",
      properties: {
        "buildingBlock": {
          title: "buildingBlock",
          description: "Always `FEATURES_CORE`.",
          type: ["string", "number", "boolean", "null"],
          const: "FEATURES_CORE",
        },
        "extensionType": {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FEATURES_CORE",
        },
        "transformations": {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        "caching": {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        "enabled": {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        "featureProvider": {
          title: "featureProvider",
          description:
            "Id of the feature provider to use. Normally the feature provider and API ids are the     same.",
          type: ["string", "number", "boolean", "null"],
        },
        "featureType": {
          title: "featureType",
          description:
            "Id of the feature type to use as defined in the given feature provider. Normally the     feature type and collection ids are the same.",
          type: ["string", "number", "boolean", "null"],
        },
        "": {
          title: "",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        "defaultCrs": {
          title: "defaultCrs",
          description:
            "Default coordinate reference system, either `CRS84` for datasets with 2D geometries or     `CRS84h` for datasets with 3D geometries.",
          type: ["string", "number", "boolean", "null"],
        },
        "minimumPageSize": {
          title: "minimumPageSize",
          description: "Minimum value for parameter `limit`.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        "defaultPageSize": {
          title: "defaultPageSize",
          description: "Default value for parameter `limit`.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        "maximumPageSize": {
          title: "maximumPageSize",
          description: "Maximum value for parameter `limit`.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        "embeddedFeatureLinkRels": {
          title: "embeddedFeatureLinkRels",
          description:
            "Controls which links should be specified for each feature in the Features resource, if     these exist. The values are the link relation types to be included. By default, links such     as `self` or `alternate` are omitted from features in a FeatureCollection, this option can     be used to add them if needed.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        "showsFeatureSelfLink": {
          title: "showsFeatureSelfLink",
          description: "Always add `self` link to features, even in the *Features* resource.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        "validateCoordinatesInQueries": {
          title: "validateCoordinatesInQueries",
          description:
            "Validate the coordinates of the bbox or filter parameters against the domain of validity of the  coordinate reference system",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        "itemType": {
          title: "itemType",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        "queryables": {
          title: "queryables",
          description:
            '*Deprecated* Use [Module Feature Collections -     Queryables](collections_-_queryables.md). Controls which of the attributes in queries can     be used for filtering data. A distinction is made between spatial (`spatial`), temporal     (`temporal`) and "regular" (`q`, `other`) attributes. The attributes under `spatial` must     be of type `GEOMETRY` in the provider schema, the attributes under `temporal` of type     `DATETIME` or `DATE`. The searchable attributes are each listed by their name in an array.     The queryables can be used in filter expressions ([building block "filter"](filter.md)).     The primary spatial and temporal attributes (see provider configuration) can be used for     selection via the [parameters     `bbox`](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_bbox) and [parameters     `datetime`](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_datetime),     respectively. The remaining attributes are defined as [additional parameters for the     respective feature     collections](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameters_for_filtering_on_feature_properties)     ("*" can be used as wildcard). In this way a selection of objects is already possible     without additional building blocks. The attributes under `q` are also taken into account in     the free text search in the query parameter with the same name.',
          type: "object",
          deprecated: true,
          $ref: "#/$defs/FeaturesCollectionQueryables",
        },
        "coordinatePrecision": {
          title: "coordinatePrecision",
          description:
            'Controls whether coordinates are limited to a certain number of places depending on the     coordinate reference system used. The unit of measurement and the corresponding number of     decimal places must be specified. Example: `{ "metre" : 2, "degree" : 7 }`. Valid units of     measurement are "metre" and "degree".',
          type: "object",
          additionalProperties: { type: "number" },
        },
      },
      additionalProperties: false,
    },
    GeoJsonConfiguration: {
      title: "GeoJsonConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `GEO_JSON`.",
          type: ["string", "number", "boolean", "null"],
          const: "GEO_JSON",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "GEO_JSON",
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        nestedObjectStrategy: {
          title: "nestedObjectStrategy",
          description:
            "*Deprecated* Use the [`flatten`     transformation](../../providers/details/transformations.md) instead.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        multiplicityStrategy: {
          title: "multiplicityStrategy",
          description:
            "*Deprecated* Use the [`flatten`     transformation](../../providers/details/transformations.md) instead.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        useFormattedJsonOutput: {
          title: "useFormattedJsonOutput",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        separator: {
          title: "separator",
          description:
            "*Deprecated* Use the [`flatten`     transformation](../../providers/details/transformations.md) instead.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
      },
      additionalProperties: false,
    },
    VariableName: {
      title: "VariableName",
      description: "",
      type: "object",
      properties: {
        property: {
          title: "property",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        mapping: {
          title: "mapping",
          description: "",
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    GmlConfiguration: {
      title: "GmlConfiguration",
      description:
        "By default, every GML property element will receive the property name from the feature     schema. That is, the element will be in the default namespace. A different name can be set     using the `rename` transformation, which can be used to change the name, but also supports to     add a namespace prefix.",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `GML`.",
          type: ["string", "number", "boolean", "null"],
          const: "GML",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "GML",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        gmlVersion: {
          title: "gmlVersion",
          description:
            "Selects the GML version to use: `GML32` for GML 3.2, `GML31` for GML 3.1 and `GML21`     for GML 2.1.",
          type: ["string", "number", "boolean", "null"],
        },
        gmlSfLevel: {
          title: "gmlSfLevel",
          description:
            "The default `null` declares that the GML support does not meet all requirements of the     *Geography Markup Language (GML), Simple Features Profile, Level 0* or the *Geography     Markup Language (GML), Simple Features Profile, Level 2* conformance classes from [OGC API     - Features - Part 1: Core 1.0](https://docs.ogc.org/is/17-069r4/17-069r4.html#rc_gmlsf0).       If the value is set to `0`, `1` or `2`, the conformance will be declared in the     *Conformance Declaration* resource.       If for a collection from a SQL feature provider a root element different to     `sf:FeatureCollection` is configured in `featureCollectionElementName`, the value will be     ignored and no conformance to a GML conformance class will be declared.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        conformance: {
          title: "conformance",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        applicationNamespaces: {
          title: "applicationNamespaces",
          description:
            "Every XML element will have and XML attribute can have an XML namespace. To improve     readability of the XML documents, a namespace prefix is declared for every namespace.       Common namespaces and prefixes are pre-defined, these are: `gml` (GML 3.2), `xlink`     (XLink), `xml` (XML), `sf` (OGC API Features Core 1.0, Core-SF), `wfs` (WFS 2.0), and `xsi`     (XML Schema Information).       Additional namespaces that are used in the data (declared in GML application schemas and     imported schemas), the namespaces are configured with their prefixes. Since feature data     will always use elements in application-schema-specific namespaces, this confirguration     parameter will always need to be specified.",
          type: "object",
          additionalProperties: { type: "string" },
        },
        defaultNamespace: {
          title: "defaultNamespace",
          description:
            "A default namespace that is used for XML elements, if no other namespace is specified,     can be specified with this configuration parameter. The value will be the namespace prefix.     It must be either a pre-defined prefix or a prefix declared in `applicationNamespaces`.     This namespace will be declared as the default namespace of the XML document.",
          type: ["string", "number", "boolean", "null"],
        },
        schemaLocations: {
          title: "schemaLocations",
          description:
            "If any application namespace should be included in the `xsi:schemaLocation` attribute     of the root element, the document URIs have to be provided.       In addition, the schema location of the namespace of the root element will be added, if     known. For the pre-defined namespaces (`gml`, `sf` and `wfs`), the canonical schema     location in the OGC schema repository will be used unless another schema location for the     namespace is configured.       Note that to meet XML Schema validation requirements, the namespace of the root element     must be declared in the `xsi:schemaLocation` attribute, even if the namespace is imported     by another schema.",
          type: "object",
          additionalProperties: { type: "string" },
        },
        objectTypeNamespaces: {
          title: "objectTypeNamespaces",
          description:
            "All object/data type instances are represented through a GML object element.       In the provider schema, a name must be provided for each OBJECT in the `objectType`     property, including for the feature type itself. By default, this name will be used for the     unqualified name of the GML object element.       If the GML object element is not in the default namespace, this configuration parameter     assigns a namespace prefix to an object type.",
          type: "object",
          additionalProperties: { type: "string" },
        },
        variableObjectElementNames: {
          title: "variableObjectElementNames",
          description:
            "There may also be cases, in particular when inheritance is used in the underlying     application schema, where multiple object types are represented in the same table with an     attribute that specifies the name of the feature/object type. This configuration parameter     provides the capability to identify these properties and map the values to qualified names     for the GML object element. In the example, `_type` is the feature property with three     different values mapped to the qualified element name.",
          type: "object",
          additionalProperties: { $ref: "#/$defs/VariableName" },
        },
        featureCollectionElementName: {
          title: "featureCollectionElementName",
          description:
            "Various feature collection elements are in use and sometimes additional ones are     specified in GML application schemas. The default is `sf:FeatureCollection` as specified by     OGC API Features. This configuration parameter provides a capability to use a different     feature collection element.",
          type: ["string", "number", "boolean", "null"],
        },
        featureMemberElementName: {
          title: "featureMemberElementName",
          description:
            "The feature collection element referenced in `featureCollectionElementName` has a child     property element that contains each feature. The default is `sf:featureMember` as specified     by OGC API Features. This configuration parameter provides a capability to declare the     element name for the feature collection element.",
          type: ["string", "number", "boolean", "null"],
        },
        supportsStandardResponseParameters: {
          title: "supportsStandardResponseParameters",
          description:
            "The feature collection element referenced in `featureCollectionElementName` may support     the WFS 2.0 standard response parameters (`timeStamp`, `numberMatched`, `numberReturned`).     This configuration parameter controls whether the attributes are included in the feature     collection element as XML attributes.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        xmlAttributes: {
          title: "xmlAttributes",
          description:
            "Properties are by default represented as the XML child element (GML property element)     of the XML element representing the object (GML object element). Alternatively, the     property can be represented as an XML attribute of the parent GML object element. This is     only possible for properties of type STRING, FLOAT, INTEGER, or BOOLEAN.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        gmlIdPrefix: {
          title: "gmlIdPrefix",
          description:
            "The feature property with role `ID` in the provider schema is mapped to the `gml:id`     attribute of the feature. These properties must be a direct property of the feature type.       If the values violate the rule for XML IDs, e.g., if they can start with a digit, this     configuration parameter can be used to add a consistent prefix to map all values to valid     XML IDs.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    FeaturesHtmlConfiguration: {
      title: "FeaturesHtmlConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `FEATURES_HTML`.",
          type: ["string", "number", "boolean", "null"],
          const: "FEATURES_HTML",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FEATURES_HTML",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        layout: {
          title: "layout",
          description:
            "*Deprecated* Superseded by `mapPosition` and the [`flattern`     transformation](../../providers/details/transformations.md).",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        mapPosition: {
          title: "mapPosition",
          description:
            "Can be `TOP`, `RIGHT` or `AUTO`. `AUTO` is the default, it chooses `TOP` when any     nested objects are found and `RIGHT` otherwise.",
          type: ["string", "number", "boolean", "null"],
        },
        featureTitleTemplate: {
          title: "featureTitleTemplate",
          description:
            "Define how the feature label for HTML is formed. Default is the feature id. Property     names in double curly braces will be replaced with the corresponding value.",
          type: ["string", "number", "boolean", "null"],
        },
        itemLabelFormat: {
          title: "itemLabelFormat",
          description: "*Deprecated* See `featureTitleTemplate`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        transformations: {
          title: "transformations",
          description:
            "Optional transformations for feature properties for HTML, see     [transformations](README.md#transformations).",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        mapClientType: {
          title: "mapClientType",
          description:
            "The map client library to use to display features in the HTML representation. The     default is MapLibre GL (`MAP_LIBRE`). Cesium (`CESIUM`) can be used for displaying 3D     features on a globe, if [Features - glTF](features_-_gltf.md) is enabled.",
          type: ["string", "number", "boolean", "null"],
        },
        style: {
          title: "style",
          description:
            "An optional style in the style repository to use for the map in the HTML representation     of a feature or feature collection. The style should render all data. If set to `DEFAULT`,     the `defaultStyle` configured in the [HTML configuration](html.md) is used. If the map     client is MapLibre, the style must be available in the Mapbox format. If the style is set     to `NONE`, a simple wireframe style will be used with OpenStreetMap as a basemap. If the     map client is Cesium, the style must be available in the 3D Tiles format. If the style is     set to `NONE`, the standard 3D Tiles styling is used.",
          type: ["string", "number", "boolean", "null"],
        },
        removeZoomLevelConstraints: {
          title: "removeZoomLevelConstraints",
          description:
            "If `true`, any `minzoom` or `maxzoom` members are removed from the GeoJSON layers. The     value is ignored, if the map client is not MapLibre or `style` is `NONE`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        geometryProperties: {
          title: "geometryProperties",
          description:
            "This option works only for CesiumJS as map client. By default, the geometry identified     in the provider as PRIMARY_GEOMETRY is used for representation on the map. This option     allows multiple geometry properties to be specified in a list. The first geometry property     set for a feature will be used.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        maximumPageSize: {
          title: "maximumPageSize",
          description:
            "This option can be used to set a custom maximum value for the `limit` parameter for the     HTML output. If no value is specified, the value from the Features Core module applies.     When using CesiumJS as a map client, a value of 100 is recommended.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        propertyTooltips: {
          title: "propertyTooltips",
          description:
            "If `true`, on the single item page any property that has a description in the provider     schema will get an info icon with the description as a tooltip.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        propertyTooltipsOnItems: {
          title: "propertyTooltipsOnItems",
          description:
            "If `true`, on the items page any property that has a description in the provider schema     will get an info icon with the description in a tooltip.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    FoundationConfiguration: {
      title: "FoundationConfiguration",
      description:
        "Provides base functionality for all other modules and therefore cannot be disabled.",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `FOUNDATION`.",
          type: ["string", "number", "boolean", "null"],
          const: "FOUNDATION",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FOUNDATION",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        useLangParameter: {
          title: "useLangParameter",
          description: "Support query parameter `lang` to set the desired response language.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        includeLinkHeader: {
          title: "includeLinkHeader",
          description:
            "Return links contained in API responses also as [HTTP     header](https://docs.ogc.org/is/17-069r4/17-069r4.html#_link_headers).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        apiCatalogLabel: {
          title: "apiCatalogLabel",
          description: "Title for resource *API Catalog*.",
          type: ["string", "number", "boolean", "null"],
        },
        apiCatalogDescription: {
          title: "apiCatalogDescription",
          description: "Description for resource *API Catalog*. May contain HTML elements.",
          type: ["string", "number", "boolean", "null"],
        },
        googleSiteVerification: {
          title: "googleSiteVerification",
          description:
            'If set, the value is embedded in the HTML page of the API catalog resource in a     "googleSiteVerification" meta tag (`<meta name="`google-site-verification`" content="{value}" >).',
          type: ["string", "number", "boolean", "null"],
        },
        includeSpecificationInformation: {
          title: "includeSpecificationInformation",
          description:
            "Controls whether information (name, link, maturity) about the specification of an API     component, e.g., an operation or query parameter, is included in the API definition. It is     recommended to enable this option, if the API includes building blocks that are not marked     as `stable`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    ApiCatalogEntry: {
      title: "ApiCatalogEntry",
      description: "",
      type: "object",
      properties: {
        title: { title: "title", description: "", type: ["string", "number", "boolean", "null"] },
        description: {
          title: "description",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        links: {
          title: "links",
          description: "",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/Link" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/Link" } },
          ],
        },
        id: { title: "id", description: "", type: ["string", "number", "boolean", "null"] },
        landingPageUri: {
          title: "landingPageUri",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        tags: {
          title: "tags",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        isDataset: {
          title: "isDataset",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        extensions: {
          title: "extensions",
          description: "",
          type: "object",
          additionalProperties: { type: "object" },
        },
      },
      additionalProperties: false,
    },
    HtmlConfiguration: {
      title: "HtmlConfiguration",
      description:
        '### Customization       The HTML encoding is implemented using [Mustache templates](https://mustache.github.io/)     which can be overridden by the user. Any template may be overridden but doing so for     non-empty templates is strongly discouraged since it will most certainly lead to issues on     updates.       There are predefined empty templates prefixed with `custom-` that should cover most use     cases:        - `custom-head.mustache`: add something to the `<head>` element, e.g. CSS styles - `custom-body-start.mustache`: add something at the start of the `<body>` element - `custom-body-end.mustache`: add something at the end of the `<body>` element - `custom-navbar-start.mustache`: add something at the left side of the navbar - `custom-navbar-end.mustache`: add something at the right side of the navbar - `custom-footer-start.mustache`: add something at the start of the footer - `custom-footer-end.mustache`: add something at the end of footer - `custom-footer-url.mustache`: add a link to the list at the right of the footer            These templates have to reside in the data directory either under the relative path     `templates/html/{templateName}.mustache` if you are still using the old layout (deprecated,     will stop working in v4) or under `resources/html/templates/{templateName}.mustache` with the     new layout.       #### Custom assets       It is also possible to publish any custom files, e.g. CSS files that can then be included     in `custom-head.mustache`. The files have to reside in the data directory either under the     relative path `store/resources/html/assets/` if you are still using the old layout     (deprecated, will stop working in v4) or under `resources/html/assets/` with the new layout.       For example the CSS file `resources/html/assets/my.css` could be included in     `custom-head.mustache` with `<link href="{{urlPrefix}}/custom/assets/my.css" rel="stylesheet" >`.       ### Login Provider       For APIs with [restricted access](../README.md#access-control) using an [identity     provider](../../application/65-auth.md) with login capabilities, the `loginProvider` option     can be set to enable automatic redirects to the login form of the identity provider for     restricted HTML pages. The logged-in user will also be shown on all HTML pages along with a     logout button.        ::: warning   This functionality uses cookies to retain the login information when     navigating between HTML pages. The cookies are neither processed nor passed on to any third     party.       In regard to the European GDPR and the German TTDSG we would deem these cookies as     technically required. That means if you publish an API with this functionality, you would be     required to mention these cookies in the privacy policy.  :::6        ::: info   If the identity provider uses `https` (which it should), this feature only works     if the API is also published using `https`. The only exception is accessing an API on     `localhost`.  :::',
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `HTML`.",
          type: ["string", "number", "boolean", "null"],
          const: "HTML",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "HTML",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        noIndexEnabled: {
          title: "noIndexEnabled",
          description: "Set `noIndex` for all sites to prevent search engines from indexing.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        schemaOrgEnabled: {
          title: "schemaOrgEnabled",
          description:
            "Enable [schema.org](https://schema.org) annotations for all sites, which are used e.g.     by search engines. The annotations are embedded as JSON-LD.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        microdataEnabled: {
          title: "microdataEnabled",
          description: "*Deprecated* See `schemaOrgEnabled`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        collectionDescriptionsInOverview: {
          title: "collectionDescriptionsInOverview",
          description:
            "Show collection descriptions in the HTML representation of the *Feature Collections*     resource.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        suppressEmptyCollectionsInOverview: {
          title: "suppressEmptyCollectionsInOverview",
          description:
            "Suppress collections without items in the HTML representation of the *Feature     Collections* resource.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        sendEtags: {
          title: "sendEtags",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        legalName: {
          title: "legalName",
          description: "Label for optional legal notice link on every site.",
          type: ["string", "number", "boolean", "null"],
        },
        legalUrl: {
          title: "legalUrl",
          description: "URL for optional legal notice link on every site.",
          type: ["string", "number", "boolean", "null"],
        },
        privacyName: {
          title: "privacyName",
          description: "Label for optional privacy notice link on every site.",
          type: ["string", "number", "boolean", "null"],
        },
        privacyUrl: {
          title: "privacyUrl",
          description: "URL for optional privacy notice link on every site.",
          type: ["string", "number", "boolean", "null"],
        },
        defaultStyle: {
          title: "defaultStyle",
          description:
            "A default style in the style repository that is used in maps in the HTML representation     of the feature and tile resources. If `NONE`, a simple wireframe style will be used with     OpenStreetMap as a basemap, if the map client is MapLibre; for Cesium, the default 3D Tiles     styling will be used with the basemap. If the value is not `NONE` and the map client is     MapLibre, the API landing page (or the collection page) will also contain a link to a web     map with the style for the dataset (or the collection).",
          type: ["string", "number", "boolean", "null"],
        },
        basemapUrl: {
          title: "basemapUrl",
          description: "URL template for background map tiles.",
          type: ["string", "number", "boolean", "null"],
        },
        basemapAttribution: {
          title: "basemapAttribution",
          description: "Source attribution for background map.",
          type: ["string", "number", "boolean", "null"],
        },
        leafletUrl: {
          title: "leafletUrl",
          description: "*Deprecated* See `basemapUrl`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        leafletAttribution: {
          title: "leafletAttribution",
          description: "*Deprecated* See `basemapAttribution`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        openLayersUrl: {
          title: "openLayersUrl",
          description: "*Deprecated* See `basemapUrl`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        openLayersAttribution: {
          title: "openLayersAttribution",
          description: "*Deprecated* See `basemapAttribution`",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        footerText: {
          title: "footerText",
          description: "Additional text shown in footer of every site.",
          type: ["string", "number", "boolean", "null"],
        },
        loginProvider: {
          title: "loginProvider",
          description:
            "Option to enable automatic redirects to the login form of an identity provider. The     value is the id of a provider with login capabilities in the [global     configuration](../../application/65-auth.md). Also see [Login Provider](#login-provider).",
          type: ["string", "number", "boolean", "null"],
        },
        additionalApis: {
          title: "additionalApis",
          description: "",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/ApiCatalogEntry" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/ApiCatalogEntry" } },
          ],
        },
      },
      additionalProperties: false,
    },
    JsonConfiguration: {
      title: "JsonConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `JSON`.",
          type: ["string", "number", "boolean", "null"],
          const: "JSON",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "JSON",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    Oas30Configuration: {
      title: "Oas30Configuration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `OAS30`.",
          type: ["string", "number", "boolean", "null"],
          const: "OAS30",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "OAS30",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    TileMatrixSetsConfiguration: {
      title: "TileMatrixSetsConfiguration",
      description:
        "### Custom Tiling Schemes       Additional tiling schemes can be configured as JSON files according to the [OGC Two     Dimensional Tile Matrix Set and Tile Set Metadata 2.0     Standard](https://docs.ogc.org/is/17-083r4/17-083r4.html) in the data directory at     `api-resources/tile-matrix-sets/{tileMatrixSetId}.json`.",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `TILE_MATRIX_SETS`.",
          type: ["string", "number", "boolean", "null"],
          const: "TILE_MATRIX_SETS",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "TILE_MATRIX_SETS",
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        includePredefined: {
          title: "includePredefined",
          description:
            "The list of pre-defined tile matrix sets that are included in the API. All tile matrix     sets used by a tile provider of the API are automatically added to the list.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    MinMax: {
      title: "MinMax",
      description: "",
      type: "object",
      properties: {
        min: {
          title: "min",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        max: {
          title: "max",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        default: {
          title: "default",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    SeedingOptions: {
      title: "SeedingOptions",
      description: "### Seeding       Controls how and when [caches](#cache) are computed.",
      type: "object",
      properties: {
        runOnStartup: {
          title: "runOnStartup",
          description: "If disabled the seeding will not be run when the API starts.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        runPeriodic: {
          title: "runPeriodic",
          description:
            "A crontab pattern to run the seeding periodically. There will only ever be one seeding     in progress, so if the next run is scheduled before the last one finished, it will be     skipped.",
          type: ["string", "number", "boolean", "null"],
        },
        purge: {
          title: "purge",
          description: "If enabled the tile cache will be purged before the seeding starts.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        maxThreads: {
          title: "maxThreads",
          description:
            "The maximum number of threads the seeding is allowed to use. The actual number of     threads used depends on the number of available background task threads when the seeding is     about to start. If you want to allow more than thread, first check if sufficient background     task threads are configured. Take into account that the seeding for multiple APIs will     compete for the available background task threads.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    LevelFilter: {
      title: "LevelFilter",
      description: "",
      type: "object",
      properties: {
        min: {
          title: "min",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        max: {
          title: "max",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        filter: { title: "filter", description: "", type: ["string", "number", "boolean", "null"] },
      },
      additionalProperties: false,
    },
    LevelTransformation: {
      title: "LevelTransformation",
      description: "",
      type: "object",
      properties: {
        min: {
          title: "min",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        max: {
          title: "max",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        merge: {
          title: "merge",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        groupBy: {
          title: "groupBy",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        properties: {
          title: "properties",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    TileProviderFeatures: {
      title: "TileProviderFeatures",
      description:
        "In this tile provider, the tiles in Mapbox Vector Tiles format are derived from the     features provided by the API in the area of the tile.",
      type: "object",
      properties: {
        type: {
          title: "type",
          description: "Fixed value, identifies the tile provider type.",
          type: ["string", "number", "boolean", "null"],
          const: "FEATURES",
        },
        tileEncodings: {
          title: "tileEncodings",
          description:
            'Controls which formats should be supported for the tiles. Currently only Mapbox Vector     Tiles ("MVT") is available.',
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        zoomLevels: {
          title: "zoomLevels",
          description:
            "Controls the zoom levels available for each active tiling scheme as well as which zoom     level to use as default.",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        zoomLevelsCache: {
          title: "zoomLevelsCache",
          description: "Zoom levels for which tiles are cached.",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        seedingOptions: {
          title: "seedingOptions",
          description:
            "Controls how and when tiles are precomputed, see [Seeding options](#seeding-options).",
          type: "object",
          deprecated: true,
          $ref: "#/$defs/SeedingOptions",
        },
        seeding: {
          title: "seeding",
          description:
            "Zoom levels per enabled tile encoding for which the tile cache should be seeded on     startup.",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        filters: {
          title: "filters",
          description:
            "Filters to select a subset of feature for certain zoom levels using a CQL filter     expression, see example below.",
          type: "object",
          deprecated: true,
          additionalProperties: {
            allOf: [
              { if: { type: "array" }, then: { items: { $ref: "#/$defs/LevelFilter" } } },
              { if: { type: "object" }, then: { $ref: "#/$defs/LevelFilter" } },
            ],
          },
        },
        rules: {
          title: "rules",
          description:
            "Rules to postprocess the selected features for a certain zoom level. Supported     operations are: selecting a subset of feature properties (`properties`), spatial merging of     features that intersect (`merge`), with the option to restrict the operations to features     with matching attributes (`groupBy`). See the example below. For `merge`, the resulting     object will only obtain properties that are identical for all merged features.",
          type: "object",
          deprecated: true,
          additionalProperties: {
            allOf: [
              { if: { type: "array" }, then: { items: { $ref: "#/$defs/LevelTransformation" } } },
              { if: { type: "object" }, then: { $ref: "#/$defs/LevelTransformation" } },
            ],
          },
        },
        center: {
          title: "center",
          description:
            "Longitude and latitude that a map with the tiles should be centered on by default.",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: {
                items: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                    { type: "null" },
                  ],
                },
              },
            },
            {
              if: { type: "object" },
              then: {
                oneOf: [
                  { type: "number" },
                  { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                  { type: "null" },
                ],
              },
            },
          ],
        },
        limit: {
          title: "limit",
          description: "Maximum number of features contained in a single tile per query.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
          deprecated: true,
        },
        singleCollectionEnabled: {
          title: "singleCollectionEnabled",
          description:
            "Enable vector tiles for each *Feature Collection*. Every tile contains a layer with the     feature from the collection.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        multiCollectionEnabled: {
          title: "multiCollectionEnabled",
          description:
            "Enable vector tiles for the whole dataset. Every tile contains one layer per collection     with the features of that collection.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        ignoreInvalidGeometries: {
          title: "ignoreInvalidGeometries",
          description:
            "Ignore features with invalid geometries. Before ignoring a feature, an attempt is made     to transform the geometry to a valid geometry. The topology of geometries might be invalid     in the data source or in some cases the quantization of coordinates to integers might     render it invalid.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        minimumSizeInPixel: {
          title: "minimumSizeInPixel",
          description:
            'Features with line geometries shorter that the given value are excluded from tiles.     Features with surface geometries smaller than the square of the given value are excluded     from the tiles. The value `0.5` corresponds to half a "pixel" in the used coordinate     reference system.',
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
          deprecated: true,
        },
      },
      additionalProperties: false,
    },
    TileProviderMbtiles: {
      title: "TileProviderMbtiles",
      description:
        'With this tile provider, the tiles are provided via an [MBTiles     file](https://github.com/mapbox/mbtiles-spec). The tile format and all other properties of     the tileset resource are derived from the contents of the MBTiles file. Only the     "WebMercatorQuad" tiling scheme is supported.',
      type: "object",
      properties: {
        type: {
          title: "type",
          description: "Fixed value, identifies the tile provider type.",
          type: ["string", "number", "boolean", "null"],
          const: "MBTILES",
        },
        filename: {
          title: "filename",
          description:
            "Filename of the MBTiles file in the `api-resources/tiles/{apiId}` directory.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        tileMatrixSetId: {
          title: "tileMatrixSetId",
          description: "Tiling scheme used in the MBTiles file.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
      },
      additionalProperties: false,
    },
    TileProviderTileServer: {
      title: "TileProviderTileServer",
      description:
        'With this tile provider, the tiles are obtained from [TileServer-GL     instance](https://github.com/maptiler/tileserver-gl). Only the "WebMercatorQuad" tile scheme     is supported.       In the current version, this provider is only supported in the [Map Tiles](map_tiles.md)     module. Only bitmap tile formats are supported. Seeding or caching are not supported.       This tile provider is experimental and its configuration options may change in future     versions.',
      type: "object",
      properties: {
        type: {
          title: "type",
          description: "Fixed value, identifies the tile provider type.",
          type: ["string", "number", "boolean", "null"],
          const: "TILESERVER",
        },
        urlTemplate: {
          title: "urlTemplate",
          description:
            "URL template for accessing tiles. Parameters to use are `{tileMatrix}`, `{tileRow}`,     `{tileCol}` and `{fileExtension}`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        urlTemplateSingleCollection: {
          title: "urlTemplateSingleCollection",
          description: "URL template for accessing tiles for a collection.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        tileEncodings: {
          title: "tileEncodings",
          description:
            "List of tile formats to be supported, allowed are `PNG`, `WebP` and `JPEG`.",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    TileProvider: {
      type: "object",
      properties: { type: { enum: ["FEATURES", "MBTILES", "TILESERVER"] } },
      required: ["type"],
      allOf: [
        {
          if: { properties: { type: { const: "FEATURES" } }, required: ["type"] },
          then: { $ref: "#/$defs/TileProviderFeatures" },
        },
        {
          if: { properties: { type: { const: "MBTILES" } }, required: ["type"] },
          then: { $ref: "#/$defs/TileProviderMbtiles" },
        },
        {
          if: { properties: { type: { const: "TILESERVER" } }, required: ["type"] },
          then: { $ref: "#/$defs/TileProviderTileServer" },
        },
      ],
    },
    TilesConfiguration: {
      title: "TilesConfiguration",
      description:
        "### Prerequisites       The building block *Tile Matrix Sets* must be enabled. If that building block is not     configured, it is automatically enabled if *Tiles* is enabled.       ### Storage       The tile cache is located in the data directory under the relative path     `cache/tiles/{apiId}`. If the data for an API or tile configuration has been changed, then     the cache directory for the API should be deleted so that the cache is rebuilt with the     updated data or rules.",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `TILES`.",
          type: ["string", "number", "boolean", "null"],
          const: "TILES",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "TILES",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        maxMultiplicity: {
          title: "maxMultiplicity",
          description:
            "If the feature schema includes array properties, `maxMultiplicity` properties will be     created for each array property. If an instance has more values in an array, only the first     values are included in the data.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        tileProvider: {
          title: "tileProvider",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)* Specifies the data source for the     tiles, see [Tile provider objects](#tile-provider).",
          type: "object",
          deprecated: true,
          $ref: "#/$defs/TileProvider",
        },
        tileProviderId: {
          title: "tileProviderId",
          description:
            "*Deprecated (will be renamed to `tileProvider` in v4.0)* Specifies the data source for     the tiles, see [Tile Providers](../../providers/tile/README.md).",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        tileProviderTileset: {
          title: "tileProviderTileset",
          description:
            "Specifies the tileset from the tile provider that should be used. The default is     `__all__` for dataset tiles and `{collectionId}` for collection tiles.",
          type: ["string", "number", "boolean", "null"],
        },
        tileLayer: {
          title: "tileLayer",
          description: "*Deprecated* See `tileProviderTileset`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        tileSetEncodings: {
          title: "tileSetEncodings",
          description:
            'Controls which formats are supported for the tileset resources. Available are [OGC     TileSetMetadata](https://docs.ogc.org/DRAFTS/17-083r3.html#tsmd-json-encoding) ("JSON") and     [TileJSON](https://github.com/mapbox/tilejson-spec) ("TileJSON").',
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        cache: {
          title: "cache",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities) `FILES` stores each tile as a file in     the file system. `MBTILES` stores the tiles in an MBTiles file (one MBTiles file per     tileset).",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        mapClientType: {
          title: "mapClientType",
          description:
            "Selection of the map client to be used in the HTML output. The default is MapLibre GL     JS, only the \"WebMercatorQuad\" tiling scheme is supported. Alternatively 'OPEN_LAYERS' is     supported as well (OpenLayers). The support of Open Layers only makes sense if other of the     predefined tiling schemes should be supported in the HTML output. With `OPEN_LAYERS` no     styles are supported.",
          type: ["string", "number", "boolean", "null"],
        },
        style: {
          title: "style",
          description:
            "A style in the style repository to be used in maps with tiles by default. With     `DEFAULT` the `defaultStyle` from [module HTML](html.md) is used. If the map client is     MapLibre, the style must be available in the Mapbox format. If the style is set to `NONE`,     a simple wireframe style will be used with OpenStreetMap as a basemap. If the map client is     Open Layers, the setting is ignored.",
          type: ["string", "number", "boolean", "null"],
        },
        removeZoomLevelConstraints: {
          title: "removeZoomLevelConstraints",
          description:
            "If `true` is selected, the `minzoom` and `maxzoom` specifications for the layer objects     are removed from the style specified in `style` so that the features are displayed at all     zoom levels. This option should not be used if the style provides different presentations     depending on the zoom level, otherwise all layers will be displayed at all zoom levels at     the same time.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        tileEncodings: {
          title: "tileEncodings",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)* List of tile formats to be supported,     in general `MVT` (Mapbox Vector Tiles), `PNG`, `WebP` and `JPEG` are allowed. The actually     supported formats depend on the [Tile Provider](../../providers/tile/README.md).",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        center: {
          title: "center",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: {
                items: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                    { type: "null" },
                  ],
                },
              },
            },
            {
              if: { type: "object" },
              then: {
                oneOf: [
                  { type: "number" },
                  { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                  { type: "null" },
                ],
              },
            },
          ],
        },
        zoomLevels: {
          title: "zoomLevels",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)* Controls the zoom levels available for     each active tiling scheme as well as which zoom level to use as default.",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        collectionTiles: {
          title: "collectionTiles",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)* Enable vector tiles for each *Feature     Collection*. Every tile contains a layer with the feature from the collection. If a Tile     Provider is specified, tiles will always be enabled for a collection, if the tileset is     specified in the Tile Provider, independent of the value of this option.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        singleCollectionEnabled: {
          title: "singleCollectionEnabled",
          description: "*Deprecated* See `collectionTiles`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        datasetTiles: {
          title: "datasetTiles",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)* Enable vector tiles for the whole     dataset. Every tile contains one layer per collection with the features of that collection.     If a Tile Provider is specified, tiles will always be enabled for the dataset, if the     corresponding tileset is specified in the Tile Provider, independent of the value of this     option.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        multiCollectionEnabled: {
          title: "multiCollectionEnabled",
          description: "*Deprecated* See `datasetTiles`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        zoomLevelsCache: {
          title: "zoomLevelsCache",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        seeding: {
          title: "seeding",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          type: "object",
          deprecated: true,
          additionalProperties: { $ref: "#/$defs/MinMax" },
        },
        seedingOptions: {
          title: "seedingOptions",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          type: "object",
          deprecated: true,
          $ref: "#/$defs/SeedingOptions",
        },
        limit: {
          title: "limit",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
          deprecated: true,
        },
        ignoreInvalidGeometries: {
          title: "ignoreInvalidGeometries",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        filters: {
          title: "filters",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          type: "object",
          deprecated: true,
          additionalProperties: {
            allOf: [
              { if: { type: "array" }, then: { items: { $ref: "#/$defs/LevelFilter" } } },
              { if: { type: "object" }, then: { $ref: "#/$defs/LevelFilter" } },
            ],
          },
        },
        rules: {
          title: "rules",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          type: "object",
          deprecated: true,
          additionalProperties: {
            allOf: [
              { if: { type: "array" }, then: { items: { $ref: "#/$defs/LevelTransformation" } } },
              { if: { type: "object" }, then: { $ref: "#/$defs/LevelTransformation" } },
            ],
          },
        },
        minimumSizeInPixel: {
          title: "minimumSizeInPixel",
          description:
            "*Deprecated (from v4.0 on you have to use [Tile     Provider](../../providers/tile/README.md) entities)*",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
          deprecated: true,
        },
      },
      additionalProperties: false,
    },
    XmlConfiguration: {
      title: "XmlConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `XML`.",
          type: ["string", "number", "boolean", "null"],
          const: "XML",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "XML",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    SchemaConfiguration: {
      title: "SchemaConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `SCHEMA`.",
          type: ["string", "number", "boolean", "null"],
          const: "SCHEMA",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "SCHEMA",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        versions: {
          title: "versions",
          description:
            "**Deprecated** List of enabled JSON Schema versions. Supported are 2020-12 (`V202012`),     2019-09 (`V201909`) and 07 (`V7`). The draft specification only supports 2020-12.",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    CrudConfiguration: {
      title: "CrudConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `CRUD` or (*deprecated*) `TRANSACTIONAL`.",
          type: ["string", "number", "boolean", "null"],
          enum: ["CRUD", "TRANSACTIONS"],
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          enum: ["CRUD", "TRANSACTIONS"],
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        optimisticLockingLastModified: {
          title: "optimisticLockingLastModified",
          description:
            "Option to enable support for conditional processing of PUT, PATCH, and DELETE requests,     based on the time when the feature was last updated. Such requests must include an     `If-Unmodified-Since` header, otherwise they will be rejected. A feature will only be     changed, if the feature was not changed since the timestamp in the header (or if no last     modification time is known for the feature).       The setting is ignored, if `optimisticLockingETag` is enabled.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        optimisticLockingETag: {
          title: "optimisticLockingETag",
          description:
            "Option to enable support for conditional processing of PUT, PATCH, and DELETE requests,     based on a strong Entity Tag (ETag) of the feature. Such requests must include an     `If-Match` header, otherwise they will be rejected. A feature will only be changed, if the     feature matches the Etag(s) in the header.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    GltfPropertyDefinition: {
      title: "GltfPropertyDefinition",
      description: "",
      type: "object",
      properties: {
        type: { title: "type", description: "", type: ["string", "number", "boolean", "null"] },
        componentType: {
          title: "componentType",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        stringOffsetType: {
          title: "stringOffsetType",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
        noData: { title: "noData", description: "", type: ["string", "number", "boolean", "null"] },
      },
      additionalProperties: false,
    },
    GltfConfiguration: {
      title: "GltfConfiguration",
      description:
        "### Prerequisites       The module requires that the feature provider includes a type `building`. The requirements     for the type are the same as in the configuration of the [CityJSON     encoding](features_-_cityjson.html#configuration).",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `GLTF`.",
          type: ["string", "number", "boolean", "null"],
          const: "GLTF",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "GLTF",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        meshQuantization: {
          title: "meshQuantization",
          description:
            "Enables support for the glTF 2.0 extension     [KHR_mesh_quantization](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_mesh_quantization).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        withNormals: {
          title: "withNormals",
          description: "If `true`, the normals are computed for every vertex.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        withOutline: {
          title: "withOutline",
          description: "If `true`, the polygon edges are outlined in Cesium.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        polygonOrientationNotGuaranteed: {
          title: "polygonOrientationNotGuaranteed",
          description:
            "If `true`, materials are defined as     [double-sided](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#double-sided).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        properties: {
          title: "properties",
          description:
            "Use this option to specify which feature attributes are included in the glTF model.     `type` is one of `SCALAR`, `STRING` or `ENUM`. For a scalar, specify the `componentType`     (see [3D Metadata     Specification](https://github.com/CesiumGS/3d-tiles/tree/main/specification/Metadata#component-type)),     default is `UNIT16`. For a string, specify the `stringOffsetType` as `UNIT8`, `UNIT16`, or     `UNIT32` depending on the expected length of the string buffer, default is `UNIT32`. For an     enum, the feature property must either have an `enum` constraint in the provider schema or     a `codelist` constraint where the codelist uses an integer code; specify the     `componentType` according to the range of code values, default is `UINT32`. In addition, a     sentinel value can be specified using `noData` (see [3D Metadata     Specification](https://github.com/CesiumGS/3d-tiles/tree/main/specification/Metadata) for     details).",
          type: "object",
          additionalProperties: { $ref: "#/$defs/GltfPropertyDefinition" },
        },
        withSurfaceType: {
          title: "withSurfaceType",
          description:
            'If `true`, for buildings in Level-of-Detail 2 with information about the semantics of     each surface (wall, roof, etc.), a property "surfaceType" is added and available for each     vertex.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        maxMultiplicity: {
          title: "maxMultiplicity",
          description:
            "If the data is flattened and the feature schema includes arrays, `maxMultiplicity`     properties will be created for each array property. If an instance has more values in an     array, only the first values are included in the data.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    JsonFgConfiguration: {
      title: "JsonFgConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `JSON_FG`.",
          type: ["string", "number", "boolean", "null"],
          const: "JSON_FG",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "JSON_FG",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        describedby: {
          title: "describedby",
          description:
            '*Partially Deprecated* For schemas specific to the feature type, use `schemaCollection`     and `schemaFeature`. Enables that links to the generic JSON-FG and GeoJSON JSON Schema     documents are added to the JSON-FG response document. The links have the link relation type     "describedby". The schemas can be used to validate the JSON document.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        schemaCollection: {
          title: "schemaCollection",
          description:
            'The URI of a JSON Schema document describing a feature collection with the features of     the collection/dataset. The schema will be referenced from JSON-FG feature collection     responses by a link with the link relation type "describedby". The schemas can be used to     validate the JSON document.',
          type: ["string", "number", "boolean", "null"],
        },
        schemaFeature: {
          title: "schemaFeature",
          description:
            'The URI of a JSON Schema document describing a feature of the collection/dataset. The     schema will be referenced from JSON-FG feature responses by a link with the link relation     type "describedby". The schemas can be used to validate the JSON document.',
          type: ["string", "number", "boolean", "null"],
        },
        coordRefSys: {
          title: "coordRefSys",
          description:
            'Activates the output of the coordinate reference system in a JSON member "coordRefSys"     for features and feature collections. The coordinate reference system is identified by its     OGC URI, for example, `http://www.opengis.net/def/crs/EPSG/0/25832` for ETRS89 / UTM 32N.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        geojsonCompatibility: {
          title: "geojsonCompatibility",
          description:
            'Activates support for the "compatibility=geojson" media type parameter. If the     parameter is provided, JSON-FG features with a "place" member that is not `null` will also     include a GeoJSON geometry in the "geometry" member in WGS 84. If the parameter is missing,     the "geometry" member of a JSON-FG feature will be `null`, if the "place" member is not     `null`.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        featureType: {
          title: "featureType",
          description:
            'Features are often categorized by type. Typically, all features of the same type have     the same schema and the same properties.       Many GIS clients depend on knowledge about the feature type when processing feature     data. For example, when associating a style to a feature in order to render that feature on     a map.       This option adds a "featureType" member with the specified values. If a single value is     specified, then a string is added, otherwise an array of strings.       A value can include a template `{{type}}`, which will be replaced with the value of the     feature property with `role: TYPE` in the provider schema of the feature type of the     collection. The property must be of type `STRING`.       If the feature type in the provider schema includes an `objectType` value, the value     will be used as the default. Otherwise, the default is an empty array.',
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        useCuries: {
          title: "useCuries",
          description:
            'If `true`, values in "conformsTo" and "coordRefSys" will be Safe CURIEs, not HTTP URIs.     For example, `[EPSG:25832]` instead of `http://www.opengis.net/def/crs/EPSG/0/25832`.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        links: {
          title: "links",
          description:
            "Adds the specified links to the `links` array of features. All values of the array must     be a valid link object with `href` and `rel`.",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/Link" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/Link" } },
          ],
        },
        includeInGeoJson: {
          title: "includeInGeoJson",
          description:
            "The option allows selected JSON-FG extensions to be included in the GeoJSON encoding as     well. Allowed values are: `describedby`, `featureType`, `featureSchema`, `time`, `place`,     `coordRefSys`, `links`. `conformsTo` is only used in JSON-FG responses.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    SearchConfiguration: {
      title: "SearchConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `SEARCH`.",
          type: ["string", "number", "boolean", "null"],
          const: "SEARCH",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "SEARCH",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        managerEnabled: {
          title: "managerEnabled",
          description: "Option to manage stored queries using PUT and DELETE.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        validationEnabled: {
          title: "validationEnabled",
          description:
            "Option to validate stored queries when using PUT by setting a `Prefer` header with     `handling=strict`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        allLinksAreLocal: {
          title: "allLinksAreLocal",
          description:
            "Signals feature encoders whether all link targets are within the same document.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    FilterConfiguration: {
      title: "FilterConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `FILTER`.",
          type: ["string", "number", "boolean", "null"],
          const: "FILTER",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FILTER",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    GeometrySimplificationConfiguration: {
      title: "GeometrySimplificationConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `GEOMETRY_SIMPLIFICATION`.",
          type: ["string", "number", "boolean", "null"],
          const: "GEOMETRY_SIMPLIFICATION",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "GEOMETRY_SIMPLIFICATION",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    ProjectionsConfiguration: {
      title: "ProjectionsConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `PROJECTIONS`.",
          type: ["string", "number", "boolean", "null"],
          const: "PROJECTIONS",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "PROJECTIONS",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    RoutingFlag: {
      title: "RoutingFlag",
      description: "",
      type: "object",
      properties: {
        label: { title: "label", description: "", type: ["string", "number", "boolean", "null"] },
        default: {
          title: "default",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        providerFlag: {
          title: "providerFlag",
          description: "",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    HtmlFormDefaults: {
      title: "HtmlFormDefaults",
      description: "",
      type: "object",
      properties: {
        name: { title: "name", description: "", type: ["string", "number", "boolean", "null"] },
        start: {
          title: "start",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: {
                items: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                    { type: "null" },
                  ],
                },
              },
            },
            {
              if: { type: "object" },
              then: {
                oneOf: [
                  { type: "number" },
                  { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                  { type: "null" },
                ],
              },
            },
          ],
        },
        end: {
          title: "end",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: {
                items: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                    { type: "null" },
                  ],
                },
              },
            },
            {
              if: { type: "object" },
              then: {
                oneOf: [
                  { type: "number" },
                  { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                  { type: "null" },
                ],
              },
            },
          ],
        },
        center: {
          title: "center",
          description: "",
          allOf: [
            {
              if: { type: "array" },
              then: {
                items: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                    { type: "null" },
                  ],
                },
              },
            },
            {
              if: { type: "object" },
              then: {
                oneOf: [
                  { type: "number" },
                  { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
                  { type: "null" },
                ],
              },
            },
          ],
        },
        centerLevel: {
          title: "centerLevel",
          description: "",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    HtmlForm: {
      title: "HtmlForm",
      description: "",
      type: "object",
      properties: {
        enabled: {
          title: "enabled",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        defaults: {
          title: "defaults",
          description: "",
          type: "object",
          $ref: "#/$defs/HtmlFormDefaults",
        },
      },
      additionalProperties: false,
    },
    RoutingConfiguration: {
      title: "RoutingConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `ROUTING`.",
          type: ["string", "number", "boolean", "null"],
          const: "ROUTING",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "ROUTING",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        featureType: {
          title: "featureType",
          description:
            "*Required* Name of the feature type in the [feature provider with the routing     extension](../../providers/feature/extensions/routing.html) that provides the route feature     as a series of route segments. See [Routing Provider](#routing-provider) for configuring     the",
          type: ["string", "number", "boolean", "null"],
        },
        manageRoutes: {
          title: "manageRoutes",
          description:
            "Enables support for conformance class *Manage Routes*. If enabled, routes along with     their request payload are stored in the API and can be retrieved. Routes that are no longer     needed can be deleted.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        intermediateWaypoints: {
          title: "intermediateWaypoints",
          description:
            "Enables support for conformance class *Intermediate Waypoints*. If enabled, routing     requests can provide more than two waypoints along the route.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        weightRestrictions: {
          title: "weightRestrictions",
          description:
            "Enables support for conformance class *Weight Restrictions*. If enabled, routing     requests can include the weight of the vehicle and route segments will only be selected, if     they support the weight.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        heightRestrictions: {
          title: "heightRestrictions",
          description:
            "Enables support for conformance class *Height Restrictions*. If enabled, routing     requests can include the height of the vehicle and route segments will only be selected, if     they support the weight.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        obstacles: {
          title: "obstacles",
          description:
            "Enables support for conformance class *Obstacles*. If enabled, routing requests can     include a multi-polygon of areas that the route must avoid.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        speedLimitUnit: {
          title: "speedLimitUnit",
          description:
            'Sets the unit used in speed limit attributes of segments. Either "kmph" or "mph".',
          type: ["string", "number", "boolean", "null"],
        },
        defaultPreference: {
          title: "defaultPreference",
          description:
            'Sets the default value for the "preference" (cost function) in the routing request.',
          type: ["string", "number", "boolean", "null"],
        },
        defaultMode: {
          title: "defaultMode",
          description:
            'Sets the default value for the "mode" (mode of transport) in the routing request.',
          type: ["string", "number", "boolean", "null"],
        },
        additionalFlags: {
          title: "additionalFlags",
          description:
            "The routing provider supports passing additional flags (key-value-pairs) that can be     taken into account in the routing process.",
          type: "object",
          additionalProperties: { $ref: "#/$defs/RoutingFlag" },
        },
        defaultCrs: {
          title: "defaultCrs",
          description:
            "Default coordinate reference system, either `CRS84` for routing providers with 2D     coordinates, `CRS84h` for 3D coordinates.",
          type: ["string", "number", "boolean", "null"],
        },
        coordinatePrecision: {
          title: "coordinatePrecision",
          description:
            'Controls whether coordinates are limited to a certain number of places depending on the     coordinate reference system used. The unit of measurement and the corresponding number of     decimal places must be specified. Example: `{ "metre" : 2, "degree" : 7 }`. Valid units of     measurement are "metre" and "degree".',
          type: "object",
          additionalProperties: { type: "number" },
        },
        elevationProfileSimplificationTolerance: {
          title: "elevationProfileSimplificationTolerance",
          description:
            "If set, route segment geometries with 3D coordinates will be smoothened using the     Douglas-Peucker algorithm with the specified tolerance.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        html: {
          title: "html",
          description:
            'If enabled (the object includes a "enabled" member set to `true`), the HTML response to     the Get Routes operation will be enabled. The object can also include a "defaults" member     that contains key-value pairs. The following properties are supported: "name" (default name     of the route), "start" (longitude and latitude of the default start of the route), "end"     (longitude and latitude of the default end of the route), "center" (longitude and latitude     of the center point of the initial map view), "centerLevel" (WebMercatorQuad zoom level of     the initial map view).',
          type: "object",
          $ref: "#/$defs/HtmlForm",
        },
      },
      additionalProperties: false,
    },
    SortingConfiguration: {
      title: "SortingConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `SORTING`.",
          type: ["string", "number", "boolean", "null"],
          const: "SORTING",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "SORTING",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        sortables: {
          title: "sortables",
          description:
            "*Deprecated* Superseded by `included`. Controls which of the attributes in queries can     be used for sorting data. Only direct attributes of the data types `STRING`, `DATE`,     `DATETIME`, `INTEGER` and `FLOAT` are allowed (no attributes from arrays or embedded     objects).",
          deprecated: true,
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        included: {
          title: "included",
          description:
            "Controls which of the attributes in queries can be used for sorting data. Only direct     attributes of the data types `STRING`, `DATE`, `DATETIME`, `INTEGER` and `FLOAT` are     eligible as sortables (that is, no attributes from arrays or embedded objects) unless     `isSortable` is set to `false` for the property. The special value `*` includes all     eligible properties as sortables. By default, no property is sortable (this is for     backwards compatibility, in v4.0 the default behaviour will change to all eligible     properties).",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        excluded: {
          title: "excluded",
          description:
            "The list of properties that would be sortables based on `included`, but which should     not be sortables.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        pathSeparator: {
          title: "pathSeparator",
          description:
            "The character that is used as the path separator in case of object-valued properties.     Either `DOT` or `UNDERSCORE`.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    StylesConfiguration: {
      title: "StylesConfiguration",
      description:
        '### Storage       The stylesheets, style metadata and style information all reside as files in the data     directory:        - Stylesheets reside under the relative path `styles/{apiId}/{styleId}.{ext}`. The URIs (Sprites,     Glyphs, Source.url, Source.tiles) used in Mapbox styles links might contain `{serviceUrl}`.     The file extension `{ext}` must have the following value depending on the style encoding:   - Mapbox Style: `mbs`   - OGC SLD 1.0: `sld10`   - OGC SLD 1.1: `sld11`   - QGIS QML: `qml`   - ArcGIS Desktop: `lyr`   - ArcGIS Pro: `lyrx`   - 3D Tiles Styling: `3dtiles` - Style metadata reside under the relative path `styles/{apiId}/{styleId}.metadata`. Links     might be templates (by setting `templated` to `true`) containing `{serviceUrl}`. - Style information reside under the relative path `style-infos/{apiId}/{collectionId}.json`. Links     might be templates (by setting `templated` to `true`) containing `{serviceUrl}` and     `{collectionId}`.       ### Layer Control       The layer control dialog in the webmap is activated via the `webmapWithLayerControl`     option (see \'Options\' below).       The dialog can be configured in the MapLibre style metadata (member     `ldproxy:layerControl`). On the top level there are the following JSON members:        - `onlyLegend` (Boolean, default: false): With `true` only the groups and layers with the symbols are displayed without the possibility to deactivate layers. - `opened` (Boolean, default: false): If `true` is set, the layer selection dialog will be displayed open when the map is loaded. - `entries` (default: one merge group per source layer in the vector tiles): The configuration of the groups and layers as described below.            In `entries` the following items allowed:        - The `id` of a MapLibre layer in the style (string). The layer is displayed in the dialog with the `id` as name. The symbol of the layer is created without specifying attributes or a particular zoom layer. - A layer object. `id` is the `id` of the MapLibre layer in the style (string, mandatory). `label` is the name of the layer in the dialog (string, default: `id`). `zoom` is the zoom level to use when creating symbols (number, default: none). `properties` are attributes (object, default `{}`) to be used during symbol generation. - A group object. `type` is always "group". `id` is an `id` of the group (string, mandatory). `label` is the name of the group in the dialog (string, default: `id`). With `onlyLegend` the possibility to disable layers can be disabled for the group (Boolean, default: `false`). `entries` can contain layers (objects or string), groups or merge groups (array, default: `[]`). - A radio group object. It may only occur on the top level of entries. Only exactly one entry can be selected from the group, e.g. for the selection of a basemap. `type` is always "radio-group". `id`, `label` have the same effect as for normal groups. `entries` can only contain layers (objects or string) (array, default: `[]`). - A merge group object. `type` is always "merge-group". A merge group is a group where `entries` may only contain layers (objects or string) (array, default: `[]`); these entries are not displayed as subentries in the dialog, but a symbol is created from all layers together. Instead of specifying `entries`, `source-layer` (string, default: none) can be specified alternatively; in this case, all layers with this source layer become entries.            For an example, see below.',
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `STYLES`.",
          type: ["string", "number", "boolean", "null"],
          const: "STYLES",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "STYLES",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        styleEncodings: {
          title: "styleEncodings",
          description:
            'List of enabled stylesheet encodings. Supported are Mapbox/MapLibre Style (`Mapbox`),     OGC SLD 1.0 (`SLD10`), OGC SLD 1.1 (`SLD11`), QGIS QML ("QML"), ArcGIS Layer ("lyr" und     "lyrx"), 3D Tiles ("3D Tiles") and HTML (`HTML`). HTML is an output only encoding for web     maps that requires a *Mapbox/MapLibre Style* stylesheet. For details see conformance     classes *Mapbox Style*, *OGC SLD 1.0*, *OGC SLD 1.1* und *HTML*. **Upcoming change**     Currently there is no way to disable the defaults `Mapbox` and `HTML`. That will be changed     in v4, you will then have to repeat the defaults if you want to add additional encodings.',
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        managerEnabled: {
          title: "managerEnabled",
          description:
            'Option to manage styles using POST, PUT and DELETE. If `styleInfosOnCollection` is     enabled, style information may be created and updated using PATCH. Siehe die     Konformitätsklasse "Manage styles".',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        validationEnabled: {
          title: "validationEnabled",
          description:
            "Option to validate styles when using POST and PUT by setting the query parameter     `validate`. For details see conformance class *Validation of styles*.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        useIdFromStylesheet: {
          title: "useIdFromStylesheet",
          description: "",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        resourcesEnabled: {
          title: "resourcesEnabled",
          description: "*Deprecated* See `enabled` in [Modul Resources](resources.md).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        resourceManagerEnabled: {
          title: "resourceManagerEnabled",
          description: "*Deprecated* See `managerEnabled` in [Modul Resources](resources.md).",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        defaultStyle: {
          title: "defaultStyle",
          description: "*Deprecated* See `defaultStyle` in [Modul HTML](html.md).",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
        },
        deriveCollectionStyles: {
          title: "deriveCollectionStyles",
          description:
            "Only applies to styles in Mapbox Style format. Controls whether the styles at the     collection level should be derived from the styles in the parent style collection. The     prerequisite is that the name of the `source` in the stylesheet corresponds to `{apiId}`     and the name of the `source-layer` corresponds to `{collectionId}`. If a style is to be     used for displaying features in the FEATURES_HTML module, the option should be enabled.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        webmapWithPopup: {
          title: "webmapWithPopup",
          description:
            "Option to support popups in web maps for *Mapbox Style* styles that show attributes for     the top-most object.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        webmapWithLayerControl: {
          title: "webmapWithLayerControl",
          description:
            "Option to support layer controls in web maps for *Mapbox Style* styles. Allows to     collectively enable and disable all layers for a certain feature collection.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        layerControlAllLayers: {
          title: "layerControlAllLayers",
          description:
            "Option to support layer controls for additional layers like background maps. Requires     `webmapWithLayerControl: true`.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    TextSearchConfiguration: {
      title: "TextSearchConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `TEXT_SEARCH`.",
          type: ["string", "number", "boolean", "null"],
          const: "TEXT_SEARCH",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "TEXT_SEARCH",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        properties: {
          title: "properties",
          description: "Controls which of the queryable attributes are used for text search.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
      },
      additionalProperties: false,
    },
    Tiles3dConfiguration: {
      title: "Tiles3dConfiguration",
      description:
        "### Prerequisites       The module requires that the feature provider includes a type `building`. The requirements     for the type are the same as in the configuration of the [CityJSON     encoding](features_-_cityjson.html#configuration).",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `TILES3D`.",
          type: ["string", "number", "boolean", "null"],
          const: "TILES3D",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "TILES3D",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        firstLevelWithContent: {
          title: "firstLevelWithContent",
          description:
            "The first level of the tileset which will contain buildings. The value will depend on     the spatial extent of the dataset, i.e., at what level of the implicit tiling scheme large     buildings can be displayed.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        maxLevel: {
          title: "maxLevel",
          description:
            "The last level of the tileset which will contain buildings. The value will depend on     the spatial extent of the dataset, i.e., at what level of the implicit tiling scheme small     buildings can be displayed in detail.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        contentFilters: {
          title: "contentFilters",
          description:
            "A CQL2 text filter expression for each level between the `firstLevelWithContent` and     the `maxLevel` to select the buildings to include in the tile on that level. Since the     [refinement strategy](https://docs.ogc.org/cs/22-025r4/22-025r4.html#toc19) is always     `ADD`, specify disjoint filter expressions, so that each building will be included on     exactly one level.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        tileFilters: {
          title: "tileFilters",
          description:
            "A CQL2 text filter expression for each level between the `firstLevelWithContent` and     the `maxLevel` to select the buildings to include in the tile on that level or in any of     the child tiles. This filter expression is the same as all the `contentFilters` on this or     higher levels combined with an `OR`. This is also the default value. However, depending on     the filter expressions, this may lead to inefficient tile filters and to improve     performance the tile filters can also be specified explicitly.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        geometricErrorRoot: {
          title: "geometricErrorRoot",
          description:
            "The error, in meters, introduced if a tile at level 0 (root) is rendered and its     children at level 1 are not. At runtime, the geometric error is used to compute screen     space error (SSE), i.e., the error measured in pixels.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        subtreeLevels: {
          title: "subtreeLevels",
          description: "The number of levels in each Subtree.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        seeding: {
          title: "seeding",
          description:
            "Controls how and when tiles are precomputed, see [Seeding options in the Tiles building     block](tiles.md#seeding-options).",
          type: "object",
          $ref: "#/$defs/SeedingOptions",
        },
        clampToEllipsoid: {
          title: "clampToEllipsoid",
          description:
            "If set to `true`, each building will be translated vertically so that the bottom of the     building is on the WGS 84 ellipsoid. Use this option, if the data is intended to be     rendered without a terrain model.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        ionAccessToken: {
          title: "ionAccessToken",
          description:
            "If the 3D Tiles should be rendered in the integrated Cesium client using the terrain     model from Cesium Ion, specify the access token to use in requests.",
          type: ["string", "number", "boolean", "null"],
        },
        maptilerApiKey: {
          title: "maptilerApiKey",
          description:
            "If the 3D Tiles should be rendered in the integrated Cesium client using the terrain     model from MapTiler, specify the api key to use in requests.",
          type: ["string", "number", "boolean", "null"],
        },
        customTerrainProviderUri: {
          title: "customTerrainProviderUri",
          description:
            "If the 3D Tiles should be rendered in the integrated Cesium client using an external     Terrain Provider, specify the URI of the provider.",
          type: ["string", "number", "boolean", "null"],
        },
        terrainHeightDifference: {
          title: "terrainHeightDifference",
          description:
            "If the terrain does not match the height values in the data, this option can be used to     translate the buildings vertically in the integrated Cesium client.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
        style: {
          title: "style",
          description:
            "A style in the style repository of the collection to be used in maps with 3D Tiles.     With `DEFAULT` the `defaultStyle` from [module HTML](html.md) is used. With `NONE` the     default 3D Tiles style is used. The style must be available in the 3D Tiles Styling format.     If no style is found, 'NONE' is used.",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    CsvConfiguration: {
      title: "CsvConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `CSV`.",
          type: ["string", "number", "boolean", "null"],
          const: "CSV",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "CSV",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        maxMultiplicity: {
          title: "maxMultiplicity",
          description:
            "If the feature schema includes array properties, `maxMultiplicity` properties will be     created for each array property. If an instance has more values in an array, only the first     values are included in the data.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    FeaturesExtensionsConfiguration: {
      title: "FeaturesExtensionsConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `FEATURES_EXTENSIONS`.",
          type: ["string", "number", "boolean", "null"],
          const: "FEATURES_EXTENSIONS",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FEATURES_EXTENSIONS",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        postOnItems: {
          title: "postOnItems",
          description:
            '**Deprecated** Instead, use an Ad-hoc Query from [Features -     Search](#features_-_search.html). Enables support for the POST HTTP method on the     "Features" resource.',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
          deprecated: true,
        },
        intersectsParameter: {
          title: "intersectsParameter",
          description:
            'Enables support for the `intersects` query parameter on the "Features" resource',
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    FlatgeobufConfiguration: {
      title: "FlatgeobufConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `FLATGEOBUF`.",
          type: ["string", "number", "boolean", "null"],
          const: "FLATGEOBUF",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "FLATGEOBUF",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        transformations: {
          title: "transformations",
          description:
            "[Property transformations](../../providers/details/transformations.md) do not affect     data sources, they are applied on-the-fly as part of the encoding. Filter expressions do     not take transformations into account, they have to be based on the source values. That     means queryable properties (see `queryables` in [Features](features.md)) should not use     transformations in most cases. The exception to the rule is the HTML encoding, where     readability might be more important than filter support.",
          type: "object",
          additionalProperties: {
            allOf: [
              {
                if: { type: "array" },
                then: { items: { $ref: "#/$defs/PropertyTransformation" } },
              },
              { if: { type: "object" }, then: { $ref: "#/$defs/PropertyTransformation" } },
            ],
          },
        },
        maxMultiplicity: {
          title: "maxMultiplicity",
          description:
            "If the feature schema includes array properties, `maxMultiplicity` properties will be     created for each array property. If an instance has more values in an array, only the first     values are included in the data.",
          oneOf: [
            { type: "number" },
            { type: "string", pattern: "(0|-?[1-9][0-9]*)(\\.[0-9]*)?" },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    GeoJsonLdConfiguration: {
      title: "GeoJsonLdConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `GEO_JSON_LD`.",
          type: ["string", "number", "boolean", "null"],
          const: "GEO_JSON_LD",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "GEO_JSON_LD",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        contextFileName: {
          title: "contextFileName",
          description:
            "File name of the JSON-LD context document in the folder     `api-resources/json-ld-contexts/{apiId}`.",
          type: ["string", "number", "boolean", "null"],
        },
        context: {
          title: "context",
          description:
            "URI of the JSON-LD context document. The value should either be an external URI or     `{{serviceUrl}}/collections/{{collectionId}}/context` for contexts provided by the API (see     below for details). The template may contain `{{serviceUrl}}` (substituted with the API     landing page URI) and `{{collectionId}}` (substituted with the collection id).",
          type: ["string", "number", "boolean", "null"],
        },
        types: {
          title: "types",
          description: "Value of `@type` that is added to every feature.",
          allOf: [
            {
              if: { type: "array" },
              then: { items: { type: ["string", "number", "boolean", "null"] } },
            },
            { if: { type: "object" }, then: { type: ["string", "number", "boolean", "null"] } },
          ],
        },
        idTemplate: {
          title: "idTemplate",
          description:
            "Value of `@id` that is added to every feature. The template may contain     `{{serviceUrl}}` (substituted with the API landing page URI), `{{collectionId}}`     (substituted with the collection id) and `{{featureId}}` (substituted with the feature id).",
          type: ["string", "number", "boolean", "null"],
        },
      },
      additionalProperties: false,
    },
    ResourcesConfiguration: {
      title: "ResourcesConfiguration",
      description: "",
      type: "object",
      properties: {
        buildingBlock: {
          title: "buildingBlock",
          description: "Always `RESOURCES`.",
          type: ["string", "number", "boolean", "null"],
          const: "RESOURCES",
        },
        extensionType: {
          title: "extensionType",
          description: "*Deprecated* See `buildingBlock`.",
          type: ["string", "number", "boolean", "null"],
          deprecated: true,
          const: "RESOURCES",
        },
        enabled: {
          title: "enabled",
          description: "Enable the building block?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        caching: {
          title: "caching",
          description:
            "Sets fixed values for [HTTP Caching Headers](/services/README.md#caching) for the     resources.",
          type: "object",
          $ref: "#/$defs/Caching",
        },
        managerEnabled: {
          title: "managerEnabled",
          description:
            "Controls whether the resources should be able to be created and deleted via PUT and     DELETE through the API.",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
      },
      additionalProperties: false,
    },
    ExtensionConfiguration: {
      type: "object",
      properties: {},
      required: [],
      anyOf: [
        {
          required: ["buildingBlock"],
          properties: {
            buildingBlock: {
              enum: [
                "COLLECTIONS",
                "QUERYABLES",
                "COMMON",
                "CRS",
                "CITY_JSON",
                "FEATURES_CORE",
                "GEO_JSON",
                "GML",
                "FEATURES_HTML",
                "FOUNDATION",
                "HTML",
                "JSON",
                "OAS30",
                "TILE_MATRIX_SETS",
                "TILES",
                "XML",
                "SCHEMA",
                "CRUD",
                "TRANSACTIONS",
                "GLTF",
                "JSON_FG",
                "SEARCH",
                "FILTER",
                "GEOMETRY_SIMPLIFICATION",
                "PROJECTIONS",
                "ROUTING",
                "SORTING",
                "STYLES",
                "TEXT_SEARCH",
                "TILES3D",
                "CSV",
                "FEATURES_EXTENSIONS",
                "FLATGEOBUF",
                "GEO_JSON_LD",
                "RESOURCES",
              ],
            },
          },
        },
        {
          required: ["extensionType"],
          properties: {
            extensionType: {
              enum: [
                "COLLECTIONS",
                "QUERYABLES",
                "COMMON",
                "CRS",
                "CITY_JSON",
                "FEATURES_CORE",
                "GEO_JSON",
                "GML",
                "FEATURES_HTML",
                "FOUNDATION",
                "HTML",
                "JSON",
                "OAS30",
                "TILE_MATRIX_SETS",
                "TILES",
                "XML",
                "SCHEMA",
                "CRUD",
                "TRANSACTIONS",
                "GLTF",
                "JSON_FG",
                "SEARCH",
                "FILTER",
                "GEOMETRY_SIMPLIFICATION",
                "PROJECTIONS",
                "ROUTING",
                "SORTING",
                "STYLES",
                "TEXT_SEARCH",
                "TILES3D",
                "CSV",
                "FEATURES_EXTENSIONS",
                "FLATGEOBUF",
                "GEO_JSON_LD",
                "RESOURCES",
              ],
            },
          },
        },
      ],
      allOf: [
        {
          if: {
            properties: { buildingBlock: { const: "COLLECTIONS" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/CollectionsConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "COLLECTIONS" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/CollectionsConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "QUERYABLES" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/QueryablesConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "QUERYABLES" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/QueryablesConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "COMMON" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/CommonConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "COMMON" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/CommonConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "CRS" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/CrsConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "CRS" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/CrsConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "CITY_JSON" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/CityJsonConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "CITY_JSON" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/CityJsonConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "FEATURES_CORE" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/FeaturesCoreConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "FEATURES_CORE" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/FeaturesCoreConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "GEO_JSON" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/GeoJsonConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "GEO_JSON" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/GeoJsonConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "GML" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/GmlConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "GML" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/GmlConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "FEATURES_HTML" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/FeaturesHtmlConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "FEATURES_HTML" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/FeaturesHtmlConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "FOUNDATION" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/FoundationConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "FOUNDATION" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/FoundationConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "HTML" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/HtmlConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "HTML" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/HtmlConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "JSON" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/JsonConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "JSON" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/JsonConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "OAS30" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/Oas30Configuration" },
        },
        {
          if: { properties: { extensionType: { const: "OAS30" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/Oas30Configuration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "TILE_MATRIX_SETS" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/TileMatrixSetsConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "TILE_MATRIX_SETS" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/TileMatrixSetsConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "TILES" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/TilesConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "TILES" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/TilesConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "XML" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/XmlConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "XML" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/XmlConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "SCHEMA" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/SchemaConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "SCHEMA" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/SchemaConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "CRUD" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/CrudConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "CRUD" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/CrudConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "TRANSACTIONS" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/CrudConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "TRANSACTIONS" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/CrudConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "GLTF" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/GltfConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "GLTF" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/GltfConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "JSON_FG" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/JsonFgConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "JSON_FG" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/JsonFgConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "SEARCH" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/SearchConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "SEARCH" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/SearchConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "FILTER" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/FilterConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "FILTER" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/FilterConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "GEOMETRY_SIMPLIFICATION" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/GeometrySimplificationConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "GEOMETRY_SIMPLIFICATION" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/GeometrySimplificationConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "PROJECTIONS" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/ProjectionsConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "PROJECTIONS" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/ProjectionsConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "ROUTING" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/RoutingConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "ROUTING" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/RoutingConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "SORTING" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/SortingConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "SORTING" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/SortingConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "STYLES" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/StylesConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "STYLES" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/StylesConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "TEXT_SEARCH" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/TextSearchConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "TEXT_SEARCH" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/TextSearchConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "TILES3D" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/Tiles3dConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "TILES3D" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/Tiles3dConfiguration" },
        },
        {
          if: { properties: { buildingBlock: { const: "CSV" } }, required: ["buildingBlock"] },
          then: { $ref: "#/$defs/CsvConfiguration" },
        },
        {
          if: { properties: { extensionType: { const: "CSV" } }, required: ["extensionType"] },
          then: { $ref: "#/$defs/CsvConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "FEATURES_EXTENSIONS" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/FeaturesExtensionsConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "FEATURES_EXTENSIONS" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/FeaturesExtensionsConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "FLATGEOBUF" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/FlatgeobufConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "FLATGEOBUF" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/FlatgeobufConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "GEO_JSON_LD" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/GeoJsonLdConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "GEO_JSON_LD" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/GeoJsonLdConfiguration" },
        },
        {
          if: {
            properties: { buildingBlock: { const: "RESOURCES" } },
            required: ["buildingBlock"],
          },
          then: { $ref: "#/$defs/ResourcesConfiguration" },
        },
        {
          if: {
            properties: { extensionType: { const: "RESOURCES" } },
            required: ["extensionType"],
          },
          then: { $ref: "#/$defs/ResourcesConfiguration" },
        },
      ],
    },
    FeatureTypeConfigurationOgcApi: {
      title: "FeatureTypeConfigurationOgcApi",
      description: "",
      type: "object",
      properties: {
        id: {
          title: "id",
          description:
            "Unique identifier, allowed characters are (A-Z, a-z), numbers (0-9), underscore and     hyphen.",
          type: ["string", "number", "boolean", "null"],
        },
        label: {
          title: "label",
          description: "Human readable label.",
          type: ["string", "number", "boolean", "null"],
        },
        description: {
          title: "description",
          description: "Human readable description.",
          type: ["string", "number", "boolean", "null"],
        },
        enabled: {
          title: "enabled",
          description: "Enable the collection?",
          oneOf: [
            { type: "boolean" },
            {
              type: "string",
              pattern:
                "y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF",
            },
            { type: "null" },
          ],
        },
        persistentUriTemplate: {
          title: "persistentUriTemplate",
          description:
            "The *Feature* resource defines a unique URI for every feature, but this URI is only     stable as long as the API URI stays the same. For use cases where external persistent     feature URIs, which redirect to the current API URI, are used, this option allows to use     such URIs as canonical URI of every feature. To enable this option, provide an URI template     where `{{value}}` is replaced with the feature id.",
          type: ["string", "number", "boolean", "null"],
        },
        extent: {
          title: "extent",
          description: "",
          type: "object",
          $ref: "#/$defs/CollectionExtent",
        },
        additionalLinks: {
          title: "additionalLinks",
          description:
            "Array of additional link objects, required keys are `href` (the URI), `label` and `rel`     (the relation).",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/Link" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/Link" } },
          ],
        },
        api: {
          title: "api",
          description: "[Building Blocks](#building-blocks) configuration.",
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/ExtensionConfiguration" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/ExtensionConfiguration" } },
          ],
        },
        capabilities: {
          title: "capabilities",
          description: "*Deprecated* See `api`.",
          deprecated: true,
          allOf: [
            { if: { type: "array" }, then: { items: { $ref: "#/$defs/ExtensionConfiguration" } } },
            { if: { type: "object" }, then: { $ref: "#/$defs/ExtensionConfiguration" } },
          ],
        },
      },
      additionalProperties: false,
    },
  },
};
