import { useForm } from "effector-forms";
import { useUnit } from "effector-react";
import { Link } from "~/shared/routing";
import { colors } from "~/shared/ui/colors";
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
      <div className="flex flex-col w-full gap-1">
        <label className="font-bold text-sm">value</label>
        <input
          type="number"
          value={value.value ?? ""}
          onChange={(e) => value.onChange(Number(e.target.value))}
          className={`p-2 rounded border border-gray bg-white shadow-none focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue`}
          placeholder="Enter value"
        />
        {value.firstError?.errorText && <span className="text-red">{value.firstError.errorText}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">color</label>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div
              onClick={() => color.onChange("white")}
              className={`bg-white rounded border ${
                color.value === "white" ? "border-[3px] border-blue" : "border border-gray"
              } ${color.value === "white" ? "h-[60px] w-[60px]" : "h-[40px] w-[40px]"}`}
            />
            <span className="mt-1">white</span>
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
            <span className="mt-1">random</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              onClick={() => color.onChange("black")}
              className={`bg-black rounded border ${
                color.value === "black" ? "border-[3px] border-blue" : "border border-gray"
              } ${color.value === "black" ? "h-[60px] w-[60px]" : "h-[40px] w-[40px]"}`}
            />
            <span className="mt-1">black</span>
          </div>
        </div>
        {color.firstError?.errorText && <span className="text-red">{color.firstError.errorText}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">time</label>
        <input
          type="range"
          min={0}
          max={timeControls.length - 1}
          value={timeControls.indexOf(time.value)}
          onChange={(e) => time.onChange(timeControls[Number(e.target.value)]!)}
          style={{
            borderRadius: "4px",
            border: `1px solid ${time.value > 0 ? colors.gray.DEFAULT : colors.red.DEFAULT}`,
            WebkitAppearance: "none",
            appearance: "none",
            background: `linear-gradient(to right, 
            ${colors.green_yellow.DEFAULT} ${(timeControls.indexOf(time.value) / (timeControls.length - 1)) * 100}%, 
            ${colors.white.DEFAULT} ${(timeControls.indexOf(time.value) / (timeControls.length - 1)) * 100}%
          )`,
            height: "8px",
          }}
        />
        <span className="text-right w-full">{formatSeconds(time.value)}</span>
        {time.firstError?.errorText && <span className="text-red">{time.firstError.errorText}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">increment</label>
        <input
          type="range"
          min={0}
          max={increments.length - 1}
          value={increments.indexOf(increment.value)}
          onChange={(e) => increment.onChange(increments[Number(e.target.value)]!)}
          style={{
            borderRadius: "4px",
            border: `1px solid ${time.value > 0 ? colors.gray.DEFAULT : colors.red.DEFAULT}`,
            WebkitAppearance: "none",
            appearance: "none",
            background: `linear-gradient(to right, 
            ${colors.green_yellow.DEFAULT} ${(increments.indexOf(increment.value) / (increments.length - 1)) * 100}%, 
            ${colors.white.DEFAULT} ${(increments.indexOf(increment.value) / (increments.length - 1)) * 100}%
          )`,
            height: "8px",
          }}
        />
        <span className="text-right w-full">{formatSeconds(increment.value)}</span>
        {increment.firstError?.errorText && <span className="text-red">{increment.firstError.errorText}</span>}
      </div>

      <Link href="about">
        <p className="text-end text-gray underline">what are the rules?</p>
      </Link>

      <button type="submit" className="p-2.5 rounded bg-blue-500 text-white border-none cursor-pointer">
        CREATE GAME
      </button>
    </form>
  );
};

export default CreateGameForm;
