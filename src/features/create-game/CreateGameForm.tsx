import { useForm } from "effector-forms";
import { useUnit } from "effector-react";
import type { CreateGameColor } from "~/shared/api/rest";
import { colors } from "~/shared/ui/colors";

import { $timeControls, createGameClicked, gameForm } from "./model";

const CreateGameForm = () => {
  const { fields } = useForm(gameForm);
  const { handleCreateGame, timeControls } = useUnit({
    handleCreateGame: createGameClicked,
    timeControls: $timeControls,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateGame();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "300px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "4px" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>value</label>
        <input
          type="number"
          value={fields.value.value ?? ""}
          onChange={(e) => fields.value.onChange(Number(e.target.value))}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: `1px solid ${colors.gray.DEFAULT}`,
            background: colors.white.DEFAULT,
          }}
          placeholder="Enter value"
        />
        {fields.value.firstError?.errorText && (
          <span style={{ color: "red" }}>{fields.value.firstError.errorText}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>color</label>
        <select
          value={fields.color.value ?? ""}
          onChange={(e) => fields.color.onChange(e.target.value as CreateGameColor)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: `1px solid ${colors.gray.DEFAULT}`,
            background: colors.white.DEFAULT,
          }}
        >
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        {fields.color.firstError?.errorText && (
          <span style={{ color: "red" }}>{fields.color.firstError.errorText}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>time</label>
        <input
          type="range"
          min="0"
          max={timeControls.length - 1}
          value={timeControls.indexOf(fields.time.value)}
          onChange={(e) => fields.time.onChange(timeControls[Number(e.target.value)]!)}
          style={{
            // padding: "4px",
            borderRadius: "4px",
            border: `1px solid ${colors.gray.DEFAULT}`,
            WebkitAppearance: "none",
            appearance: "none",
            background: `linear-gradient(to right, 
            ${colors.green_yellow.DEFAULT} ${(timeControls.indexOf(fields.time.value) / (timeControls.length - 1)) * 100}%, 
            ${colors.white.DEFAULT} ${(timeControls.indexOf(fields.time.value) / (timeControls.length - 1)) * 100}%
          )`,
            height: "8px",
          }}
        />
        <span style={{ textAlign: "end", width: "100%" }}>{fields.time.value}</span>
        {fields.time.firstError?.errorText && <span style={{ color: "red" }}>{fields.time.firstError.errorText}</span>}
      </div>
      <button
        type="submit"
        style={{
          padding: "10px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: colors.blue.DEFAULT,
          color: "white",
          cursor: "pointer",
        }}
      >
        CREATE GAME
      </button>
    </form>
  );
};

export default CreateGameForm;
