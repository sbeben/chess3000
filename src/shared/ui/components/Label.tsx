import classNames from "classnames";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  secondary?: boolean;
  className?: string;
}

export const Label = ({ secondary = false, className, children, ...props }: LabelProps) => {
  return (
    <label
      className={classNames(
        "font-text font-semibold",
        "text-black dark:text-white",
        {
          "text-sm": !secondary,
          "text-xs": secondary,
        },
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};
