import { useGate, useUnit } from "effector-react";
import { Button } from "~/shared/ui/components/Button";
import { H } from "~/shared/ui/components/H";
import { P } from "~/shared/ui/components/P";
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
    <div className="h-full w-full flex justify-center">
      <div className="mt-2 tall:mt-10 sm:mt-10 flex flex-col gap-4 items-center">
        <H variant="h3" className="text-center">
          Someone invited you to play
        </H>

        <div className="text-center">
          <H variant="h4" className="inline">
            Your color:{" "}
          </H>
          <P className="inline">{color}</P>
          <br />
          <H variant="h4" className="inline">
            Time control:{" "}
          </H>
          <P className="inline">{formatSeconds(time)} min</P>
          <br />
          <H variant="h4" className="inline">
            Increment:{" "}
          </H>
          <P className="inline">{increment} sec</P>
        </div>

        <div className="flex gap-4 items-center justify-center">
          <Button onClick={acceptClicked}>ACCEPT</Button>
          <Button variant="danger" onClick={declineClicked}>
            DECLINE
          </Button>
        </div>
      </div>
    </div>
  );
}
