import { LogoutButton } from "./logout-button";

type HeaderProps = {
  email: string;
};

export function Header({ email }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="text-sm text-muted-foreground">
        Hola <span className="text-foreground">{email}</span>
      </div>
      <LogoutButton />
    </header>
  );
}
