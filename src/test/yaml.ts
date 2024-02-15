import { deepStrictEqual } from "assert";
import { parseYaml } from "../extension/utilities/yaml";
import { extractDocRefs, extractSingleRefs } from "../extension/utilities/refs";
import { buildEnumArray } from "../extension/utilities/enums";
import {
  processProperties,
  getRequiredProperties,
  findObjectsWithRef,
} from "../extension/utilities/defs";
import { expectedDefMap, expectedRef } from "./data/expected";
import { services } from "./data/services";

describe("getYamlKeys", function () {
  // create a mocha test case. To test different cases (arrays, objects, etc.), just change the
  // variables document and expectedYamlKeys.
  it("should build allYamlKeys for case array", function () {
    // variables:

    //For case Array:
    var expectedYamlKeysArray = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.metadata", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
    ];

    var documentArray = `---
api:									
  - buildingBlock: COLLECTIONS
    metadata: true`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentArray), expectedYamlKeysArray);
  });

  it("should build allYamlKeys for case arrayWithObject", function () {
    var documentArrayWithObject = `---
api:									
  - buildingBlock: COLLECTIONS
    metadata:
      email: bla`;

    var expectedYamlKeysArrayWithObjects = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.metadata", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
      { path: "api.metadata.email", index: 6, lineOfPath: 5, startOfArray: 3, arrayIndex: 0 },
    ];
    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentArrayWithObject), expectedYamlKeysArrayWithObjects);
  });

  it("should build allYamlKeys for case arrayWith2Objects", function () {
    // variables:

    var expectedYamlKeysArrayWith2Objects = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.metadata", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
      { path: "api.metadata.metadata2", index: 6, lineOfPath: 5, startOfArray: 3, arrayIndex: 0 },
      {
        path: "api.metadata.metadata2.email",
        index: 8,
        lineOfPath: 6,
        startOfArray: 3,
        arrayIndex: 0,
      },
    ];

    var documentArrayWith2Objects = `---
api:									
  - buildingBlock: COLLECTIONS
    metadata:
      metadata2: 
        email: bla`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentArrayWith2Objects), expectedYamlKeysArrayWith2Objects);
  });

  it("should build allYamlKeys for case arrayWithArray", function () {
    // variables:

    var expectedYamlKeysArrayWithArray = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks.rel", index: 8, lineOfPath: 5, startOfArray: 5, arrayIndex: 1 },
    ];

    var documentArrayWithArray = `---
api:									
  - buildingBlock: COLLECTIONS
    additionalLinks:
      - rel: describedby`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentArrayWithArray), expectedYamlKeysArrayWithArray);
  });

  it("should build allYamlKeys for case arrayWithArray", function () {
    // variables:

    var expectedYamlKeysArrayAfterArray = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks.rel", index: 8, lineOfPath: 5, startOfArray: 5, arrayIndex: 1 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 6, startOfArray: 6, arrayIndex: 1 },
    ];

    var documentArrayAfterArray = `---
api:									
  - buildingBlock: COLLECTIONS
    additionalLinks:
      - rel: describedby
  - buildingBlock: STYLES`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentArrayAfterArray), expectedYamlKeysArrayAfterArray);
  });

  it("should build allYamlKeys for case objectNotPartOfArray", function () {
    // variables:

    var expectedYamlKeysobjectNotPartOfArray = [
      { path: "metadata", index: 0, lineOfPath: 2 },
      { path: "metadata.keywords", index: 2, lineOfPath: 3 },
    ];

    var documentobjectNotPartOfArray = `---
metadata:
  keywords:
    - Umweltzonen`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentobjectNotPartOfArray), expectedYamlKeysobjectNotPartOfArray);
  });

  it("should build allYamlKeys for case objectWithObject", function () {
    // variables:

    var expectedYamlKeysobjectWithObject = [
      { path: "collections", index: 0, lineOfPath: 2 },
      { path: "collections.umweltzone", index: 2, lineOfPath: 3 },
      { path: "collections.umweltzone.id", index: 4, lineOfPath: 4 },
    ];

    var documentobjectWithObject = `---
collections:
  umweltzone:
    id: umweltzone`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentobjectWithObject), expectedYamlKeysobjectWithObject);
  });

  it("should build allYamlKeys for case objectWithArray", function () {
    // variables:

    var expectedYamlKeysobjectWithArray = [
      { path: "collections", index: 0, lineOfPath: 2 },
      { path: "collections.umweltzone", index: 2, lineOfPath: 3 },
      { path: "collections.umweltzone.additionalLinks", index: 4, lineOfPath: 4 },
      {
        path: "collections.umweltzone.additionalLinks.rel",
        index: 8,
        lineOfPath: 5,
        startOfArray: 5,
        arrayIndex: 0,
      },
    ];

    var documentobjectWithArray = `---
collections:
  umweltzone:
    additionalLinks:
      - rel: tag`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentobjectWithArray), expectedYamlKeysobjectWithArray);
  });

  it("should build allYamlKeys for case key/value", function () {
    // variables:

    var expectedYamlKeysKeyValue = [{ path: "id", index: 0, lineOfPath: 2 }];

    var documentKeyValue = `---
id: bla`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentKeyValue), expectedYamlKeysKeyValue);
  });

  it("should build allYamlKeys for all cases in 1 config", function () {
    // variables:

    var expectedYamlKeysAll = [
      { path: "id", index: 0, lineOfPath: 2 },
      { path: "api", index: 0, lineOfPath: 3 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 4, startOfArray: 4, arrayIndex: 0 },
      { path: "api.metadata", index: 4, lineOfPath: 5, startOfArray: 4, arrayIndex: 0 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 6, startOfArray: 6, arrayIndex: 1 },
      { path: "api.metadata", index: 4, lineOfPath: 7, startOfArray: 6, arrayIndex: 1 },
      { path: "api.metadata.email", index: 6, lineOfPath: 8, startOfArray: 6, arrayIndex: 1 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 9, startOfArray: 9, arrayIndex: 2 },
      { path: "api.metadata", index: 4, lineOfPath: 10, startOfArray: 9, arrayIndex: 2 },
      { path: "api.metadata.metadata2", index: 6, lineOfPath: 11, startOfArray: 9, arrayIndex: 2 },
      {
        path: "api.metadata.metadata2.email",
        index: 8,
        lineOfPath: 12,
        startOfArray: 9,
        arrayIndex: 2,
      },
      { path: "api.buildingBlock", index: 4, lineOfPath: 13, startOfArray: 13, arrayIndex: 3 },
      { path: "api.additionalLinks", index: 4, lineOfPath: 14, startOfArray: 13, arrayIndex: 3 },
      {
        path: "api.additionalLinks.rel",
        index: 8,
        lineOfPath: 15,
        startOfArray: 15,
        arrayIndex: 4,
      },
      { path: "api.buildingBlock", index: 4, lineOfPath: 16, startOfArray: 16, arrayIndex: 4 },
      { path: "metadata", index: 0, lineOfPath: 17 },
      { path: "metadata.keywords", index: 2, lineOfPath: 18 },
      { path: "collections", index: 0, lineOfPath: 20 },
      { path: "collections.umweltzone", index: 2, lineOfPath: 21 },
      { path: "collections.umweltzone.id", index: 4, lineOfPath: 22 },
      { path: "collections2", index: 0, lineOfPath: 23 },
      { path: "collections2.umweltzone", index: 2, lineOfPath: 24 },
      { path: "collections2.umweltzone.additionalLinks", index: 4, lineOfPath: 25 },
      {
        path: "collections2.umweltzone.additionalLinks.rel",
        index: 8,
        lineOfPath: 26,
        startOfArray: 26,
        arrayIndex: 0,
      },
    ];

    var documentAll = `---
id: bla
api:
  - buildingBlock: COLLECTIONS
    metadata: true
  - buildingBlock: STYLES
    metadata:
      email: bla
  - buildingBlock: TILES
    metadata:
      metadata2: 
        email: bla
  - buildingBlock: BLA
    additionalLinks:
      - rel: describedby
  - buildingBlock: BLUE
metadata:
  keywords:
    - Umweltzonen
collections:
  umweltzone:
    id: umweltzone
collections2:
  umweltzone:
    additionalLinks:
      - rel: tag`;

    // test whether the parsed data is as expected
    deepStrictEqual(parseYaml(documentAll), expectedYamlKeysAll);
  });
});

