"use client";

import classNames from "classnames";
import { LogsIcon, PlusSquare } from "lucide-react";

const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "upload" | "log";
  setActiveTab: (tab: "upload" | "log") => void;
}) => {
  const handleTabClick = (tab: "upload" | "log") => {
    setActiveTab(tab);
  };
  return (
    <div className="flex items-center bg-white/60 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <div
        onClick={() => handleTabClick("upload")}
        className={classNames(
          "text-sm font-medium transition-colors flex flex-1 justify-center items-center gap-2 p-4 cursor-pointer",
          {
            "border-t-2 border-teal-500 text-teal-600 dark:text-teal-400 bg-white/90 dark:bg-gray-900":
              activeTab === "upload",
            "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400":
              activeTab !== "upload",
          }
        )}
      >
        <PlusSquare className="h-4 w-4" />
        <p>Upload</p>
      </div>
      <div
        onClick={() => handleTabClick("log")}
        className={classNames(
          "text-sm font-medium transition-colors flex flex-1 justify-center items-center gap-2 p-4 cursor-pointer",
          {
            "border-t-2 border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-gray-900":
              activeTab === "log",
            "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400":
              activeTab !== "log",
          }
        )}
      >
        <LogsIcon className="h-4 w-4" />
        <p>Log</p>
      </div>
    </div>
  );
};

export default Tabs;
