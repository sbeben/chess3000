import CreateGameForm from "~/features/create-game/CreateGameForm";

export default function PageHome() {
  return (
    <div>
      <h1>Welcome to chess3000</h1>
      <h2>Click on a button to create a game</h2>
      <CreateGameForm />
    </div>
  );
}
