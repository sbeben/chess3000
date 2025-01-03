import classNames from "classnames";

// shared/ui/components/P.tsx
interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {
  secondary?: boolean;
  className?: string;
}

export const P = ({ secondary = false, className, children, ...props }: PProps) => {
  return (
    <p
      className={classNames(
        "leading-relaxed",
        "text-black dark:text-white",
        {
          "text-base sm:text-lg": !secondary,
          "text-sm sm:text-base": secondary,
        },
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
};
