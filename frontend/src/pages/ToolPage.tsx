import { useParams, Link } from 'react-router-dom';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Tool } from '../types';
import { getToolBySlug, categoryMeta } from '../data/tools';
import { getSeoForSlug } from '../data/seo';
import { Seo } from '../components/Seo';
import { ToolIcon } from '../components/tools/ToolIcon';
import { FileUploader } from '../components/tools/FileUploader';
import { ToolPageLayout, ResultCard, ProcessingSection } from '../components/tools/ToolPageLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToolProcessor, useDocumentTitle } from '../hooks/useToolProcessor';

import PdfCompressTool from '../tools/PdfCompressTool';
import PdfMergeTool from '../tools/PdfMergeTool';
import PdfSplitTool from '../tools/PdfSplitTool';
import PdfRotateTool from '../tools/PdfRotateTool';
import PdfDeletePagesTool from '../tools/PdfDeletePagesTool';
import PdfExtractPagesTool from '../tools/PdfExtractPagesTool';
import PdfProtectTool from '../tools/PdfProtectTool';
import PdfUnlockTool from '../tools/PdfUnlockTool';
import PdfWatermarkTool from '../tools/PdfWatermarkTool';
import PdfPageNumbersTool from '../tools/PdfPageNumbersTool';
import PdfCropTool from '../tools/PdfCropTool';
import PdfCompareTool from '../tools/PdfCompareTool';
import PdfFlattenTool from '../tools/PdfFlattenTool';
import PdfRepairTool from '../tools/PdfRepairTool';
import PdfRedactTool from '../tools/PdfRedactTool';
import PdfToImageTool from '../tools/PdfToImageTool';
import PdfReaderTool from '../tools/PdfReaderTool';
import ImageToPdfTool from '../tools/ImageToPdfTool';
import TextToPdfTool from '../tools/TextToPdfTool';
import HtmlToPdfTool from '../tools/HtmlToPdfTool';
import GenericConversionTool from '../tools/GenericConversionTool';
import AiChatTool from '../tools/AiChatTool';
import AiSummarizerTool from '../tools/AiSummarizerTool';
import QrCodeTool from '../tools/QrCodeTool';
import ImageConverterTool from '../tools/ImageConverterTool';
import ImageCompressorTool from '../tools/ImageCompressorTool';
import WordCounterTool from '../tools/WordCounterTool';
import PasswordGeneratorTool from '../tools/PasswordGeneratorTool';
import JsonFormatterTool from '../tools/JsonFormatterTool';
import Base64Tool from '../tools/Base64Tool';
import AgeCalculatorTool from '../tools/AgeCalculatorTool';
import PasswordStrengthTool from '../tools/PasswordStrengthTool';
import HashGeneratorTool from '../tools/HashGeneratorTool';
import FileEncryptorTool from '../tools/FileEncryptorTool';
import OCRTool from '../tools/OCRTool';
import AnnotateTool from '../tools/AnnotateTool';
import FormFillerTool from '../tools/FormFillerTool';
import CreateFormTool from '../tools/CreateFormTool';
import SharePDFTool from '../tools/SharePDFTool';
import SignPDFTool from '../tools/SignPDFTool';
import RequestSignaturesTool from '../tools/RequestSignaturesTool';
import TranslatePDFTool from '../tools/TranslatePDFTool';
import ZipToPdfTool from '../tools/ZipToPdfTool';
import HwpToPdfTool from '../tools/HwpToPdfTool';
import PagesToPdfTool from '../tools/PagesToPdfTool';

type ToolComponent = ComponentType<{ tool: Tool }>;

/** Maps every registry slug (including duplicates) to its implementation. */
const toolComponents: Record<string, ToolComponent> = {
  'compress-pdf': PdfCompressTool,
  'merge-pdf': PdfMergeTool,
  'split-pdf': PdfSplitTool,
  'rotate-pdf': PdfRotateTool,
  'rotate-pdf-2': PdfRotateTool,
  'delete-pdf-pages': PdfDeletePagesTool,
  'extract-pdf-pages': PdfExtractPagesTool,
  'organize-pdf': PdfExtractPagesTool,
  'protect-pdf': PdfProtectTool,
  'unlock-pdf': PdfUnlockTool,
  'watermark-pdf': PdfWatermarkTool,
  'add-page-numbers': PdfPageNumbersTool,
  'add-page-numbers-2': PdfPageNumbersTool,
  'crop-pdf': PdfCropTool,
  'crop-pdf-2': PdfCropTool,
  'compare-pdf': PdfCompareTool,
  'flatten-pdf': PdfFlattenTool,
  'repair-pdf': PdfRepairTool,
  'redact-pdf': PdfRedactTool,
  'pdf-to-jpg': PdfToImageTool,
  'pdf-to-image': PdfToImageTool,
  'pdf-reader': PdfReaderTool,
  'jpg-to-pdf': ImageToPdfTool,
  'scan-to-pdf': ImageToPdfTool,
  'pdf-scanner': ImageToPdfTool,
  'txt-to-pdf': TextToPdfTool,
  'html-to-pdf': HtmlToPdfTool,
  'ai-pdf-assistant': AiChatTool,
  'chat-with-pdf': AiChatTool,
  'ai-pdf-summarizer': AiSummarizerTool,
  'ai-summarizer': AiSummarizerTool,
  'pdf-intelligence': AiSummarizerTool,
  'ai-question-generator': AiSummarizerTool,
  'qr-code-generator': QrCodeTool,
  'image-converter': ImageConverterTool,
  'image-compressor': ImageCompressorTool,
  'word-counter': WordCounterTool,
  'password-generator': PasswordGeneratorTool,
  'json-formatter': JsonFormatterTool,
  'base64-encode-decode': Base64Tool,
  'age-calculator': AgeCalculatorTool,
  'password-strength-checker': PasswordStrengthTool,
  'hash-generator': HashGeneratorTool,
  'file-encryptor': FileEncryptorTool,
  'ocr-pdf': OCRTool,
  'pdf-annotator': AnnotateTool,
  'pdf-form-filler': FormFillerTool,
  'pdf-forms': CreateFormTool,
  'pdf-forms-2': CreateFormTool,
  'share-pdf': SharePDFTool,
  'sign-pdf': SignPDFTool,
  'request-signatures': RequestSignaturesTool,
  'translate-pdf': TranslatePDFTool,
  'zip-to-pdf': ZipToPdfTool,
  'hwp-to-pdf': HwpToPdfTool,
  'pages-to-pdf': PagesToPdfTool,
  'pdf-to-powerpoint': GenericConversionTool,
  'pdf-to-excel': GenericConversionTool,
  'pdf-to-ppt': GenericConversionTool,
};

