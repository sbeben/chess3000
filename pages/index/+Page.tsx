import { useEffect } from "react";

import { useGate, useUnit } from "effector-react";
import { Link } from "~/shared/routing";

import { createGameClicked, gate } from "./model";

export default function PageHome() {
  const create = useUnit(createGameClicked);
  // const navigate = useUnit(navigateClicked);
  useGate(gate);

  return (
    <div>
      <h1>Welcome to chess3000</h1>
      <h2>Click on a button to create a game</h2>
      <button onClick={() => create()}>lesgoo</button>
      {/* <button onClick={() => navigate()}>lesgoo</button> */}
      {/* <button onClick={() => send({ type: "move", data: "e2" })}>send hello</button> */}
      {/* <p>Random from server: {random}</p>*/}
      {/* <Link href={`/example/123`}>Go to /example/123</Link> */}
    </div>
  );
}