it("should build allYamlKeys for all cases even though there are illegitimate keys", function () {
  // variables:

  var expectedYamlKeysAll = [
    { path: "id", index: 0, lineOfPath: 3 },
    { path: "api", index: 0, lineOfPath: 5 },
    { path: "api.buildingBlock", index: 4, lineOfPath: 6, startOfArray: 6, arrayIndex: 0 },
    { path: "api.enabled", index: 4, lineOfPath: 8, startOfArray: 6, arrayIndex: 0 },
    { path: "api.buildingBlock", index: 4, lineOfPath: 9, startOfArray: 9, arrayIndex: 1 },
    { path: "api.metadata", index: 4, lineOfPath: 10, startOfArray: 9, arrayIndex: 1 },
    { path: "api.metadata.email", index: 6, lineOfPath: 12, startOfArray: 9, arrayIndex: 1 },
    { path: "api.buildingBlock", index: 4, lineOfPath: 13, startOfArray: 13, arrayIndex: 2 },
    { path: "api.metadata", index: 4, lineOfPath: 14, startOfArray: 13, arrayIndex: 2 },
    { path: "api.metadata.metadata2", index: 6, lineOfPath: 15, startOfArray: 13, arrayIndex: 2 },
    {
      path: "api.metadata.metadata2.email",
      index: 8,
      lineOfPath: 17,
      startOfArray: 13,
      arrayIndex: 2,
    },
    { path: "api.buildingBlock", index: 4, lineOfPath: 18, startOfArray: 18, arrayIndex: 3 },
    { path: "api.additionalLinks", index: 4, lineOfPath: 19, startOfArray: 18, arrayIndex: 3 },
    {
      path: "api.additionalLinks.rel",
      index: 8,
      lineOfPath: 20,
      startOfArray: 20,
      arrayIndex: 4,
    },
    { path: "api.buildingBlock", index: 4, lineOfPath: 21, startOfArray: 21, arrayIndex: 4 },
    { path: "collections", index: 0, lineOfPath: 22 },
    { path: "collections.umweltzone", index: 2, lineOfPath: 23 },
    { path: "collections.umweltzone.id", index: 4, lineOfPath: 25 },
  ];

  var documentAll = `---
sdsd
id: bla
sdsdsd
api:
  - buildingBlock: COLLECTIONS
    ijijiji
    enabled: true
  - buildingBlock: STYLES
    metadata:
      ijij
      email: bla
  - buildingBlock: TILES
    metadata:
      metadata2: 
        jijijij
        email: bla
  - buildingBlock: BLA
    additionalLinks:
      - rel: describedby
  - buildingBlock: BLUE
collections:
  umweltzone:
    ijijij
    id: umweltzone`;

  // test whether the parsed data is as expected
  deepStrictEqual(parseYaml(documentAll), expectedYamlKeysAll);
});

