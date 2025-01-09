import CreateGameForm from "~/features/create-game/CreateGameForm";
import { H } from "~/shared/ui/components/H";

export default function PageHome() {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="mt-2 tall:mt-10 sm:mt-10 flex flex-col gap-2.5 items-center">
        <H variant="h3">Invite your friend to play</H>
        <CreateGameForm />
      </div>
    </div>
  );
}
