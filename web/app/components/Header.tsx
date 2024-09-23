import Logo from "./Logo";

export default function Header() {
  return (
    <header className="flex justify-center items-center w-full max-w-2xl mx-auto p-6">
      <Logo size="base" />
    </header>
  );
}
