import { Link } from "~/shared/routing";

export default function PageAbout() {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="mt-10 flex flex-col gap-2.5 items-center max-w-[300px]">
        <h3 className="font-semibold">About the game</h3>
        <p>
          chess3000 is a variant of chess, where each player picks it's pieces, according to the value, which is set in
          advance. a bit similar to https://www.chessvariants.org/diffsetup.dir/chaotenschach.html
        </p>
        <Link href="/">
          <p className="text-end text-gray underline">Invite a friend to play</p>
        </Link>
      </div>
    </div>
  );
}
