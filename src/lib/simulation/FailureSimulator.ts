import * as THREE from 'three';

export interface FailureMode {
  id: string;
  type: 'electrical' | 'thermal' | 'mechanical' | 'chemical' | 'wear';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  timeToFailure: number; // seconds
  cascadeEffects: string[]; // IDs of components that may fail as a result
}

export interface ComponentHealth {
  id: string;
  healthScore: number; // 0-1 (1 = perfect, 0 = failed)
  degradationRate: number; // per second
  stressFactors: Map<string, number>;
  failureModes: FailureMode[];
  maintenanceHistory: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  date: Date;
  type: 'inspection' | 'repair' | 'replacement' | 'calibration';
  description: string;
  cost: number;
  effectiveness: number; // 0-1
}

export interface FailureEvent {
  id: string;
  componentId: string;
  failureMode: FailureMode;
  timestamp: number;
  cause: string;
  effects: string[];
  repairTime: number;
  repairCost: number;
}

export interface DegradationModel {
  componentType: string;
  wearRate: number;
  fatigueCoefficient: number;
  corrosionRate: number;
  thermalDegradation: number;
  electricalDegradation: number;
}

export class FailureSimulator {
  private components: Map<string, ComponentHealth> = new Map();
  private failureEvents: FailureEvent[] = [];
  private degradationModels: Map<string, DegradationModel> = new Map();
  private environmentalFactors: Map<string, number> = new Map();
  private currentTime = 0;

  constructor() {
    this.initializeDegradationModels();
    this.initializeEnvironmentalFactors();
  }

  private initializeDegradationModels(): void {
    // Electronic components
    this.degradationModels.set('resistor', {
      componentType: 'resistor',
      wearRate: 1e-8,
      fatigueCoefficient: 0,
      corrosionRate: 1e-9,
      thermalDegradation: 1e-6,
      electricalDegradation: 1e-7
    });

    this.degradationModels.set('capacitor', {
      componentType: 'capacitor',
      wearRate: 1e-7,
      fatigueCoefficient: 0,
      corrosionRate: 1e-8,
      thermalDegradation: 1e-5,
      electricalDegradation: 1e-6
    });

    this.degradationModels.set('semiconductor', {
      componentType: 'semiconductor',
      wearRate: 1e-9,
      fatigueCoefficient: 0,
      corrosionRate: 1e-10,
      thermalDegradation: 1e-4,
      electricalDegradation: 1e-5
    });

    // Mechanical components
    this.degradationModels.set('bearing', {
      componentType: 'bearing',
      wearRate: 1e-6,
      fatigueCoefficient: 1e-8,
      corrosionRate: 1e-9,
      thermalDegradation: 1e-7,
      electricalDegradation: 0
    });

    this.degradationModels.set('gear', {
      componentType: 'gear',
      wearRate: 1e-7,
      fatigueCoefficient: 1e-9,
      corrosionRate: 1e-10,
      thermalDegradation: 1e-8,
      electricalDegradation: 0
    });

    this.degradationModels.set('spring', {
      componentType: 'spring',
      wearRate: 1e-8,
      fatigueCoefficient: 1e-6,
      corrosionRate: 1e-9,
      thermalDegradation: 1e-7,
      electricalDegradation: 0
    });
  }

  private initializeEnvironmentalFactors(): void {
    this.environmentalFactors.set('temperature', 25); // °C
    this.environmentalFactors.set('humidity', 50); // %
    this.environmentalFactors.set('vibration', 0.1); // g
    this.environmentalFactors.set('contamination', 0.1); // 0-1 scale
    this.environmentalFactors.set('radiation', 0); // Gy/hour
  }

