import { deepStrictEqual } from "assert";
import { transformIntoYamlAndCallGetAllYamlPaths } from "../extension/utilitiesLanguageFeatures/getYamlKeys";
import { defineDefs } from "../extension/utilitiesLanguageFeatures/defineDefs";
import { services } from "../extension/utilitiesLanguageFeatures/services";
import {
  processProperties,
  getRequiredProperties,
  findObjectsWithRef,
} from "../extension/utilitiesLanguageFeatures/buildDefMap";
import { expectedDefMap } from "./constants";
import { findMyRef } from "../extension/utilitiesLanguageFeatures/findDefaultCfgRef";
import { buildEnumArray } from "../extension/utilitiesLanguageFeatures/getEnums";

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
    deepStrictEqual(transformIntoYamlAndCallGetAllYamlPaths(documentArray), expectedYamlKeysArray);
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentArrayWithObject),
      expectedYamlKeysArrayWithObjects
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentArrayWith2Objects),
      expectedYamlKeysArrayWith2Objects
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentArrayWithArray),
      expectedYamlKeysArrayWithArray
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentArrayAfterArray),
      expectedYamlKeysArrayAfterArray
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentobjectNotPartOfArray),
      expectedYamlKeysobjectNotPartOfArray
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentobjectWithObject),
      expectedYamlKeysobjectWithObject
    );
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
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentobjectWithArray),
      expectedYamlKeysobjectWithArray
    );
  });

  it("should build allYamlKeys for case key/value", function () {
    // variables:

    var expectedYamlKeysKeyValue = [{ path: "id", index: 0, lineOfPath: 2 }];

    var documentKeyValue = `---
id: bla`;

    // test whether the parsed data is as expected
    deepStrictEqual(
      transformIntoYamlAndCallGetAllYamlPaths(documentKeyValue),
      expectedYamlKeysKeyValue
    );
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
    deepStrictEqual(transformIntoYamlAndCallGetAllYamlPaths(documentAll), expectedYamlKeysAll);
  });
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

    deepStrictEqual(defineDefs(myDoc, services), expectedSpecifiedDefs);
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

    deepStrictEqual(findMyRef(schema, property), expectedRef);
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

    deepStrictEqual(findMyRef(schema, property, discriminatorKey, discriminatorValue), expectedRef);
  });
});

describe("getEnums", function () {
  it("buildEnumArray", function () {
    // variables:

    var schema = services;

    var expectedRef = [
      { key: "serviceType", enum: "OGC_API", groupname: "" },
      { key: "type", enum: "FEATURES", groupname: "TileProvider" },
      { key: "type", enum: "MBTILES", groupname: "TileProvider" },
      { key: "type", enum: "TILESERVER", groupname: "TileProvider" },
      { key: "buildingBlock", enum: "CRUD", groupname: "CrudConfiguration" },
      { key: "buildingBlock", enum: "TRANSACTIONS", groupname: "CrudConfiguration" },
      { key: "extensionType", enum: "CRUD", groupname: "CrudConfiguration" },
      { key: "extensionType", enum: "TRANSACTIONS", groupname: "CrudConfiguration" },
      { key: "buildingBlock", enum: "COLLECTIONS", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "QUERYABLES", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "COMMON", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "CRS", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "CITY_JSON", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FEATURES_CORE", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "GEO_JSON", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "GML", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FEATURES_HTML", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FOUNDATION", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "HTML", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "JSON", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "OAS30", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "TILE_MATRIX_SETS", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "TILES", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "XML", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "SCHEMA", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "GLTF", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "JSON_FG", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "SEARCH", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FILTER", groupname: "ExtensionConfiguration" },
      {
        key: "buildingBlock",
        enum: "GEOMETRY_SIMPLIFICATION",
        groupname: "ExtensionConfiguration",
      },
      { key: "buildingBlock", enum: "PROJECTIONS", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "ROUTING", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "SORTING", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "STYLES", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "TEXT_SEARCH", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "TILES3D", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "CSV", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FEATURES_EXTENSIONS", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "FLATGEOBUF", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "GEO_JSON_LD", groupname: "ExtensionConfiguration" },
      { key: "buildingBlock", enum: "RESOURCES", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "COLLECTIONS", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "QUERYABLES", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "COMMON", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "CRS", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "CITY_JSON", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FEATURES_CORE", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "GEO_JSON", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "GML", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FEATURES_HTML", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FOUNDATION", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "HTML", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "JSON", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "OAS30", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "TILE_MATRIX_SETS", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "TILES", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "XML", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "SCHEMA", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "GLTF", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "JSON_FG", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "SEARCH", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FILTER", groupname: "ExtensionConfiguration" },
      {
        key: "extensionType",
        enum: "GEOMETRY_SIMPLIFICATION",
        groupname: "ExtensionConfiguration",
      },
      { key: "extensionType", enum: "PROJECTIONS", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "ROUTING", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "SORTING", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "STYLES", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "TEXT_SEARCH", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "TILES3D", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "CSV", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FEATURES_EXTENSIONS", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "FLATGEOBUF", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "GEO_JSON_LD", groupname: "ExtensionConfiguration" },
      { key: "extensionType", enum: "RESOURCES", groupname: "ExtensionConfiguration" },
    ];

    deepStrictEqual(buildEnumArray(schema), expectedRef);
  });
});