/**
 * Fallback page for tools without a bespoke component —
 * uploads files to the backend /api/tools/:slug endpoint.
 */
function DefaultToolPage({ tool, seoDescription }: { tool: Tool; seoDescription?: string }) {
  const { files, setFiles, processing, progress, status, result, error, process, reset, download } =
    useToolProcessor(tool.slug);

  const handleProcess = () => {
    const isImage = tool.slug.includes('to-jpg') || tool.slug.includes('to-image');
    process({}, isImage ? 'converted.zip' : 'converted.pdf', tool.slug === 'merge-pdf' ? 2 : 1);
  };

  if (result) {
    return (
      <ToolPageLayout tool={tool}>
        <ResultCard
          fileName={result.fileName}
          fileSize={result.size}
          onDownload={download}
          onReset={reset}
        />
      </ToolPageLayout>
    );
  }

  return (
    <ToolPageLayout tool={tool}>
      <Card className="p-6 mb-6">
        <FileUploader
          accept={tool.formats ?? []}
          multiple={tool.slug === 'merge-pdf'}
          files={files}
          onChange={setFiles}
          label={`Drag & drop your ${(tool.formats ?? ['files']).join(', ')} here`}
        />
      </Card>

      <ProcessingSection processing={processing} progress={progress} status={status} error={error} />

      <Button
        onClick={handleProcess}
        loading={processing}
        disabled={files.length === 0}
        className="w-full"
        size="lg"
      >
        {tool.name}
      </Button>

      {seoDescription && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{seoDescription}</p>
      )}
    </ToolPageLayout>
  );
}

function ToolNotFound() {
  useDocumentTitle('Tool not found — ConvertX');
  return (
    <div className="py-20 text-center px-4">
      <Seo
        title="Tool not found | ConvertX"
        description="The requested tool does not exist. Browse all free file tools at ConvertX."
        canonicalPath="/tools"
      />
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tool not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        The tool you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/tools"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
      >
        Browse all tools
      </Link>
    </div>
  );
}

function ComingSoon({ tool }: { tool: Tool }) {
  const meta = categoryMeta[tool.category];
  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${meta.bg}`}>
          <ToolIcon name={tool.icon} className={`w-8 h-8 ${meta.text}`} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {tool.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{tool.description}</p>
        <Card className="p-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Coming soon</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            This tool is under development and will be available soon.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Browse other tools <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  if (!tool) return <ToolNotFound />;

  const seo = getSeoForSlug(slug ?? '');
  const seoTitle = `${tool.name} — Free Online, No Signup | ConvertX`;
  const seoDesc =
    seo?.description ??
    `${tool.name}: ${tool.description} Free, fast and secure — no registration needed.`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${tool.name} — ConvertX`,
      url: `https://dm2123.github.io/convertx/tools/${slug}`,
      description: seoDesc,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dm2123.github.io/convertx/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://dm2123.github.io/convertx/tools' },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.name,
          item: `https://dm2123.github.io/convertx/tools/${slug}`,
        },
      ],
    },
  ];

  if (!tool.implemented) {
    return (
      <>
        <Seo title={seoTitle} description={seoDesc} canonicalPath={`/tools/${slug}`} jsonLd={jsonLd} />
        <ComingSoon tool={tool} />
      </>
    );
  }

  const ToolComponent = slug ? toolComponents[slug] : undefined;

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDesc}
        canonicalPath={`/tools/${slug}`}
        keywords={[`${tool.name} online free`, tool.name.toLowerCase(), ...(seo?.keywords ?? [])]}
        jsonLd={jsonLd}
      />
      {ToolComponent ? (
        <ToolComponent tool={tool} />
      ) : (
        <DefaultToolPage tool={tool} seoDescription={seo?.description} />
      )}
    </>
  );
}
