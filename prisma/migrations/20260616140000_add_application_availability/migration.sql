-- Availability the applicant picks at signup (joined day/hour pills),
-- carried on the application so it can be copied onto the vendor_profile's
-- display fields at approval — keeps the public "Service area &
-- availability" card populated from day one instead of blank until the
-- vendor edits it in the dashboard.

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "service_days" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN     "service_hours" TEXT;
