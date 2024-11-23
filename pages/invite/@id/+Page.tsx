import { useGate, useUnit } from "effector-react";
import { Link } from "~/shared/routing";

import { $id, accepted, declined, gate } from "./model";

export function Page() {
  const { id } = useUnit({ id: $id, acceptClicked: accepted, declineClicked: declined });
  useGate(gate);
  return (
    <div>
      <h1>Someone invited you to play</h1>
      <p>gameId: {id}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => accepted()}>Accept</button>
        <button onClick={() => declined()}>Decline</button>
      </div>

      <Link href="/">Go home</Link>
    </div>
  );
}
