interface HeaderProps {
  label: string;
  head: string;
}

export const Header = ({head,  label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className="text-3xl font-semibold">{head}</h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};
