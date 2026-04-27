import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, FileImage, FileText } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Page, Talent } from '../../types';

interface QRCodeCardProps {
  page: Page;
  talent?: Talent;
  publicUrl: string;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ page, talent, publicUrl }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const title = page.qrCard?.title || talent?.nameEn || page.content.hero.nameEn || 'Portfolio';
  const subtitle = page.qrCard?.subtitle || talent?.position || page.content.hero.tagline || 'Scan to view';

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download PNG', err);
    }
  };

  const downloadSVG = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toSvg(cardRef.current);
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_QR.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download SVG', err);
    }
  };

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [cardRef.current.offsetWidth, cardRef.current.offsetHeight]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, cardRef.current.offsetWidth, cardRef.current.offsetHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}_QR.pdf`);
    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={cardRef}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-6 w-80"
        style={{ background: 'linear-gradient(145deg, #ffffff, #f3f4f6)' }}
      >
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black tracking-tight text-gray-900">{title}</h3>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{subtitle}</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-50">
          <QRCodeSVG 
            value={publicUrl} 
            size={200} 
            level="H" 
            includeMargin={false}
            fgColor="#111827"
            bgColor="#ffffff"
          />
        </div>
        
        <div className="text-center w-full">
          <p className="text-xs font-mono text-gray-400 break-all bg-gray-50 p-2 rounded-lg border border-gray-100">
            {publicUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={downloadPNG}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg"
        >
          <FileImage size={16} />
          <span>PNG</span>
        </button>
        <button 
          onClick={downloadSVG}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          <FileImage size={16} />
          <span>SVG</span>
        </button>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          <FileText size={16} />
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeCard;
