import classNames from "classnames";

export const H = ({
  variant = "h1",
  style,
  className,
  ...otherProps
}: { variant?: "h1" | "h2" | "h3" | "h4" } & JSX.IntrinsicElements["h1"]) => {
  const Tag = variant; // as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={classNames("text-black dark:text-white font-semibold", className)}
      style={{
        // fontFamily: "'Unbounded', sans-serif",
        marginTop: 0,
        marginBottom: 0,
        ...style,
      }}
      {...otherProps}
    />
  );
};
