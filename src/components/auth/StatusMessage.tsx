import { TypeStatusMessageProps } from "@/types/auth";

export const StatusMessage = ({ message, type }: TypeStatusMessageProps) => {
  const bgColor = type === "error" ? "bg-destructive/15" : "bg-green-500/15";
  const textColor = type === "error" ? "text-destructive" : "text-green-500";

  return (
    <div className={`rounded-md ${bgColor} p-3 text-sm ${textColor}`}>
      {message}
    </div>
  );
};