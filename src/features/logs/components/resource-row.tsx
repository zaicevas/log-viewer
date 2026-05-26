import { CopyValueButton } from "./copy-value-button";

type Props = {
  label: string;
  value: string | undefined;
};

export function ResourceRow({ label, value }: Props) {
  return (
    <div className="group contents">
      <span className="text-muted-foreground flex items-center font-mono">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="text-foreground line-clamp-2 min-w-0 font-mono wrap-anywhere"
          title={value}
        >
          {value ?? "—"}
        </span>
        {value ? <CopyValueButton value={value} label={label} /> : null}
      </div>
    </div>
  );
}
