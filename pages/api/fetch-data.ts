import type { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";

const CSV_DRIVE_URL =
  "https://drive.usercontent.google.com/u/0/uc?id=1U_vGR_Uwz18ciibqowO32U-0X3a1kL9_&export=download";

const fetchCSVDataFromDrive = async () => {
  try {
    const response = await fetch(CSV_DRIVE_URL);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<string[]>(csvText, {
        complete: (result) => resolve(result.data as string[][]),
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error fetching CSV data from Google Drive:", error);
    return [];
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: string[][] }>,
) {
  const csvData = await fetchCSVDataFromDrive();

  res.status(200).json({ data: csvData as string[][] });
}
