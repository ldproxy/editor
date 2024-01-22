import { deepStrictEqual } from "assert";
import { transformIntoYamlAndCallGetAllYamlPaths } from "../extension/utilitiesLanguageFeatures/getYamlKeys";

// getYamlKeys test
describe("getYamlKeys", function () {
  // create a mocha test case. To test different cases (arrays, objects, etc.), just change the
  // variables document, yamlObject and expectedYamlKeys.(yamlObject is a representation of document)
  it("should build allYamlKeys object", function () {
    // variables:

    //For case Array:
    var expectedYamlKeysArray = [
      { path: "api", index: 0, lineOfPath: 2 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 3, startOfArray: 3, arrayIndex: 0 },
      { path: "api.resourcesEnabled", index: 4, lineOfPath: 4, startOfArray: 3, arrayIndex: 0 },
      { path: "api.queryables", index: 4, lineOfPath: 5, startOfArray: 3, arrayIndex: 0 },
      { path: "api.queryables.spatial", index: 6, lineOfPath: 6, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks", index: 4, lineOfPath: 8, startOfArray: 3, arrayIndex: 0 },
      { path: "api.additionalLinks.rel", index: 8, lineOfPath: 9, startOfArray: 9, arrayIndex: 1 },
      {
        path: "api.additionalLinks.rel",
        index: 8,
        lineOfPath: 10,
        startOfArray: 10,
        arrayIndex: 2,
      },
      { path: "api.linknumber", index: 4, lineOfPath: 11, startOfArray: 3, arrayIndex: 0 },
      { path: "api.buildingBlock", index: 4, lineOfPath: 12, startOfArray: 12, arrayIndex: 1 },
    ];

    var documentArray = `---
api:
  - buildingBlock: STYLES
    resourcesEnabled: false
    queryables:
      spatial:
        - geometry
    additionalLinks:
      - rel: describedby
      - rel: enclosure
    linknumber: 1
  - buildingBlock: COLLECTIONS`;

    // test whether the parsed data is as expected
    deepStrictEqual(transformIntoYamlAndCallGetAllYamlPaths(documentArray), expectedYamlKeysArray);
  });
});