describe("defineDefs", function () {
  it("should get specifiedDefs", function () {
    // variables:

    var myDoc = `---
id: cologne_lod2
createdAt: 1676364363913
lastModified: 1676364363913
entityStorageVersion: 2
label: 3D Buildings in Cologne (LoD2)
serviceType: OGC_API
api:
  - buildingBlock: COLLECTIONS
  - buildingBlock: FEATURES_CORE
    defaultCrs: CRS84h
  - buildingBlock: CRS
    enabled: true
    additionalCrs:
      - code: 5555
        forceAxisOrder: NONE
  - buildingBlock: GEO_JSON
    enabled: false
  - buildingBlock: FEATURES_HTML
  - buildingBlock: CITY_JSON
  - buildingBlock: STYLES
  - buildingBlock: FLATGEOBUF
    enabled: false
  - buildingBlock: CSV
    enabled: false
  - buildingBlock: SCHEMA
    enabled: false
collections:
  building:
    id: building
    api:
      - buildingBlock: QUERYABLES
      - buildingBlock: SORTING
      - buildingBlock: FEATURES_HTML`;

    var expectedSpecifiedDefs = [
      { ref: "OgcApiDataV2", finalPath: "serviceType" },
      { ref: "CollectionsConfiguration", finalPath: "api.buildingBlock[0].buildingBlock" },
      {
        ref: "QueryablesConfiguration",
        finalPath: "collections.building.api.buildingBlock[0].buildingBlock",
      },
      { ref: "CrsConfiguration", finalPath: "api.buildingBlock[2].buildingBlock" },
      { ref: "CityJsonConfiguration", finalPath: "api.buildingBlock[5].buildingBlock" },
      { ref: "FeaturesCoreConfiguration", finalPath: "api.buildingBlock[1].buildingBlock" },
      { ref: "GeoJsonConfiguration", finalPath: "api.buildingBlock[3].buildingBlock" },
      { ref: "FeaturesHtmlConfiguration", finalPath: "api.buildingBlock[4].buildingBlock" },
      {
        ref: "FeaturesHtmlConfiguration",
        finalPath: "collections.building.api.buildingBlock[2].buildingBlock",
      },
      { ref: "SchemaConfiguration", finalPath: "api.buildingBlock[9].buildingBlock" },
      {
        ref: "SortingConfiguration",
        finalPath: "collections.building.api.buildingBlock[1].buildingBlock",
      },
      { ref: "StylesConfiguration", finalPath: "api.buildingBlock[6].buildingBlock" },
      { ref: "CsvConfiguration", finalPath: "api.buildingBlock[8].buildingBlock" },
      { ref: "FlatgeobufConfiguration", finalPath: "api.buildingBlock[7].buildingBlock" },
      { ref: "_TOP_LEVEL_", finalPath: "" },
    ];

    deepStrictEqual(extractDocRefs(myDoc, services), expectedSpecifiedDefs);
  });
});

