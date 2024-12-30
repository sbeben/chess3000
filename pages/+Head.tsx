import { colors } from "~/shared/ui/colors";

export function Head() {
  return (
    <>
      <title>chess3000</title>
      <link
        rel="icon"
        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cdefs%3E%3CradialGradient id='grad'%3E%3Cstop offset='0%25' stop-color='%239cfc24'/%3E%3Cstop offset='70%25' stop-color='transparent'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='60' r='60' fill='url(%23grad)'/%3E%3Ctext y='.9em' font-size='90'%3E♟️%3C/text%3E%3C/svg%3E"
      />
      <meta name="theme-color" content={colors.white.DEFAULT}></meta>
    </>
  );
}
