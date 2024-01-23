import { deepStrictEqual } from "assert";
import { transformIntoYamlAndCallGetAllYamlPaths } from "../extension/utilitiesLanguageFeatures/getYamlKeys";

// getYamlKeys test
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