  // Component Management
  addComponent(
    id: string,
    componentType: string,
    initialHealth: number = 1.0,
    position: THREE.Vector3 = new THREE.Vector3()
  ): ComponentHealth {
    const degradationModel = this.degradationModels.get(componentType) || this.degradationModels.get('resistor')!;
    
    const component: ComponentHealth = {
      id,
      healthScore: initialHealth,
      degradationRate: degradationModel.wearRate,
      stressFactors: new Map(),
      failureModes: this.generateFailureModes(componentType),
      maintenanceHistory: []
    };

    this.components.set(id, component);
    return component;
  }

  private generateFailureModes(componentType: string): FailureMode[] {
    const failureModes: FailureMode[] = [];

    switch (componentType) {
      case 'resistor':
        failureModes.push({
          id: 'thermal_runaway',
          type: 'thermal',
          severity: 'high',
          probability: 0.01,
          timeToFailure: 3600,
          cascadeEffects: []
        });
        failureModes.push({
          id: 'drift',
          type: 'electrical',
          severity: 'medium',
          probability: 0.05,
          timeToFailure: 86400,
          cascadeEffects: []
        });
        break;

      case 'capacitor':
        failureModes.push({
          id: 'electrolyte_dry',
          type: 'chemical',
          severity: 'high',
          probability: 0.02,
          timeToFailure: 7200,
          cascadeEffects: []
        });
        failureModes.push({
          id: 'dielectric_breakdown',
          type: 'electrical',
          severity: 'critical',
          probability: 0.001,
          timeToFailure: 1800,
          cascadeEffects: ['power_supply_failure']
        });
        break;

      case 'bearing':
        failureModes.push({
          id: 'wear',
          type: 'wear',
          severity: 'medium',
          probability: 0.1,
          timeToFailure: 172800,
          cascadeEffects: ['shaft_misalignment']
        });
        failureModes.push({
          id: 'fatigue',
          type: 'mechanical',
          severity: 'high',
          probability: 0.05,
          timeToFailure: 86400,
          cascadeEffects: ['catastrophic_failure']
        });
        break;

      case 'gear':
        failureModes.push({
          id: 'tooth_wear',
          type: 'wear',
          severity: 'medium',
          probability: 0.08,
          timeToFailure: 259200,
          cascadeEffects: ['backlash_increase']
        });
        failureModes.push({
          id: 'tooth_fracture',
          type: 'mechanical',
          severity: 'critical',
          probability: 0.01,
          timeToFailure: 43200,
          cascadeEffects: ['gearbox_failure']
        });
        break;
    }

    return failureModes;
  }

  // Stress Factor Management
  updateStressFactor(componentId: string, stressType: string, value: number): void {
    const component = this.components.get(componentId);
    if (component) {
      component.stressFactors.set(stressType, value);
      this.updateDegradationRate(component);
    }
  }

  private updateDegradationRate(component: ComponentHealth): void {
    let baseDegradationRate = 1e-8; // Base rate
    let accelerationFactor = 1;

    // Temperature stress (Arrhenius model)
    const temperature = component.stressFactors.get('temperature') || 25;
    const tempFactor = Math.exp((temperature - 25) / 10); // 10°C rule
    accelerationFactor *= tempFactor;

    // Electrical stress
    const voltage = component.stressFactors.get('voltage') || 0;
    const ratedVoltage = component.stressFactors.get('rated_voltage') || 1;
    if (ratedVoltage > 0) {
      const voltageFactor = Math.pow(voltage / ratedVoltage, 2);
      accelerationFactor *= voltageFactor;
    }

    // Mechanical stress
    const mechanicalStress = component.stressFactors.get('mechanical_stress') || 0;
    const yieldStrength = component.stressFactors.get('yield_strength') || 1e9;
    const stressFactor = Math.pow(mechanicalStress / yieldStrength, 3);
    accelerationFactor *= (1 + stressFactor);

    // Vibration stress
    const vibration = component.stressFactors.get('vibration') || 0;
    const vibrationFactor = 1 + vibration * 10;
    accelerationFactor *= vibrationFactor;

    // Environmental factors
    const humidity = this.environmentalFactors.get('humidity') || 50;
    const humidityFactor = 1 + (humidity - 50) / 100;
    accelerationFactor *= humidityFactor;

    component.degradationRate = baseDegradationRate * accelerationFactor;
  }

