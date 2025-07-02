import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <p className="text-gray-700 dark:text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
}