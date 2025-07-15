import { BatchesCalendar } from "@/components/BatchesCalendar";

export default function BatchesPage() {
  return (
    <div className="container mx-auto py-4 sm:py-10 px-4 sm:px-6">
          <div className="w-full max-w-none">
            <div className="bg-white rounded-lg border shadow-sm">
              {/* <div className="p-4 sm:p-6 border-b">
                <h1 className="text-xl sm:text-2xl font-bold">2025 Batch Schedule</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Financial overview of all batches for 2025</p>
              </div> */}
              <div className="p-4 sm:p-6">
                <BatchesCalendar />
              </div>
            </div>
          </div>
        </div>
  );
}