  // Simulation Step
  step(deltaTime: number): FailureEvent[] {
    this.currentTime += deltaTime;
    const newFailures: FailureEvent[] = [];

    this.components.forEach(component => {
      // Update health based on degradation
      component.healthScore -= component.degradationRate * deltaTime;
      component.healthScore = Math.max(0, component.healthScore);

      // Check for failures
      const failures = this.checkForFailures(component);
      newFailures.push(...failures);

      // Process cascade effects
      failures.forEach(failure => {
        this.processCascadeEffects(failure);
      });
    });

    this.failureEvents.push(...newFailures);
    return newFailures;
  }

  private checkForFailures(component: ComponentHealth): FailureEvent[] {
    const failures: FailureEvent[] = [];

    component.failureModes.forEach(failureMode => {
      // Calculate failure probability based on health and stress
      const healthFactor = 1 - component.healthScore;
      const stressFactor = this.calculateStressFactor(component);
      const adjustedProbability = failureMode.probability * healthFactor * stressFactor;

      // Check if failure occurs (simplified random check)
      if (Math.random() < adjustedProbability * 0.001) { // Scale down for reasonable failure rates
        const failure: FailureEvent = {
          id: `failure_${Date.now()}_${Math.random()}`,
          componentId: component.id,
          failureMode,
          timestamp: this.currentTime,
          cause: this.determinePrimaryCause(component),
          effects: this.calculateFailureEffects(failureMode),
          repairTime: this.estimateRepairTime(failureMode),
          repairCost: this.estimateRepairCost(failureMode)
        };

        failures.push(failure);
        
        // Update component health
        component.healthScore = Math.max(0, component.healthScore - 0.5);
      }
    });

    return failures;
  }

  private calculateStressFactor(component: ComponentHealth): number {
    let totalStress = 1;

    component.stressFactors.forEach((value, type) => {
      switch (type) {
        case 'temperature':
          totalStress *= Math.max(1, (value - 25) / 25);
          break;
        case 'voltage':
          const ratedVoltage = component.stressFactors.get('rated_voltage') || 1;
          totalStress *= Math.max(1, value / ratedVoltage);
          break;
        case 'mechanical_stress':
          const yieldStrength = component.stressFactors.get('yield_strength') || 1e9;
          totalStress *= Math.max(1, value / yieldStrength);
          break;
      }
    });

    return Math.min(totalStress, 10); // Cap at 10x
  }

  private determinePrimaryCause(component: ComponentHealth): string {
    let primaryCause = 'normal_wear';
    let maxStress = 0;

    component.stressFactors.forEach((value, type) => {
      if (value > maxStress) {
        maxStress = value;
        primaryCause = type;
      }
    });

    return primaryCause;
  }

  private calculateFailureEffects(failureMode: FailureMode): string[] {
    const effects: string[] = [];

    switch (failureMode.type) {
      case 'electrical':
        effects.push('circuit_interruption', 'voltage_fluctuation');
        break;
      case 'thermal':
        effects.push('heat_generation', 'thermal_damage');
        break;
      case 'mechanical':
        effects.push('vibration_increase', 'noise_increase', 'performance_degradation');
        break;
      case 'wear':
        effects.push('tolerance_drift', 'efficiency_loss');
        break;
      case 'chemical':
        effects.push('contamination', 'corrosion_spread');
        break;
    }

    return effects;
  }

  private estimateRepairTime(failureMode: FailureMode): number {
    const baseTime = {
      'low': 3600,      // 1 hour
      'medium': 14400,  // 4 hours
      'high': 28800,    // 8 hours
      'critical': 86400 // 24 hours
    };

    return baseTime[failureMode.severity];
  }

  private estimateRepairCost(failureMode: FailureMode): number {
    const baseCost = {
      'low': 100,
      'medium': 500,
      'high': 2000,
      'critical': 10000
    };

    return baseCost[failureMode.severity];
  }

