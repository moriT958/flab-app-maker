// Gherkin Editor Application
class GherkinEditor {
  constructor() {
    this.data = {
      feature: {
        name: "",
        description: "",
      },
      background: {
        steps: [],
      },
      scenarios: [],
    };

    this.currentModalTarget = null;
    this.init();
  }

  init() {
    this.bindElements();
    this.attachEventListeners();
    this.loadFromLocalStorage();
    this.render();
  }

  bindElements() {
    // Feature elements
    this.featureNameInput = document.getElementById("feature-name");
    this.featureDescriptionInput = document.getElementById(
      "feature-description",
    );

    // Background elements
    this.backgroundStepsContainer = document.getElementById("background-steps");
    this.addBackgroundStepBtn = document.getElementById("add-background-step");

    // Scenarios elements
    this.scenariosContainer = document.getElementById("scenarios-container");
    this.addScenarioBtn = document.getElementById("add-scenario");

    // Action buttons
    this.generateGherkinBtn = document.getElementById("generate-gherkin");
    this.saveDraftBtn = document.getElementById("save-draft");
    this.downloadGherkinBtn = document.getElementById("download-gherkin");

    // Preview
    this.gherkinPreview = document.getElementById("gherkin-preview");

    // Modal
    this.stepModal = document.getElementById("step-modal");
    this.cancelModalBtn = document.getElementById("cancel-modal");
  }

