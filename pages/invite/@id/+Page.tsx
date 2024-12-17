import { useGate, useUnit } from "effector-react";
import { Button } from "~/shared/ui/components/Button";
import { formatSeconds } from "~/shared/utils/format";

import { $color, $id, $increment, $time, accepted, declined, gate } from "./model";

export function Page() {
  const { id, acceptClicked, declineClicked, color, time, increment } = useUnit({
    id: $id,
    acceptClicked: accepted,
    declineClicked: declined,
    color: $color,
    time: $time,
    increment: $increment,
  });
  useGate(gate);
  return (
    <div>
      <div className="h-full w-full flex justify-center">
        <div className="mt-10 flex flex-col gap-2.5 items-center">
          <h3 className="font-semibold text-center">Someone invited you to play</h3>
          <div className="text-center">
            <h4 className="inline">Your color: </h4>
            <p className="inline">{color}</p>
            <br />
            <h4 className="inline">Time control: </h4>
            <p className="inline">{formatSeconds(time)} min</p>
            <br />
            <h4 className="inline">Increment: </h4>
            <p className="inline">{increment} sec</p>
          </div>

          <div className="flex gap-4 items-center justify-center">
            <Button onClick={acceptClicked}>accept</Button>
            <Button variant="danger" onClick={declineClicked}>
              decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
