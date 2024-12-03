import CreateGameForm from "~/features/create-game/CreateGameForm";
import { Heading } from "~/shared/ui/components/Heading";

export default function PageHome() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <Heading variant="h3">Invite your friend to play</Heading>
        <CreateGameForm />
      </div>
    </div>
  );
}