describe("processProperties", function () {
  it("first time calling processProperties in getDefinitionMap", function () {
    // variables:

    var specifiedDefs = [
      { ref: "OgcApiDataV2", finalPath: "serviceType" },
      {
        ref: "QueryablesConfiguration",
        finalPath: "collections.building.api.buildingBlock[0].buildingBlock",
      },
    ];

    var schemaDefs = services.$defs;

    var definitionsMap = {};

    var actualResult;
    if (specifiedDefs && specifiedDefs.length > 0) {
      specifiedDefs.forEach((def) => {
        actualResult = processProperties(def.ref, schemaDefs, definitionsMap);
      });
    }

    deepStrictEqual(actualResult, expectedDefMap);
  });
});

describe("getRequiredProperties", function () {
  it("finding required Properties", function () {
    // variables:

    var requiredProperties = getRequiredProperties(services as any);

    var expectedRequiredProperties = {
      serviceType: {
        addRef: "",
        deprecated: false,
        description: "OGC_API",
        groupname: "requiredProperty",
        noCondition: true,
        ref: "",
        title: "serviceType",
        type: undefined,
      },
    };

    deepStrictEqual(requiredProperties, expectedRequiredProperties);
  });
});

describe("findObjectsWithRef", function () {
  it("last function from getDefinitionsMap", function () {
    // variables:

    var schemaDefs = services.$defs;
    var definitionsMap = expectedDefMap;

    var expectedAllRefsMap = [
      "ApiSecurity",
      "ExtensionConfiguration",
      "Caching",
      "FeatureTypeConfigurationOgcApi",
      "CollectionExtent",
      "ExternalDocumentation",
      "ApiMetadata",
      "Link",
      "BoundingBox",
      "TemporalExtent",
      "EpsgCrs",
    ];

    deepStrictEqual(findObjectsWithRef(definitionsMap, schemaDefs), expectedAllRefsMap);
  });
});

describe("findDefaultCfgRef", function () {
  it("findMyRef with property (metadata)", function () {
    // variables:

    var schema = services;
    var property = "metadata";

    var expectedRef = [{ ref: "ApiMetadata", finalPath: "metadata" }];

    deepStrictEqual(extractSingleRefs(schema, property), expectedRef);
  });
});

describe("findDefaultCfgRef", function () {
  it("findMyRef with discriminatorKey and Value (buildingBlock: COLLECTIONS)", function () {
    // variables:

    var schema = services;
    var property = "api";
    var discriminatorKey = "buildingBlock";
    var discriminatorValue = "COLLECTIONS";

    var expectedRef = [{ ref: "CollectionsConfiguration", finalPath: "buildingBlock" }];

    deepStrictEqual(
      extractSingleRefs(schema, property, discriminatorKey, discriminatorValue),
      expectedRef
    );
  });
});

describe("getEnums", function () {
  it("buildEnumArray", function () {
    // variables:

    var schema = services;

    deepStrictEqual(buildEnumArray(schema), expectedRef);
  });
});
