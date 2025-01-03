import classNames from "classnames";

import { colors } from "../colors";
import { Label } from "./Label";
import { P } from "./P";

// shared/ui/components/Input/types.ts
export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  className?: string;
  containerClassName?: string;
  errorText?: string;
}

export interface RangeProps extends Omit<BaseInputProps, "type"> {
  progress?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

// shared/ui/components/Input/Input.tsx
export const Input = ({ label, error, className, containerClassName, errorText, ...props }: BaseInputProps) => {
  return (
    <div className={classNames("flex flex-col gap-1", containerClassName)}>
      {label && <Label>{label}</Label>}
      <input
        className={classNames(
          "p-2 rounded border",
          "focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue",
          {
            "border-gray bg-white": !error,
            "border-red": error,
          },
          className,
        )}
        {...props}
      />
      {errorText && (
        <P secondary className="text-red">
          {errorText}
        </P>
      )}
    </div>
  );
};

// shared/ui/components/Input/NumberInput.tsx
export const NumberInput = ({ label, error, className, containerClassName, errorText, ...props }: BaseInputProps) => {
  return (
    <div className={classNames("flex flex-col gap-1", containerClassName)}>
      {label && <Label>{label}</Label>}
      <input
        type="number"
        className={classNames(
          "p-2 rounded border",
          "focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue",
          "text-black dark:text-white",
          "bg-white dark:bg-gray",
          {
            "border-gray bg-white dark:border-white": !error,
            "border-red": error,
          },
          className,
        )}
        {...props}
      />
      {errorText && (
        <P secondary className="text-red">
          {errorText}
        </P>
      )}
    </div>
  );
};

// shared/ui/components/Input/Range.tsx
export const Range = ({
  label,
  error,
  progress = 0,
  className,
  containerClassName,
  errorText,
  showValue = true,
  formatValue = (value) => String(value),
  value,
  ...props
}: RangeProps) => {
  const isDark = false;
  return (
    <div className={classNames("flex flex-col gap-1", containerClassName)}>
      {label && <Label>{label}</Label>}
      <input
        type="range"
        value={value}
        className={classNames(
          "appearance-none h-2 rounded",
          "border",
          {
            "border-gray": !error,
            "border-red": error,
          },
          className,
        )}
        style={{
          WebkitAppearance: "none",
          background: `linear-gradient(to right, 
              #9cfc24 ${progress}%, 
              ${isDark ? colors.gray.DEFAULT : colors.white.DEFAULT} ${progress}%
            )`,
        }}
        {...props}
      />
      {showValue && (
        <P secondary className="text-right w-full">
          {formatValue(Number(value))}
        </P>
      )}
      {errorText && (
        <P secondary className="text-red">
          {errorText}
        </P>
      )}
    </div>
  );
};
