import { useForm } from "effector-forms";
import { useUnit } from "effector-react";
import type { CreateGameColor } from "~/shared/api/rest";

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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>Value</label>
        <input
          type="number"
          value={fields.value.value ?? ""}
          onChange={(e) => fields.value.onChange(Number(e.target.value))}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          placeholder="Enter value"
        />
        {fields.value.firstError?.errorText && (
          <span style={{ color: "red" }}>{fields.value.firstError.errorText}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>Color</label>
        <select
          value={fields.color.value ?? ""}
          onChange={(e) => fields.color.onChange(e.target.value as CreateGameColor)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        {fields.color.firstError?.errorText && (
          <span style={{ color: "red" }}>{fields.color.firstError.errorText}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", fontSize: "small" }}>Time</label>
        <input
          type="range"
          min="0"
          max={timeControls.length - 1}
          value={timeControls.indexOf(fields.time.value)}
          onChange={(e) => fields.time.onChange(timeControls[Number(e.target.value)]!)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <span>{fields.time.value}</span>
        {fields.time.firstError?.errorText && <span style={{ color: "red" }}>{fields.time.firstError.errorText}</span>}
      </div>
      <button
        type="submit"
        style={{
          padding: "10px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          cursor: "pointer",
        }}
      >
        Create Game
      </button>
    </form>
  );
};

export default CreateGameForm;
