import {FC} from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button"

interface ExportPDFProps {
  imagePaths: string[];
}

const ExportPDF: FC<ExportPDFProps> = ({ imagePaths }) => {
  const handleExportPDF = async () => {
    const pdf = new jsPDF();
    let isFirstPage = true; // To handle adding new pages

    for (const imagePath of imagePaths) {
      const img = new Image();
      img.src = imagePath;

      await new Promise<void>((resolve) => {
        img.onload = () => {
          const imgWidth = 180; // Set width to fit page
          const imgHeight = (img.height * imgWidth) / img.width; // Maintain aspect ratio

          if (!isFirstPage) {
            pdf.addPage();
          } else {
            isFirstPage = false;
          }

          pdf.addImage(img, "JPEG", 15, 10, imgWidth, imgHeight);
          resolve();
        };
      });
    }

    pdf.save("exported-images.pdf");
  };

  return <Button onClick={handleExportPDF} className="w-[150px]">Export PDF</Button>;
};

export default ExportPDF;
