//src/app/page.tsx


import Link from "next/link";
import Image from "next/image";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bglight dark:bg-bgdark p-4">
      <h1 className="text-4xl font-bold mb-4 text-textlight dark:text-textdark">
        Defy App
      </h1>
      <Image
        src="/assets/landing/Bujey_robe.png"
        alt="Bujey Robe"
        width={300}
        height={400}
        className="mb-6 rounded-lg"
      />
      <div className="space-x-4">
        <Link
          href="/register"
          className="bg-buttonBackground text-buttonText px-4 py-2 rounded hover:bg-buttonHover"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="bg-buttonBackground text-buttonText px-4 py-2 rounded hover:bg-buttonHover"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
