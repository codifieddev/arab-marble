import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
      <p className="text-muted max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
