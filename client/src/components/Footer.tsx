export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] py-4 px-6 text-[#BBBBBB]">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Yogtastic. All rights reserved.</p>
      </div>
    </footer>
  );
}
