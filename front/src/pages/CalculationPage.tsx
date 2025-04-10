import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import '../styles.css';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';

interface CalculationResult {
  id: number;
  type: string;
  result: string;
  created_at: string;
}

// Типы расчетов из бэкенда
enum CalculationType {
  FOUNDATION = "foundation",
  FRAME = "frame",
  ROOF = "roof",
  STAIRCASE = "staircase",
  ELECTRICITY = "electricity",
  PIPELINE = "pipeline",
  VENTILATION = "ventilation"
}

// Интерфейс для параметров расчета
interface CalculationParams {
  [key: string]: any;
}

// Интерфейс для результата расчета
interface CalculationResultData {
  [key: string]: any;
}

const CalculationPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CalculationType | ''>('');
  const [params, setParams] = useState<CalculationParams>({});
  const [result, setResult] = useState<CalculationResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const navigate = useNavigate();

  // Обработчик изменения типа расчета
  const handleTypeChange = (event: SelectChangeEvent<CalculationType>) => {
    setSelectedType(event.target.value as CalculationType);
    setParams({});
    setResult(null);
    setError(null);
    setActiveStep(1);
  };

  // Обработчик изменения параметров
  const handleParamChange = (key: string, value: string) => {
    const newParams = {
      ...params,
      [key]: value
    };
    setParams(newParams);
  };

  // Функция для расчета результата
  const calculateResult = (type: CalculationType, params: CalculationParams) => {
    try {
      let calculatedResult: CalculationResultData = {};
      
      switch (type) {
        case CalculationType.FOUNDATION:
          const foundationLength = Number(params.length || 0);
          const foundationWidth = Number(params.width || 0);
          const foundationDepth = Number(params.depth || 0);
          const soilType = params.soilType || 'sandy';
          
          // Коэффициенты для разных типов грунта
          const soilCoefficients = {
            'sandy': 1.0,
            'clay': 1.2,
            'loam': 1.1,
            'rocky': 0.8
          };
          
          const foundationVolume = foundationLength * foundationWidth * foundationDepth;
          const foundationArea = foundationLength * foundationWidth;
          const soilCoeff = soilCoefficients[soilType as keyof typeof soilCoefficients] || 1.0;
          const foundationCost = foundationVolume * 2400 * soilCoeff;
          
          calculatedResult = {
            volume: foundationVolume.toFixed(2),
            area: foundationArea.toFixed(2),
            cost: foundationCost.toFixed(2),
            soil_type: soilType,
            soil_coefficient: soilCoeff
          };
          break;
          
        case CalculationType.FRAME:
          const frameLength = Number(params.length || 0);
          const frameWidth = Number(params.width || 0);
          const frameHeight = Number(params.height || 0);
          const frameMaterial = params.material || 'steel';
          const frameType = params.frameType || 'single';
          
          // Коэффициенты для разных типов каркаса
          const frameTypeCoefficients = {
            'single': 1.0,
            'double': 1.5,
            'triple': 2.0
          };
          
          // Коэффициенты для разных материалов
          const frameMaterialCoefficients = {
            'steel': 1.0,
            'aluminum': 1.3,
            'wood': 0.8
          };
          
          const frameTotalLength = (frameLength + frameWidth) * 2;
          const frameVolume = frameLength * frameWidth * frameHeight;
          const frameMaterialsCount = Math.ceil(frameVolume / 2);
          
          const frameTypeCoeff = frameTypeCoefficients[frameType as keyof typeof frameTypeCoefficients] || 1.0;
          const frameMaterialCoeff = frameMaterialCoefficients[frameMaterial as keyof typeof frameMaterialCoefficients] || 1.0;
          
          const frameCost = frameVolume * 3500 * frameTypeCoeff * frameMaterialCoeff;
          
          calculatedResult = {
            total_length: frameTotalLength.toFixed(2),
            materials_count: frameMaterialsCount,
            volume: frameVolume.toFixed(2),
            cost: frameCost.toFixed(2),
            material: frameMaterial,
            frame_type: frameType,
            material_coefficient: frameMaterialCoeff,
            frame_type_coefficient: frameTypeCoeff
          };
          break;
          
        case CalculationType.ROOF:
          const roofArea = Number(params.area || 0);
          const roofType = params.roofType || 'gable';
          const roofMaterial = params.material || 'metal';
          
          // Коэффициенты для разных типов кровли
          const roofTypeCoefficients = {
            'gable': 1.0,
            'hip': 1.2,
            'flat': 0.8
          };
          
          // Коэффициенты для разных материалов кровли
          const roofMaterialCoefficients = {
            'metal': 1.0,
            'shingle': 1.1,
            'slate': 1.3
          };
          
          const roofTypeCoeff = roofTypeCoefficients[roofType as keyof typeof roofTypeCoefficients] || 1.0;
          const roofMaterialCoeff = roofMaterialCoefficients[roofMaterial as keyof typeof roofMaterialCoefficients] || 1.0;
          
          const roofCost = roofArea * 1800 * roofTypeCoeff * roofMaterialCoeff;
          
          calculatedResult = {
            area: roofArea.toFixed(2),
            cost: roofCost.toFixed(2),
            roof_type: roofType,
            material: roofMaterial,
            roof_type_coefficient: roofTypeCoeff,
            material_coefficient: roofMaterialCoeff
          };
          break;
          
        case CalculationType.STAIRCASE:
          const stairHeight = Number(params.height || 0);
          const stairSteps = Number(params.steps || 0);
          const stairMaterial = params.material || 'wood';
          
          // Коэффициенты для разных материалов лестницы
          const stairMaterialCoefficients = {
            'wood': 1.0,
            'metal': 1.2,
            'concrete': 1.5
          };
          
          const stairTotalLength = stairHeight * 1.5;
          const stairMaterialCoeff = stairMaterialCoefficients[stairMaterial as keyof typeof stairMaterialCoefficients] || 1.0;
          
          const stairCost = stairSteps * 5000 * stairMaterialCoeff;
          
          calculatedResult = {
            steps_count: stairSteps,
            total_length: stairTotalLength.toFixed(2),
            cost: stairCost.toFixed(2),
            material: stairMaterial,
            material_coefficient: stairMaterialCoeff
          };
          break;
          
        case CalculationType.ELECTRICITY:
          const power = Number(params.power || 0);
          const rooms = Number(params.rooms || 0);
          
          // Расчет стоимости электрики с учетом количества комнат
          const baseCost = power * 1000;
          const roomsFactor = 1 + (rooms * 0.1); // Каждая комната увеличивает стоимость на 10%
          
          const electricityCost = baseCost * roomsFactor;
          
          calculatedResult = {
            power: power.toFixed(2),
            rooms: rooms,
            cost: electricityCost.toFixed(2),
            rooms_factor: roomsFactor.toFixed(2)
          };
          break;
          
        case CalculationType.PIPELINE:
          const pipeLength = Number(params.length || 0);
          const diameter = Number(params.diameter || 0);
          const pipeMaterial = params.material || 'steel';
          
          // Коэффициенты для разных материалов труб
          const pipeMaterialCoefficients = {
            'steel': 1.0,
            'copper': 1.5,
            'plastic': 0.8
          };
          
          // Коэффициент диаметра (чем больше диаметр, тем дороже)
          const diameterFactor = 1 + (diameter / 100);
          
          const materialCoeff = pipeMaterialCoefficients[pipeMaterial as keyof typeof pipeMaterialCoefficients] || 1.0;
          
          const pipelineCost = pipeLength * 800 * materialCoeff * diameterFactor;
          
          calculatedResult = {
            length: pipeLength.toFixed(2),
            diameter: diameter,
            cost: pipelineCost.toFixed(2),
            material: pipeMaterial,
            material_coefficient: materialCoeff,
            diameter_factor: diameterFactor.toFixed(2)
          };
          break;
          
        case CalculationType.VENTILATION:
          const ventArea = Number(params.area || 0);
          const ventHeight = Number(params.height || 0);
          const airExchange = Number(params.airExchange || 0);
          
          const airVolume = ventArea * ventHeight * airExchange;
          const ventilationCost = airVolume * 50;
          
          calculatedResult = {
            air_volume: airVolume.toFixed(2),
            cost: ventilationCost.toFixed(2),
            area: ventArea.toFixed(2),
            height: ventHeight.toFixed(2),
            air_exchange: airExchange.toFixed(2)
          };
          break;
      }
      
      setResult(calculatedResult);
      setError(null);
      setActiveStep(2);
    } catch (err) {
      console.error('Ошибка при расчете:', err);
      setError('Произошла ошибка при расчете');
      setResult(null);
    }
  };

  // Обработчик отправки формы для расчета
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      calculateResult(selectedType, params);
    }
  };

  // Обработчик сохранения расчета
  const handleSave = async () => {
    try {
      if (!selectedType || !result) {
        setError('Необходимо выполнить расчет перед сохранением');
        return;
      }

      const calculationData = {
        calc_type: selectedType,
        params: params,
        results: result
      };

      const response = await api.post('/api/v1/calculate', calculationData);
      
      if (response.data && response.data.id) {
        setSnackbar({
          open: true,
          message: 'Расчет успешно сохранен!'
        });
        
        setTimeout(() => {
          navigate(`/calculation/${response.data.id}`);
        }, 2000);
      } else {
        setError('Ошибка при сохранении расчета');
      }
    } catch (err) {
      setError('Произошла ошибка при сохранении расчета');
      console.error('Error saving calculation:', err);
    }
  };

  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Обработчик перехода к следующему шагу
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Обработчик перехода к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Обработчик сброса формы
  const handleReset = () => {
    setSelectedType('');
    setParams({});
    setResult(null);
    setError(null);
    setAddress('');
    setActiveStep(0);
  };

  // Рендеринг формы в зависимости от выбранного типа расчета
  const renderCalculationForm = () => {
    if (!selectedType) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom>
            Выберите тип расчета
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Пожалуйста, выберите тип расчета из списка выше
          </Typography>
        </Box>
      );
    }

    switch (selectedType) {
      case CalculationType.FOUNDATION:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Длина (м)"
                  type="number"
                  value={params.length || ''}
                  onChange={(e) => handleParamChange('length', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ширина (м)"
                  type="number"
                  value={params.width || ''}
                  onChange={(e) => handleParamChange('width', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Глубина (м)"
                  type="number"
                  value={params.depth || ''}
                  onChange={(e) => handleParamChange('depth', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="soil-type-label">Тип грунта</InputLabel>
                  <Select
                    labelId="soil-type-label"
                    value={params.soilType || 'sandy'}
                    onChange={(e) => handleParamChange('soilType', e.target.value)}
                    label="Тип грунта"
                  >
                    <MenuItem value="sandy">Песчаный</MenuItem>
                    <MenuItem value="clay">Глинистый</MenuItem>
                    <MenuItem value="loam">Суглинок</MenuItem>
                    <MenuItem value="rocky">Скалистый</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.FRAME:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Длина (м)"
                  type="number"
                  value={params.length || ''}
                  onChange={(e) => handleParamChange('length', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ширина (м)"
                  type="number"
                  value={params.width || ''}
                  onChange={(e) => handleParamChange('width', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Высота (м)"
                  type="number"
                  value={params.height || ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="material-label">Материал</InputLabel>
                  <Select
                    labelId="material-label"
                    value={params.material || 'steel'}
                    onChange={(e) => handleParamChange('material', e.target.value)}
                    label="Материал"
                  >
                    <MenuItem value="steel">Сталь</MenuItem>
                    <MenuItem value="aluminum">Алюминий</MenuItem>
                    <MenuItem value="wood">Дерево</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="frame-type-label">Тип каркаса</InputLabel>
                  <Select
                    labelId="frame-type-label"
                    value={params.frameType || 'single'}
                    onChange={(e) => handleParamChange('frameType', e.target.value)}
                    label="Тип каркаса"
                  >
                    <MenuItem value="single">Одинарный</MenuItem>
                    <MenuItem value="double">Двойной</MenuItem>
                    <MenuItem value="triple">Тройной</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.ROOF:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Площадь кровли (м²)"
                  type="number"
                  value={params.area || ''}
                  onChange={(e) => handleParamChange('area', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="roof-type-label">Тип кровли</InputLabel>
                  <Select
                    labelId="roof-type-label"
                    value={params.roofType || 'gable'}
                    onChange={(e) => handleParamChange('roofType', e.target.value)}
                    label="Тип кровли"
                  >
                    <MenuItem value="gable">Двускатная</MenuItem>
                    <MenuItem value="hip">Вальмовая</MenuItem>
                    <MenuItem value="flat">Плоская</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="material-label">Материал кровли</InputLabel>
                  <Select
                    labelId="material-label"
                    value={params.material || 'metal'}
                    onChange={(e) => handleParamChange('material', e.target.value)}
                    label="Материал кровли"
                  >
                    <MenuItem value="metal">Металлочерепица</MenuItem>
                    <MenuItem value="shingle">Гибкая черепица</MenuItem>
                    <MenuItem value="slate">Шифер</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.STAIRCASE:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Высота лестницы (м)"
                  type="number"
                  value={params.height || ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ширина лестницы (м)"
                  type="number"
                  value={params.width || ''}
                  onChange={(e) => handleParamChange('width', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Количество ступеней"
                  type="number"
                  value={params.steps || ''}
                  onChange={(e) => handleParamChange('steps', e.target.value)}
                  required
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="material-label">Материал</InputLabel>
                  <Select
                    labelId="material-label"
                    value={params.material || 'wood'}
                    onChange={(e) => handleParamChange('material', e.target.value)}
                    label="Материал"
                  >
                    <MenuItem value="wood">Дерево</MenuItem>
                    <MenuItem value="metal">Металл</MenuItem>
                    <MenuItem value="concrete">Бетон</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.ELECTRICITY:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Площадь помещения (м²)"
                  type="number"
                  value={params.area || ''}
                  onChange={(e) => handleParamChange('area', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Количество комнат"
                  type="number"
                  value={params.rooms || ''}
                  onChange={(e) => handleParamChange('rooms', e.target.value)}
                  required
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Требуемая мощность (кВт)"
                  type="number"
                  value={params.power || ''}
                  onChange={(e) => handleParamChange('power', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.PIPELINE:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Длина трубопровода (м)"
                  type="number"
                  value={params.length || ''}
                  onChange={(e) => handleParamChange('length', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Диаметр трубы (мм)"
                  type="number"
                  value={params.diameter || ''}
                  onChange={(e) => handleParamChange('diameter', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="material-label">Материал трубы</InputLabel>
                  <Select
                    labelId="material-label"
                    value={params.material || 'steel'}
                    onChange={(e) => handleParamChange('material', e.target.value)}
                    label="Материал трубы"
                  >
                    <MenuItem value="steel">Сталь</MenuItem>
                    <MenuItem value="copper">Медь</MenuItem>
                    <MenuItem value="plastic">Пластик</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case CalculationType.VENTILATION:
        return (
          <Box component="form" onSubmit={handleCalculate} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Площадь помещения (м²)"
                  type="number"
                  value={params.area || ''}
                  onChange={(e) => handleParamChange('area', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Высота помещения (м)"
                  type="number"
                  value={params.height || ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Кратность воздухообмена"
                  type="number"
                  value={params.airExchange || ''}
                  onChange={(e) => handleParamChange('airExchange', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Неизвестный тип расчета
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Выбранный тип расчета не поддерживается
            </Typography>
          </Box>
        );
    }
  };

  // Рендеринг результатов расчета
  const renderCalculationResult = () => {
    if (!result) return null;

    return (
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Результаты расчета
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {selectedType === CalculationType.FOUNDATION && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Объем фундамента:</strong> {result.volume} м³
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Площадь фундамента:</strong> {result.area} м²
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Тип грунта:</strong> {result.soil_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент грунта:</strong> {result.soil_coefficient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.FRAME && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Общая длина:</strong> {result.total_length} м
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Количество материалов:</strong> {result.materials_count} шт
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Объем:</strong> {result.volume} м³
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Материал:</strong> {result.material}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Тип каркаса:</strong> {result.frame_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент материала:</strong> {result.material_coefficient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.ROOF && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Площадь кровли:</strong> {result.area} м²
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Тип кровли:</strong> {result.roof_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Материал:</strong> {result.material}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент материала:</strong> {result.material_coefficient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.STAIRCASE && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Количество ступеней:</strong> {result.steps_count}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Общая длина лестницы:</strong> {result.total_length} м
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Материал:</strong> {result.material}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент материала:</strong> {result.material_coefficient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.ELECTRICITY && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Требуемая мощность:</strong> {result.power} кВт
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Количество комнат:</strong> {result.rooms}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент комнат:</strong> {result.rooms_factor}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.PIPELINE && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Длина трубопровода:</strong> {result.length} м
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Диаметр трубы:</strong> {result.diameter} мм
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Материал:</strong> {result.material}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент материала:</strong> {result.material_coefficient}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Коэффициент диаметра:</strong> {result.diameter_factor}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedType === CalculationType.VENTILATION && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Объем воздуха:</strong> {result.air_volume} м³/ч
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Площадь помещения:</strong> {result.area} м²
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Высота помещения:</strong> {result.height} м
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Кратность воздухообмена:</strong> {result.air_exchange}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Примерная стоимость: {result.cost} ₽
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Строительный калькулятор
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          <Step>
            <StepLabel>Выбор типа расчета</StepLabel>
          </Step>
          <Step>
            <StepLabel>Ввод параметров</StepLabel>
          </Step>
          <Step>
            <StepLabel>Результаты и сохранение</StepLabel>
          </Step>
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="calculation-type-label">Тип расчета</InputLabel>
              <Select
                labelId="calculation-type-label"
                value={selectedType}
                onChange={handleTypeChange}
                label="Тип расчета"
              >
                <MenuItem value="">Выберите тип расчета</MenuItem>
                <MenuItem value={CalculationType.FOUNDATION}>Фундамент</MenuItem>
                <MenuItem value={CalculationType.FRAME}>Каркас</MenuItem>
                <MenuItem value={CalculationType.ROOF}>Кровля</MenuItem>
                <MenuItem value={CalculationType.STAIRCASE}>Лестница</MenuItem>
                <MenuItem value={CalculationType.ELECTRICITY}>Электрика</MenuItem>
                <MenuItem value={CalculationType.PIPELINE}>Трубопровод</MenuItem>
                <MenuItem value={CalculationType.VENTILATION}>Вентиляция</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        
        {activeStep === 1 && selectedType && (
          <Box component="form" onSubmit={handleCalculate}>
            <Grid container spacing={3}>
              {selectedType === CalculationType.FOUNDATION && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Длина (м)"
                      type="number"
                      value={params.length || ''}
                      onChange={(e) => handleParamChange('length', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ширина (м)"
                      type="number"
                      value={params.width || ''}
                      onChange={(e) => handleParamChange('width', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Глубина (м)"
                      type="number"
                      value={params.depth || ''}
                      onChange={(e) => handleParamChange('depth', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                </>
              )}
              
              {selectedType === CalculationType.FRAME && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Площадь (м²)"
                      type="number"
                      value={params.area || ''}
                      onChange={(e) => handleParamChange('area', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Высота (м)"
                      type="number"
                      value={params.height || ''}
                      onChange={(e) => handleParamChange('height', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                </>
              )}
              
              {selectedType === CalculationType.STAIRCASE && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Высота (м)"
                      type="number"
                      value={params.height || ''}
                      onChange={(e) => handleParamChange('height', e.target.value)}
                      required
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Количество ступеней"
                      type="number"
                      value={params.steps || ''}
                      onChange={(e) => handleParamChange('steps', e.target.value)}
                      required
                      inputProps={{ min: 1, step: 1 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>Назад</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
              >
                Рассчитать
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && result && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button onClick={() => setActiveStep(1)}>Назад</Button>
              <Button onClick={handleReset}>Новый расчет</Button>
            </Box>
            {renderCalculationResult()}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Адрес объекта
              </Typography>
              <TextField
                fullWidth
                label="Адрес объекта"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Сохранение...' : 'Сохранить расчет'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default CalculationPage; 