  private processCascadeEffects(failure: FailureEvent): void {
    failure.failureMode.cascadeEffects.forEach(effectId => {
      const affectedComponent = this.components.get(effectId);
      if (affectedComponent) {
        // Increase stress on affected component
        const currentStress = affectedComponent.stressFactors.get('cascade_stress') || 0;
        affectedComponent.stressFactors.set('cascade_stress', currentStress + 0.5);
        this.updateDegradationRate(affectedComponent);
      }
    });
  }

  // Overvoltage/Overcurrent Effects
  simulateOvervoltage(componentId: string, voltage: number, duration: number): void {
    const component = this.components.get(componentId);
    if (!component) return;

    const ratedVoltage = component.stressFactors.get('rated_voltage') || 12;
    const overvoltageRatio = voltage / ratedVoltage;

    if (overvoltageRatio > 1.2) { // 20% overvoltage
      // Immediate damage
      const damage = Math.min(0.5, (overvoltageRatio - 1) * duration / 10);
      component.healthScore -= damage;

      // Add failure event if severe
      if (overvoltageRatio > 2.0) {
        const failure: FailureEvent = {
          id: `overvoltage_${Date.now()}`,
          componentId,
          failureMode: {
            id: 'overvoltage_failure',
            type: 'electrical',
            severity: 'critical',
            probability: 1,
            timeToFailure: 0,
            cascadeEffects: []
          },
          timestamp: this.currentTime,
          cause: 'overvoltage',
          effects: ['component_destruction', 'fire_risk'],
          repairTime: 86400,
          repairCost: 5000
        };

        this.failureEvents.push(failure);
      }
    }
  }

  simulateOvercurrent(componentId: string, current: number, duration: number): void {
    const component = this.components.get(componentId);
    if (!component) return;

    const ratedCurrent = component.stressFactors.get('rated_current') || 1;
    const overcurrentRatio = current / ratedCurrent;

    if (overcurrentRatio > 1.1) { // 10% overcurrent
      // Thermal damage
      const thermalDamage = Math.min(0.3, (overcurrentRatio - 1) * duration / 5);
      component.healthScore -= thermalDamage;

      // Update temperature stress
      const additionalTemp = (overcurrentRatio - 1) * 50; // Simplified heating
      const currentTemp = component.stressFactors.get('temperature') || 25;
      component.stressFactors.set('temperature', currentTemp + additionalTemp);
    }
  }

  // Thermal Runaway Simulation
  simulateThermalRunaway(componentId: string): void {
    const component = this.components.get(componentId);
    if (!component) return;

    // Exponential temperature increase
    const currentTemp = component.stressFactors.get('temperature') || 25;
    const newTemp = currentTemp * 1.5; // 50% increase per step
    component.stressFactors.set('temperature', newTemp);

    // Rapid health degradation
    component.healthScore -= 0.1;

    // Check for catastrophic failure
    if (newTemp > 150) { // Critical temperature
      const failure: FailureEvent = {
        id: `thermal_runaway_${Date.now()}`,
        componentId,
        failureMode: {
          id: 'thermal_runaway',
          type: 'thermal',
          severity: 'critical',
          probability: 1,
          timeToFailure: 0,
          cascadeEffects: ['fire_spread', 'adjacent_component_damage']
        },
        timestamp: this.currentTime,
        cause: 'thermal_runaway',
        effects: ['fire', 'toxic_fumes', 'system_shutdown'],
        repairTime: 172800, // 48 hours
        repairCost: 20000
      };

      this.failureEvents.push(failure);
    }
  }

