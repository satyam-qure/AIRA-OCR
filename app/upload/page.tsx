"use client";

import { useEffect, useState, useMemo } from "react";
import { useMenubar } from "@/contexts/MenubarContext";
import FormCard from "./components/FormCard";
import { MOCK_FORMS_LIST } from "./mockData";
import Tabs from "./components/Tabs";

export default function UploadPage() {
  const { setTitle, showMenubar } = useMenubar();
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "log">("upload");

  useEffect(() => {
    setTitle("Upload data");
    showMenubar();
  }, [setTitle, showMenubar]);

  // Filter forms based on search query
  const filteredForms = useMemo(() => {
    return MOCK_FORMS_LIST;
  }, []);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-hidden">
      <div className="space-y-3 px-4 pt-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Select form for upload
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading forms...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No forms found matching your search.
            </p>
          </div>
        ) : (
          filteredForms.map((form) => <FormCard key={form.id} formData={form} />)
        )}
      </div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
