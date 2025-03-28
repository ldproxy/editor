import { connect } from "@xtracfg/core";
import transport from "@xtracfg/transport-websocket";

const xtracfg = connect(transport);

async function testBasic() {
  const command = '{"command": "info", "source": "/Users/pascal/Documents/GitHub/demo"}';

  try {
    const result = await xtracfg.send(command);
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
/*
function testSubscribe() {
  if (typeof xtracfg.subscribe === "function") {
    xtracfg.subscribe(console.log); // Übergabe von console.log als Callback
  } else {
    console.error("subscribe is not a function");
  }
}

testSubscribe();
*/
testBasic();
