import { Link } from "~/shared/routing";
import { H } from "~/shared/ui/components/H";
import { P } from "~/shared/ui/components/P";

export default function PageAbout() {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="mt-2 tall:mt-5 md:mt-10 flex flex-col gap-2.5 items-center max-w-[600px] px-10 w-full">
        <H variant="h2" className="font-semibold">
          About the game
        </H>
        <P className="w-full text-pretty">
          chess3000 is a chess variant where players select their pieces before the game starts.
          <br />
          Each player has a set amount of points to spend (value), and every piece has its own cost (based on
          traditional chess piece valuations).
          <br />
          Players choose their pieces independently, similar to{" "}
          <a
            className="whitespace-nowrap text-gray underline cursor-pointer"
            href="https://www.chessvariants.org/diffsetup.dir/chaotenschach.html"
          >
            chaotenschach
          </a>
          , but with 4th rank also available, and then play begins using standard chess rules.
          <br />
          For example, if you have 40 points, you can select any combination of pieces that stays within this limit.
          Once both players have chosen their pieces, the game follows regular chess movement and capture rules.
        </P>
        <Link href="/">
          <P className="text-end text-gray underline">Invite a friend to play</P>
        </Link>
      </div>
    </div>
  );
}
