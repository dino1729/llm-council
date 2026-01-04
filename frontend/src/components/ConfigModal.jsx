import { useState, useEffect } from 'react';
import { api } from '../api';
import './ConfigModal.css';

export default function ConfigModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [configData, models] = await Promise.all([
        api.getConfig(),
        api.listAvailableModels(),
      ]);
      setConfig(configData);
      setAvailableModels(models);
    } catch (err) {
      setError('Failed to load configuration or models');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCouncilModelChange = (modelId) => {
    setConfig(prev => {
      const currentModels = prev.council_models || [];
      const newModels = currentModels.includes(modelId)
        ? currentModels.filter(m => m !== modelId)
        : [...currentModels, modelId];
      return { ...prev, council_models: newModels };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateConfig(config);
      onClose();
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Configuration</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="config-section">
                <h3>Council Models</h3>
                <p className="text-sm text-secondary mb-2">Select models to include in the council.</p>
                <div className="model-list">
                  {availableModels.map(model => (
                    <label key={model} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={config.council_models.includes(model)}
                        onChange={() => handleCouncilModelChange(model)}
                      />
                      <span>{model}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="config-section">
                <h3>Chairman Model</h3>
                <div className="form-group">
                  <label>Select Chairman Model</label>
                  <select
                    className="model-select"
                    value={config.chairman_model}
                    onChange={(e) => setConfig({ ...config, chairman_model: e.target.value })}
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="config-section">
                <h3>Title Generation Model</h3>
                <div className="form-group">
                  <label>Select Title Model</label>
                  <select
                    className="model-select"
                    value={config.title_model}
                    onChange={(e) => setConfig({ ...config, title_model: e.target.value })}
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-save" 
            onClick={handleSave} 
            disabled={isSaving || isLoading || error}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
