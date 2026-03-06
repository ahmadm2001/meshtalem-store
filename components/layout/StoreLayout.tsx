import Header from './Header';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} משתלם - כל הזכויות שמורות</p>
      </footer>
    </div>
  );
}
