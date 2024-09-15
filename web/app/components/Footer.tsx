export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 text-center text-zinc-600 dark:text-zinc-400">
      <p className="text-xs">
        &copy; {currentYear} TubeQuery. All rights reserved.
      </p>
    </footer>
  );
}
