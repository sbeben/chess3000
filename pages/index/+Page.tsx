import CreateGameForm from "~/features/create-game/CreateGameForm";

export default function PageHome() {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="mt-10 flex flex-col gap-2.5 items-center">
        <h3 className="font-semibold">Invite your friend to play</h3>
        <CreateGameForm />
      </div>
    </div>
  );
}
