export const Heading = ({
  variant = "h1",
  style,
  ...otherProps
}: { variant?: "h1" | "h2" | "h3" | "h4" } & JSX.IntrinsicElements["h1"]) => {
  const Tag = variant; // as keyof JSX.IntrinsicElements;
  return (
    <Tag
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