  // Wear and Degradation Over Time
  simulateWearDegradation(componentId: string, cycleCount: number): void {
    const component = this.components.get(componentId);
    if (!component) return;

    // Fatigue damage accumulation
    const fatigueStress = component.stressFactors.get('mechanical_stress') || 0;
    const yieldStrength = component.stressFactors.get('yield_strength') || 1e9;
    const stressRatio = fatigueStress / yieldStrength;

    // Miner's rule for fatigue damage
    const fatigueLife = Math.pow(10, 6 - 3 * Math.log10(stressRatio)); // S-N curve
    const damagePerCycle = 1 / fatigueLife;
    const totalDamage = damagePerCycle * cycleCount;

    component.healthScore -= totalDamage;

    // Surface wear
    const wearRate = 1e-6; // mm per cycle
    const totalWear = wearRate * cycleCount;
    component.stressFactors.set('wear_depth', totalWear);
  }

  // Maintenance and Repair
  performMaintenance(
    componentId: string,
    maintenanceType: 'inspection' | 'repair' | 'replacement' | 'calibration',
    effectiveness: number = 0.8
  ): void {
    const component = this.components.get(componentId);
    if (!component) return;

    const maintenanceRecord: MaintenanceRecord = {
      date: new Date(),
      type: maintenanceType,
      description: `${maintenanceType} performed`,
      cost: this.calculateMaintenanceCost(maintenanceType),
      effectiveness
    };

    component.maintenanceHistory.push(maintenanceRecord);

    // Improve component health based on maintenance type
    switch (maintenanceType) {
      case 'inspection':
        // No direct health improvement, but may detect issues early
        break;
      case 'repair':
        component.healthScore = Math.min(1, component.healthScore + 0.3 * effectiveness);
        break;
      case 'replacement':
        component.healthScore = 1.0;
        component.stressFactors.clear();
        break;
      case 'calibration':
        component.healthScore = Math.min(1, component.healthScore + 0.1 * effectiveness);
        break;
    }
  }

  private calculateMaintenanceCost(maintenanceType: string): number {
    const costs = {
      'inspection': 50,
      'repair': 500,
      'replacement': 2000,
      'calibration': 200
    };

    return costs[maintenanceType as keyof typeof costs] || 100;
  }

  // Reliability Analysis
  calculateMTBF(componentId: string): number {
    const component = this.components.get(componentId);
    if (!component) return 0;

    // Mean Time Between Failures calculation
    const failureRate = component.degradationRate * 3600; // per hour
    return failureRate > 0 ? 1 / failureRate : Infinity;
  }

  calculateReliability(componentId: string, time: number): number {
    const mtbf = this.calculateMTBF(componentId);
    return Math.exp(-time / mtbf);
  }

  // Visualization Data
  getFailureVisualization(): FailureVisualizationData[] {
    const visualizationData: FailureVisualizationData[] = [];

    this.components.forEach(component => {
      const riskLevel = 1 - component.healthScore;
      
      visualizationData.push({
        componentId: component.id,
        healthScore: component.healthScore,
        riskLevel,
        color: this.riskToColor(riskLevel),
        failureModes: component.failureModes,
        timeToFailure: this.estimateTimeToFailure(component)
      });
    });

    return visualizationData;
  }

  private riskToColor(riskLevel: number): THREE.Color {
    // Green (low risk) to Red (high risk)
    return new THREE.Color(riskLevel, 1 - riskLevel, 0);
  }

  private estimateTimeToFailure(component: ComponentHealth): number {
    if (component.healthScore <= 0) return 0;
    return component.healthScore / component.degradationRate;
  }

  // Getters
  getComponent(id: string): ComponentHealth | undefined {
    return this.components.get(id);
  }

  getFailureEvents(): FailureEvent[] {
    return this.failureEvents;
  }

  getSystemReliability(): number {
    let totalReliability = 1;
    
    this.components.forEach(component => {
      const componentReliability = component.healthScore;
      totalReliability *= componentReliability;
    });

    return totalReliability;
  }
}

// Supporting Interfaces
interface FailureVisualizationData {
  componentId: string;
  healthScore: number;
  riskLevel: number;
  color: THREE.Color;
  failureModes: FailureMode[];
  timeToFailure: number;
}