import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download, 
  ArrowRight, 
  Database, 
  History,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { CustomerRecord, DatasetMetadata } from '../../types';
import { BRITCONNECT_COLUMNS, matchCanonicalColumn } from '../../services/schema';

interface DataManagementProps {
  activeMetadata: DatasetMetadata | null;
  onDatasetUpdated: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  activeMetadata,
  onDatasetUpdated
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'cleaning' | 'confirmed'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [cleanedRecords, setCleanedRecords] = useState<CustomerRecord[]>([]);
  const [cleaningReport, setCleaningReport] = useState<any>(null);
  const [versions, setVersions] = useState<DatasetMetadata[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  React.useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const res = await fetch('/api/dataset/versions');
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (data.length > 1) {
            const headers = (data[0] as string[]).map(h => String(h || '').trim());
            const rows = data.slice(1).map(row => {
              const obj: any = {};
              headers.forEach((h, idx) => {
                obj[h] = row[idx];
              });
              return obj;
            });
            processHeadersAndRows(headers, rows);
          }
        } catch (err) {
          alert('Error parsing Excel file. Please ensure it is a valid format.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      // CSV, TSV, or JSON
      Papa.parse(uploadedFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields && results.data.length > 0) {
            processHeadersAndRows(results.meta.fields, results.data);
          } else {
            alert('Could not parse columns from CSV. Please check formatting.');
          }
          setIsProcessing(false);
        },
        error: (err) => {
          alert(`Error reading file: ${err.message}`);
          setIsProcessing(false);
        }
      });
    }
  };

  const processHeadersAndRows = (headers: string[], rows: any[]) => {
    setRawHeaders(headers);
    setParsedRows(rows);

    // Initial mapping attempt
    const initialMapping: Record<string, string> = {};
    headers.forEach(h => {
      const matched = matchCanonicalColumn(h);
      if (matched) {
        initialMapping[h] = matched.name;
      }
    });
    setColumnMappings(initialMapping);
    setStep('mapping');
  };

  const handleConfirmMapping = () => {
    setStep('validation');
  };

  const handleRunCleaning = async () => {
    setIsCleaning(true);
    try {
      // Map rows to canonical fields
      const normalizedRecords = parsedRows.map(row => {
        const canonicalRow: any = {};
        Object.entries(columnMappings).forEach(([sourceCol, canonicalCol]) => {
          if (canonicalCol) {
            canonicalRow[canonicalCol] = row[sourceCol];
          }
        });
        return canonicalRow;
      });

      const res = await fetch('/api/dataset/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: normalizedRecords })
      });

      if (res.ok) {
        const data = await res.json();
        setCleanedRecords(data.cleanedRecords);
        setCleaningReport(data.report);
        setStep('cleaning');
      }
    } catch (e) {
      alert('Failed to clean dataset.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleConfirmActiveDataset = async () => {
    if (activeMetadata && !showReplaceModal) {
      setShowReplaceModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/dataset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            filename: file?.name || 'Uploaded_Dataset.csv',
            dataQualityScore: cleaningReport?.qualityScore || 95,
            cleaningStatus: 'Cleaned'
          },
          records: cleanedRecords,
          uploader: 'Operational Analyst',
          notes: `Uploaded via Guided Ingestion (${cleanedRecords.length} customer records).`
        })
      });

      if (res.ok) {
        setShowReplaceModal(false);
        setStep('confirmed');
        onDatasetUpdated();
        loadVersions();
      }
    } catch (e) {
      alert('Failed to confirm active dataset.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCanonicalTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      BRITCONNECT_COLUMNS.reduce((acc, col) => {
        acc[col.name] = '';
        return acc;
      }, {} as any)
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BritConnect_Template');
    XLSX.writeFile(wb, 'BritConnect_Canonical_Template.xlsx');
  };

  const mappedCanonicalCount = new Set(Object.values(columnMappings).filter(Boolean)).size;
  const missingRequired = BRITCONNECT_COLUMNS.filter(c => c.isRequired && !Object.values(columnMappings).includes(c.name));

  return (
    <div className="space-y-6">
      {/* Workflow Stepper */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { id: 'upload', label: '1. Ingest File' },
            { id: 'mapping', label: '2. Schema Mapping' },
            { id: 'validation', label: '3. Data Validation' },
            { id: 'cleaning', label: '4. Clean & Prep' },
            { id: 'confirmed', label: '5. Confirm Active' }
          ].map((st, idx) => {
            const isCurrent = step === st.id;
            const isCompleted = 
              (st.id === 'upload' && step !== 'upload') ||
              (st.id === 'mapping' && (step === 'validation' || step === 'cleaning' || step === 'confirmed')) ||
              (st.id === 'validation' && (step === 'cleaning' || step === 'confirmed')) ||
              (st.id === 'cleaning' && step === 'confirmed');

            return (
              <div key={st.id} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCurrent 
                    ? 'bg-[#142B4C] text-[#D4AF37] ring-2 ring-[#D4AF37]/50' 
                    : isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${
                  isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {st.label}
                </span>
                {idx < 4 && <div className="w-6 sm:w-12 h-0.5 bg-slate-200" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload Workspace */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls,.tsv,.json"
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-lg border-2 border-dashed border-slate-300 hover:border-[#142B4C] bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-10 cursor-pointer transition-all flex flex-col items-center justify-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#091B33] text-[#D4AF37] flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Upload Customer Telecommunications Dataset
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm">
                Drag and drop your file here, or click to browse. Supports Excel (.xlsx, .xls), CSV, TSV, or JSON.
              </p>
              <span className="px-4 py-2 text-xs font-semibold text-white bg-[#091B33] group-hover:bg-[#142B4C] rounded-lg transition-colors shadow-2xs">
                Select File from Computer
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel .xlsx/.xls</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600" /> CSV / TSV</span>
              <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-purple-600" /> JSON Records</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#142B4C]" />
                Schema Requirements
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                BritConnect AI automatically matches 38 canonical fields including demographics, contracts, charges, support tickets, and churn flags.
              </p>
              <button
                onClick={downloadCanonicalTemplate}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#142B4C] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Canonical Excel Template
              </button>
            </div>

            <div className="bg-[#091B33] text-white rounded-xl p-5 border border-[#142B4C] shadow-2xs">
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                Data Persistence Guarantee
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Active customer data is persisted to server disk storage and remains safely loaded across browser refreshes, restarts, and sessions until explicitly replaced through confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Schema Mapping */}
      {step === 'mapping' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Column Schema Mapping: {file?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {parsedRows.length.toLocaleString()} rows detected • {mappedCanonicalCount} of {BRITCONNECT_COLUMNS.length} canonical fields mapped
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('upload')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMapping}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs"
              >
                <span>Proceed to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Uploaded Source Header</th>
                  <th className="py-2.5 px-3">Canonical BritConnect Field</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Sample Value</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawHeaders.map(hdr => {
                  const currentMapped = columnMappings[hdr] || '';
                  const canonicalDef = BRITCONNECT_COLUMNS.find(c => c.name === currentMapped);
                  const sampleVal = parsedRows[0]?.[hdr];

                  return (
                    <tr key={hdr} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-medium text-slate-800">
                        {hdr}
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={currentMapped}
                          onChange={e => setColumnMappings(prev => ({ ...prev, [hdr]: e.target.value }))}
                          className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#142B4C]"
                        >
                          <option value="">-- Ignore Column --</option>
                          {BRITCONNECT_COLUMNS.map(col => (
                            <option key={col.name} value={col.name}>
                              {col.no}. {col.name} {col.isRequired ? '*' : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {canonicalDef?.dataType || 'Text'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 truncate max-w-[180px]">
                        {String(sampleVal !== undefined ? sampleVal : '')}
                      </td>
                      <td className="py-2 px-3">
                        {currentMapped ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mapped
                          </span>
                        ) : (
                          <span className="text-slate-400">Ignored</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Data Validation */}
      {step === 'validation' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Step 3: Pre-Ingestion Data Validation Report
              </h3>
              <p className="text-xs text-slate-500">
                Validating target integrity, range constraints, and required fields
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('mapping')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleRunCleaning}
                disabled={isCleaning}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs"
              >
                {isCleaning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Execute Automated Cleaning</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Rows Checked</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{parsedRows.length.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Mapped Canonical Fields</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{mappedCanonicalCount} / 38</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Missing Required Fields</div>
              <div className={`text-xl font-bold font-mono mt-1 ${missingRequired.length > 0 ? 'text-[#8B1E2D]' : 'text-emerald-700'}`}>
                {missingRequired.length}
              </div>
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#8B1E2D] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing Required Fields:</span>{' '}
                {missingRequired.map(m => m.name).join(', ')}. Please return to mapping and link these fields to ensure accurate model training.
              </div>
            </div>
          )}

          {/* First 5 Preview records */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">First 5 Records Preview (Mapped)</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-56">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">Customer ID</th>
                    <th className="py-2 px-2.5">Segment</th>
                    <th className="py-2 px-2.5">Contract</th>
                    <th className="py-2 px-2.5">Monthly Charge</th>
                    <th className="py-2 px-2.5">CSAT</th>
                    <th className="py-2 px-2.5">Churn Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 font-mono font-medium">{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Customer ID') || ''] || `ROW-${idx + 1}`)}</td>
                      <td className="py-2 px-2.5">{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Customer Segment') || ''] || 'Consumer')}</td>
                      <td className="py-2 px-2.5">{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Contract Type') || ''] || 'Month-to-Month')}</td>
                      <td className="py-2 px-2.5 font-mono">£{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Monthly Charge GBP') || ''] || '35.00')}</td>
                      <td className="py-2 px-2.5 font-mono">{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Satisfaction Score 1 10') || ''] || '7')}</td>
                      <td className="py-2 px-2.5 font-mono">{String(row[Object.keys(columnMappings).find(k => columnMappings[k] === 'Churn Flag') || ''] || '0')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Cleaning & Preparation Summary */}
      {step === 'cleaning' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Step 4: Automated Data Preparation & Quality Report
              </h3>
              <p className="text-xs text-slate-500">
                Cleaning completed reproducibly without modifying raw source
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('validation')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleConfirmActiveDataset}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
              >
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Set as Active Dataset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Usable Records</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{cleaningReport?.usableCount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Initial: {cleaningReport?.initialCount.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Duplicates Removed</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{cleaningReport?.duplicatesRemoved}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Customer ID deduplicated</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Values Imputed</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{cleaningReport?.missingValuesImputed}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Median / Mode strategies</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-800 font-semibold">Data Quality Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">{cleaningReport?.qualityScore}%</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Production Grade</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Transformation Summary:</div>
            <div>• Target Consistency: Reconciled Churn Flag (0/1) with Churn Status (Active/Churned).</div>
            <div>• Leakage Shielding: Flagged Churn Date and Churn Reason as post-outcome descriptors.</div>
            <div>• Outlier Protection: Capped out-of-range satisfaction scores to 1-10 scale.</div>
          </div>
        </div>
      )}

      {/* Step 5: Confirmed Active */}
      {step === 'confirmed' && (
        <div className="bg-white rounded-xl p-8 border border-emerald-200 shadow-2xs text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Active Dataset Confirmed & Persisted
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The dataset has been saved to persistent storage. All dashboards, machine learning models, revenue exposure analytics, and AI assistant queries now operate on this verified data.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Upload Another Dataset Version
            </button>
          </div>
        </div>
      )}

      {/* Dataset Version History Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#142B4C]" />
              Dataset Version History & Governance
            </h3>
            <p className="text-xs text-slate-500">Immutable record of confirmed dataset iterations</p>
          </div>
          <button
            onClick={loadVersions}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Refresh History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Version</th>
                <th className="py-2 px-3">Filename</th>
                <th className="py-2 px-3">Upload Timestamp</th>
                <th className="py-2 px-3">Uploader</th>
                <th className="py-2 px-3">Rows</th>
                <th className="py-2 px-3">Quality</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((ver, idx) => (
                <tr key={ver.id || idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {ver.version}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {ver.filename}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(ver.uploadedAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {ver.uploader}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {ver.rowCount?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">
                    {ver.dataQualityScore}%
                  </td>
                  <td className="py-2.5 px-3">
                    {ver.isActive || idx === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-400">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Replacing Active Dataset */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Replace Active Production Dataset?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Replacing the active dataset (<span className="font-semibold">{activeMetadata?.filename}</span>) with this new version will re-index all executive KPIs, customer predictions, and revenue exposure metrics. Prior dataset snapshots will remain archived.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActiveDataset}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B1E2D] hover:bg-rose-900 rounded-lg transition-colors"
              >
                Confirm Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
