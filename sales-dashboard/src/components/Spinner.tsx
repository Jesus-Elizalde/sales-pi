export default function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <svg
        className="animate-spin h-6 w-6 text-gray-600"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}

// components/ErrorBanner.tsx
interface ErrorBannerProps {
  message: string;
}
export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 text-red-700">
      Error: {message}
    </div>
  );
}
