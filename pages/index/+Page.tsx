import { useGate, useUnit } from "effector-react";

import { createGameClicked, gate } from "./model";

export default function PageHome() {
  const create = useUnit(createGameClicked);
  useGate(gate);

  return (
    <div>
      <h1>Welcome to chess3000</h1>
      <h2>Click on a button to create a game</h2>
      <button onClick={() => create()}>lesgoo</button>
    </div>
  );
}
