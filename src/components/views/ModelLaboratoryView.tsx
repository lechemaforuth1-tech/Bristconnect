import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend, 
  BarChart as ReBarChart, 
  Bar 
} from 'recharts';
import { ModelMetrics } from '../../types';

interface ModelLaboratoryViewProps {
  onRefreshData?: () => void;
}

export const ModelLaboratoryView: React.FC<ModelLaboratoryViewProps> = ({ onRefreshData }) => {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [championAlgo, setChampionAlgo] = useState<string>('Gradient Boosting');
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/ml/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models);
          setChampionAlgo(data.championAlgorithm || data.models[0].algorithm);
          setSelectedModel(data.models.find((m: any) => m.isChampion) || data.models[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrainModels = async () => {
    setIsTraining(true);
    try {
      const res = await fetch('/api/ml/train', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models);
        setChampionAlgo(data.championAlgorithm);
        setSelectedModel(data.models.find((m: any) => m.isChampion) || data.models[0]);
        onRefreshData?.();
      }
    } catch (e) {
      alert('Error during model training.');
    } finally {
      setIsTraining(false);
    }
  };

  const currentDisplayModel = selectedModel || models[0];

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#142B4C]" />
              Machine Learning Model Laboratory & Evaluation Suite
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Leakage Shield Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stratified 80/20 train/test evaluation across 4 candidate algorithms. Target: <span className="font-mono text-slate-700">Churn Flag</span>.
          </p>
        </div>

        <button
          onClick={handleTrainModels}
          disabled={isTraining}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#091B33] bg-[#D4AF37] hover:bg-[#b89726] rounded-lg shadow-2xs transition-colors"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isTraining ? 'animate-spin' : ''}`} />
          <span>{isTraining ? 'Training Pipelines...' : 'Train & Evaluate Models'}</span>
        </button>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Algorithm Benchmark & Performance Matrix (Independent Test Set)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">PR-AUC</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Brier Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map(m => {
                const isSelected = currentDisplayModel?.algorithm === m.algorithm;
                return (
                  <tr 
                    key={m.algorithm}
                    onClick={() => setSelectedModel(m)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      {m.isChampion && (
                        <span title="Champion Model">
                          <Award className="w-4 h-4 text-[#D4AF37]" />
                        </span>
                      )}
                      <span>{m.algorithm}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {m.rocAuc.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {m.prAuc.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {m.f1Score.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {m.brierScore.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.isChampion ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#8a6e19] border border-[#D4AF37]/40">
                          Champion
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Challenger</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(m);
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 underline"
                      >
                        Curves
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Deep Dive: Curves, Confusion Matrix, and Feature Importance */}
      {currentDisplayModel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ROC & PR Curve Visualisation (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                ROC Curve: {currentDisplayModel.algorithm} (AUC: {currentDisplayModel.rocAuc.toFixed(3)})
              </h3>
              <span className="text-xs font-mono text-slate-400">TPR vs FPR</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentDisplayModel.rocCurve} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fpr" tick={{ fontSize: 11, fill: '#64748b' }} unit="" label={{ value: 'False Positive Rate', position: 'bottom', offset: -5, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="tpr" name="Model ROC" stroke="#142B4C" strokeWidth={2.5} dot={false} />
                  <Line type="linear" dataKey="fpr" name="Chance Baseline" stroke="#94a3b8" strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Confusion Matrix Display */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-800 mb-2">Confusion Matrix (Threshold = 0.50)</div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] text-emerald-800 uppercase block font-semibold">True Negative (Retained)</span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    {currentDisplayModel.confusionMatrix?.trueNegative}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[10px] text-rose-800 uppercase block font-semibold">False Positive (False Alarm)</span>
                  <span className="text-base font-bold font-mono text-[#8B1E2D]">
                    {currentDisplayModel.confusionMatrix?.falsePositive}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[10px] text-rose-800 uppercase block font-semibold">False Negative (Missed Churn)</span>
                  <span className="text-base font-bold font-mono text-[#8B1E2D]">
                    {currentDisplayModel.confusionMatrix?.falseNegative}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] text-emerald-800 uppercase block font-semibold">True Positive (Correctly Intercepted)</span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    {currentDisplayModel.confusionMatrix?.truePositive}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Feature Importance / MDI Drivers (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Global Feature Importance & Churn Association
              </h3>
              <span className="text-xs font-mono text-slate-400">Relative Permutation Impact</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {currentDisplayModel.featureImportance?.map((feat, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="font-mono text-slate-400 text-[10px]">#{idx + 1}</span>
                      {feat.feature}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {(feat.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full rounded-full ${
                        feat.direction === 'increases_risk' ? 'bg-[#8B1E2D]' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, feat.importance * 200)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Causal Note:</span> Associations reflect statistical feature importance within the trained model, not guaranteed physical causality. Interventions must be validated through retention campaigns.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
