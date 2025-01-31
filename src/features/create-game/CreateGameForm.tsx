import { useForm } from "effector-forms";
import { useUnit } from "effector-react";
import { Link } from "~/shared/routing";
import { Button } from "~/shared/ui/components/Button";
import { NumberInput, Range } from "~/shared/ui/components/Input";
import { Label } from "~/shared/ui/components/Label";
import { P } from "~/shared/ui/components/P";
import { formatSeconds } from "~/shared/utils/format";

import { $increments, $timeControls, createGameClicked, gameForm } from "./model";

const CreateGameForm = () => {
  const {
    fields: { value, color, time, increment },
  } = useForm(gameForm);
  const { handleCreateGame, timeControls, increments } = useUnit({
    handleCreateGame: createGameClicked,
    timeControls: $timeControls,
    increments: $increments,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateGame();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 w-full max-w-[300px]">
      <NumberInput
        label="value"
        value={value.value ?? ""}
        //@ts-expect-error
        onChange={(e) => value.onChange(e.target.value ? Number(e.target.value) : null)}
        error={!!value.firstError}
        errorText={value.firstError?.errorText}
        placeholder="total pieces value"
      />

      <div className="flex flex-col gap-1">
        <Label>color</Label>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div
              onClick={() => color.onChange("white")}
              className={`bg-white rounded border ${
                color.value === "white" ? "border-[3px] border-blue" : "border border-gray"
              } ${color.value === "white" ? "h-[60px] w-[60px]" : "h-[40px] w-[40px]"}`}
            />
            <P className="mt-1">white</P>
          </div>

          <div className="flex flex-col items-center">
            <div
              onClick={() => color.onChange("random")}
              className={`rounded border ${
                color.value === "random" ? "border-[3px] border-blue" : "border border-gray"
              } ${
                color.value === "random" ? "h-[60px] w-[60px]" : "h-[40px] w-[40px]"
              } grid grid-cols-2 grid-rows-2 overflow-hidden`}
            >
              <div className="bg-white" />
              <div className="bg-black" />
              <div className="bg-black" />
              <div className="bg-white" />
            </div>
            <P className="mt-1">random</P>
          </div>

          <div className="flex flex-col items-center">
            <div
              onClick={() => color.onChange("black")}
              className={`bg-black rounded border ${
                color.value === "black" ? "border-[3px] border-blue" : "border border-gray"
              } ${color.value === "black" ? "h-[60px] w-[60px]" : "h-[40px] w-[40px]"}`}
            />
            <P className="mt-1">black</P>
          </div>
        </div>
      </div>

      <Range
        label="time"
        min={0}
        max={timeControls.length - 1}
        value={timeControls.indexOf(time.value)}
        onChange={(e) => time.onChange(timeControls[Number(e.target.value)]!)}
        error={!!time.firstError || time.value === 0}
        errorText={time.firstError?.errorText}
        progress={(timeControls.indexOf(time.value) / (timeControls.length - 1)) * 100}
        formatValue={(value) => formatSeconds(timeControls[value]!)}
      />

      <Range
        label="increment"
        min={0}
        max={increments.length - 1}
        value={increments.indexOf(increment.value)}
        onChange={(e) => increment.onChange(increments[Number(e.target.value)]!)}
        error={!!increment.firstError || time.value === 0}
        errorText={increment.firstError?.errorText}
        progress={(increments.indexOf(increment.value) / (increments.length - 1)) * 100}
        formatValue={(value) => formatSeconds(increments[value]!)}
      />

      <Link href="about">
        <P secondary className="text-end text-gray underline">
          what are the rules?
        </P>
      </Link>

      <Button type="submit" className="p-2">
        CREATE GAME
      </Button>
    </form>
  );
};

export default CreateGameForm;