  attachEventListeners() {
    // Feature inputs
    this.featureNameInput.addEventListener("input", (e) => {
      this.data.feature.name = e.target.value;
      this.autoSaveDraft();
    });

    this.featureDescriptionInput.addEventListener("input", (e) => {
      this.data.feature.description = e.target.value;
      this.autoSaveDraft();
    });

    // Background
    this.addBackgroundStepBtn.addEventListener("click", () => {
      this.showStepModal("background");
    });

    // Scenarios
    this.addScenarioBtn.addEventListener("click", () => {
      this.addScenario();
    });

    // Actions
    this.generateGherkinBtn.addEventListener("click", () => {
      this.generateGherkinPreview();
    });

    this.saveDraftBtn.addEventListener("click", () => {
      this.saveToLocalStorage();
      alert("下書きを保存しました！");
    });

    this.downloadGherkinBtn.addEventListener("click", () => {
      this.downloadGherkin();
    });

    // Modal
    this.cancelModalBtn.addEventListener("click", () => {
      this.hideStepModal();
    });

    this.stepModal.addEventListener("click", (e) => {
      if (e.target === this.stepModal) {
        this.hideStepModal();
      }
    });

    // Step type selection
    document.querySelectorAll(".btn-step-type").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const stepType = e.target.dataset.type;
        this.addStep(stepType);
        this.hideStepModal();
      });
    });
  }

  showStepModal(target, scenarioIndex = null) {
    this.currentModalTarget = { type: target, scenarioIndex };
    this.stepModal.classList.add("active");
  }

  hideStepModal() {
    this.stepModal.classList.remove("active");
    this.currentModalTarget = null;
  }

  addStep(stepType) {
    if (!this.currentModalTarget) return;

    const step = {
      type: stepType,
      text: "",
    };

    if (this.currentModalTarget.type === "background") {
      this.data.background.steps.push(step);
    } else if (this.currentModalTarget.type === "scenario") {
      const scenarioIndex = this.currentModalTarget.scenarioIndex;
      this.data.scenarios[scenarioIndex].steps.push(step);
    }

    this.render();
    this.autoSaveDraft();
  }

  removeStep(type, stepIndex, scenarioIndex = null) {
    if (type === "background") {
      this.data.background.steps.splice(stepIndex, 1);
    } else if (type === "scenario" && scenarioIndex !== null) {
      this.data.scenarios[scenarioIndex].steps.splice(stepIndex, 1);
    }

    this.render();
    this.autoSaveDraft();
  }

  updateStepText(type, stepIndex, text, scenarioIndex = null) {
    if (type === "background") {
      this.data.background.steps[stepIndex].text = text;
    } else if (type === "scenario" && scenarioIndex !== null) {
      this.data.scenarios[scenarioIndex].steps[stepIndex].text = text;
    }

    this.autoSaveDraft();
  }

  addScenario() {
    this.data.scenarios.push({
      name: "",
      steps: [],
      collapsed: false,
    });

    this.render();
    this.autoSaveDraft();
  }

  removeScenario(scenarioIndex) {
    if (confirm("このシナリオを削除してもよろしいですか？")) {
      this.data.scenarios.splice(scenarioIndex, 1);
      this.render();
      this.autoSaveDraft();
    }
  }

  updateScenarioName(scenarioIndex, name) {
    this.data.scenarios[scenarioIndex].name = name;
    this.autoSaveDraft();
  }

  toggleScenarioCollapse(scenarioIndex) {
    this.data.scenarios[scenarioIndex].collapsed =
      !this.data.scenarios[scenarioIndex].collapsed;
    this.render();
  }

  render() {
    this.renderBackgroundSteps();
    this.renderScenarios();
  }

  renderBackgroundSteps() {
    this.backgroundStepsContainer.innerHTML = "";

    this.data.background.steps.forEach((step, index) => {
      const stepEl = this.createStepElement(step, index, "background");
      this.backgroundStepsContainer.appendChild(stepEl);
    });
  }

  renderScenarios() {
    this.scenariosContainer.innerHTML = "";

    this.data.scenarios.forEach((scenario, scenarioIndex) => {
      const scenarioEl = this.createScenarioElement(scenario, scenarioIndex);
      this.scenariosContainer.appendChild(scenarioEl);
    });
  }

  createStepElement(step, stepIndex, type, scenarioIndex = null) {
    const stepItem = document.createElement("div");
    stepItem.className = "step-item";

    const stepTypeEl = document.createElement("div");
    stepTypeEl.className = `step-type ${step.type.toLowerCase()}`;
    stepTypeEl.textContent = step.type;

    const stepInput = document.createElement("input");
    stepInput.type = "text";
    stepInput.className = "step-input";
    stepInput.value = step.text;
    stepInput.placeholder = `${step.type} の内容を入力...`;
    stepInput.addEventListener("input", (e) => {
      this.updateStepText(type, stepIndex, e.target.value, scenarioIndex);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove-step";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      this.removeStep(type, stepIndex, scenarioIndex);
    });

    stepItem.appendChild(stepTypeEl);
    stepItem.appendChild(stepInput);
    stepItem.appendChild(removeBtn);

    return stepItem;
  }

  createScenarioElement(scenario, scenarioIndex) {
    const scenarioItem = document.createElement("div");
    scenarioItem.className = "scenario-item";

    // Header
    const header = document.createElement("div");
    header.className = "scenario-header";

    const collapseBtn = document.createElement("button");
    collapseBtn.className = "collapse-btn";
    collapseBtn.textContent = scenario.collapsed ? "▸" : "▼";
    collapseBtn.addEventListener("click", () => {
      this.toggleScenarioCollapse(scenarioIndex);
    });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "scenario-name-input";
    nameInput.value = scenario.name;
    nameInput.placeholder = "Scenario: シナリオ名を入力...";
    nameInput.addEventListener("input", (e) => {
      this.updateScenarioName(scenarioIndex, e.target.value);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove-scenario";
    removeBtn.textContent = "削除";
    removeBtn.addEventListener("click", () => {
      this.removeScenario(scenarioIndex);
    });

    header.appendChild(collapseBtn);
    header.appendChild(nameInput);
    header.appendChild(removeBtn);

    // Content
    const content = document.createElement("div");
    content.className = `scenario-content ${scenario.collapsed ? "collapsed" : ""}`;

    const addStepBtn = document.createElement("button");
    addStepBtn.className = "btn-add-step";
    addStepBtn.textContent = "+ Add Step";
    addStepBtn.addEventListener("click", () => {
      this.showStepModal("scenario", scenarioIndex);
    });

    const stepsContainer = document.createElement("div");
    stepsContainer.className = "steps-container";

    scenario.steps.forEach((step, stepIndex) => {
      const stepEl = this.createStepElement(
        step,
        stepIndex,
        "scenario",
        scenarioIndex,
      );
      stepsContainer.appendChild(stepEl);
    });

    content.appendChild(addStepBtn);
    content.appendChild(stepsContainer);

    scenarioItem.appendChild(header);
    scenarioItem.appendChild(content);

    return scenarioItem;
  }

  generateGherkinPreview() {
    const gherkinText = this.generateGherkin();
    this.gherkinPreview.textContent = gherkinText;
  }

  generateGherkin() {
    let gherkin = "";

    // Feature
    if (this.data.feature.name) {
      gherkin += `Feature: ${this.data.feature.name}\n`;

      if (this.data.feature.description) {
        const descLines = this.data.feature.description.split("\n");
        descLines.forEach((line) => {
          gherkin += `  ${line}\n`;
        });
      }
      gherkin += "\n";
    }

    // Background
    if (this.data.background.steps.length > 0) {
      gherkin += "  Background:\n";
      this.data.background.steps.forEach((step) => {
        if (step.text) {
          gherkin += `    ${step.type} ${step.text}\n`;
        }
      });
      gherkin += "\n";
    }

    // Scenarios
    this.data.scenarios.forEach((scenario, index) => {
      if (scenario.name) {
        gherkin += `  Scenario: ${scenario.name}\n`;
        scenario.steps.forEach((step) => {
          if (step.text) {
            gherkin += `    ${step.type} ${step.text}\n`;
          }
        });

        if (index < this.data.scenarios.length - 1) {
          gherkin += "\n";
        }
      }
    });

    return (
      gherkin ||
      "# Gherkinファイルを生成するには、Feature名とシナリオを入力してください"
    );
  }

  downloadGherkin() {
    const gherkinText = this.generateGherkin();

    if (!this.data.feature.name) {
      alert("Feature名を入力してください");
      return;
    }

    // Create blob
    const blob = new Blob([gherkinText], { type: "text/plain;charset=utf-8" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.data.feature.name.replace(/\s+/g, "_")}.feature`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Gherkinファイルをダウンロードしました！");
  }

  saveToLocalStorage() {
    localStorage.setItem("gherkin-editor-data", JSON.stringify(this.data));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem("gherkin-editor-data");
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        this.featureNameInput.value = this.data.feature.name || "";
        this.featureDescriptionInput.value =
          this.data.feature.description || "";
      } catch (e) {
        console.error("Failed to load saved data:", e);
      }
    }
  }

  autoSaveDraft() {
    // Debounce auto-save
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveToLocalStorage();
    }, 1000);
  }
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.gherkinEditor = new GherkinEditor();
});
