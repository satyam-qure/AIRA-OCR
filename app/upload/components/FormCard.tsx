"use client";

import { PlusIcon, Calendar } from "lucide-react";
import Link from "next/link";
import type { FormData } from "../types";

interface FormCardProps {
  formData: FormData;
}

const FormCard = ({ formData }: FormCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/upload/${formData.id}`}
      className="group block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-teal-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {formData.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {formData.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={14} />
            <span>Last updated: {formatDate(formData.last_updated)}</span>
          </div>
        </div>
        <button
          className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition-all duration-200 hover:bg-teal-100 hover:shadow-md dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
          aria-label={`Upload ${formData.name}`}
        >
          <PlusIcon size={24} />
        </button>
      </div>
    </Link>
  );
};

export default FormCard;
