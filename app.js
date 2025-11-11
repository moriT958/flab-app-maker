// ===========================
// Dialog Manager
// ===========================

class DialogManager {
  constructor() {
    this.overlay = document.getElementById("modalOverlay");
    this.title = document.getElementById("modalTitle");
    this.message = document.getElementById("modalMessage");
    this.input = document.getElementById("modalInput");
    this.confirmBtn = document.getElementById("modalConfirm");
    this.cancelBtn = document.getElementById("modalCancel");
    this.closeBtn = document.getElementById("modalClose");
    this.toast = document.getElementById("toast");

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.closeBtn.addEventListener("click", () => this.hideModal());
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.hideModal();
      }
    });

    // ESC key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("show")) {
        this.hideModal();
      }
    });
  }

  showModal() {
    this.overlay.classList.add("show");
    // Focus input if visible
    if (this.input.style.display !== "none") {
      setTimeout(() => this.input.focus(), 100);
    }
  }

  hideModal() {
    this.overlay.classList.remove("show");
    // Clear input
    this.input.value = "";
  }

  async prompt(title, message, defaultValue = "") {
    return new Promise((resolve) => {
      this.title.textContent = title;
      this.message.textContent = message;
      this.input.style.display = "block";
      this.input.value = defaultValue;
      this.cancelBtn.style.display = "block";

      const handleConfirm = () => {
        const value = this.input.value.trim();
        cleanup();
        this.hideModal();
        resolve(value || null);
      };

      const handleCancel = () => {
        cleanup();
        this.hideModal();
        resolve(null);
      };

      const handleEnter = (e) => {
        if (e.key === "Enter") {
          handleConfirm();
        }
      };

      const cleanup = () => {
        this.confirmBtn.removeEventListener("click", handleConfirm);
        this.cancelBtn.removeEventListener("click", handleCancel);
        this.input.removeEventListener("keydown", handleEnter);
      };

      this.confirmBtn.addEventListener("click", handleConfirm);
      this.cancelBtn.addEventListener("click", handleCancel);
      this.input.addEventListener("keydown", handleEnter);

      this.showModal();
    });
  }

  async confirm(title, message) {
    return new Promise((resolve) => {
      this.title.textContent = title;
      this.message.textContent = message;
      this.input.style.display = "none";
      this.cancelBtn.style.display = "block";

      const handleConfirm = () => {
        cleanup();
        this.hideModal();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        this.hideModal();
        resolve(false);
      };

      const cleanup = () => {
        this.confirmBtn.removeEventListener("click", handleConfirm);
        this.cancelBtn.removeEventListener("click", handleCancel);
      };

      this.confirmBtn.addEventListener("click", handleConfirm);
      this.cancelBtn.addEventListener("click", handleCancel);

      this.showModal();
    });
  }

  showToast(message, type = "info", duration = 3000) {
    this.toast.textContent = message;
    this.toast.className = `toast show ${type}`;

    setTimeout(() => {
      this.toast.classList.remove("show");
    }, duration);
  }
}

// ===========================
// Data Models & Initial State
// ===========================

const STORAGE_KEY = "bdd-feature-editor-v2";

// Generate unique ID
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create default feature
const createDefaultFeature = (name = "NewFeature", description = "") => ({
  id: generateId(),
  name,
  tags: "",
  description,
  background: [{ id: generateId(), type: "Given", text: "" }],
  scenarios: [
    {
      id: generateId(),
      name: "Scenario 1",
      steps: [
        { id: generateId(), type: "Given", text: "" },
        { id: generateId(), type: "When", text: "" },
        { id: generateId(), type: "Then", text: "" },
      ],
    },
  ],
});

// Initial sample data
const initialFeatures = [
  {
    id: generateId(),
    name: "Login",
    tags: "認証 / 学生",
    description: "ユーザーが正しい認証情報でログインできる",
    background: [
      { id: generateId(), type: "Given", text: "ログインページを開いている" },
      {
        id: generateId(),
        type: "And",
        text: "有効なアカウントが登録されている",
      },
    ],
    scenarios: [
      {
        id: generateId(),
        name: "正しい情報でログインできる",
        steps: [
          {
            id: generateId(),
            type: "Given",
            text: "ログインページを開いている",
          },
          { id: generateId(), type: "When", text: "正しい情報を入力する" },
          { id: generateId(), type: "Then", text: "ホーム画面が表示される" },
        ],
      },
      {
        id: generateId(),
        name: "誤った情報でログインできない",
        steps: [
          {
            id: generateId(),
            type: "Given",
            text: "ログインページを開いている",
          },
          {
            id: generateId(),
            type: "When",
            text: "誤ったパスワードを入力する",
          },
          {
            id: generateId(),
            type: "Then",
            text: "エラーメッセージが表示される",
          },
        ],
      },
    ],
  },
  {
    id: generateId(),
    name: "CourseRegistration",
    tags: "履修",
    description: "学生が履修登録を行う",
    background: [
      { id: generateId(), type: "Given", text: "ログイン済みである" },
    ],
    scenarios: [
      {
        id: generateId(),
        name: "履修登録ができる",
        steps: [
          {
            id: generateId(),
            type: "Given",
            text: "履修登録ページを開いている",
          },
          { id: generateId(), type: "When", text: "科目を選択する" },
          { id: generateId(), type: "Then", text: "履修登録が完了する" },
        ],
      },
    ],
  },
];

// ===========================
// State Management
// ===========================

class AppState {
  constructor() {
    this.features = this.loadFromStorage() || initialFeatures;
    this.currentFeatureId = this.features[0]?.id || null;
    this.saveToStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load from storage:", e);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.features));
    } catch (e) {
      console.error("Failed to save to storage:", e);
    }
  }

  getCurrentFeature() {
    return this.features.find((f) => f.id === this.currentFeatureId);
  }

  setCurrentFeature(featureId) {
    this.currentFeatureId = featureId;
  }

  addFeature(feature) {
    this.features.push(feature);
    this.currentFeatureId = feature.id;
    this.saveToStorage();
  }

  deleteFeature(featureId) {
    const index = this.features.findIndex((f) => f.id === featureId);
    if (index !== -1) {
      this.features.splice(index, 1);
      if (this.currentFeatureId === featureId) {
        this.currentFeatureId = this.features[0]?.id || null;
      }
      this.saveToStorage();
    }
  }

  updateFeature(featureId, updates) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      Object.assign(feature, updates);
      this.saveToStorage();
    }
  }

  addScenario(featureId, scenario) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      feature.scenarios.push(scenario);
      this.saveToStorage();
    }
  }

  deleteScenario(featureId, scenarioId) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      const index = feature.scenarios.findIndex((s) => s.id === scenarioId);
      if (index !== -1) {
        feature.scenarios.splice(index, 1);
        this.saveToStorage();
      }
    }
  }

  duplicateScenario(featureId, scenarioId) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      const scenario = feature.scenarios.find((s) => s.id === scenarioId);
      if (scenario) {
        const duplicate = {
          id: generateId(),
          name: scenario.name + " (コピー)",
          steps: scenario.steps.map((step) => ({
            id: generateId(),
            type: step.type,
            text: step.text,
          })),
        };
        feature.scenarios.push(duplicate);
        this.saveToStorage();
      }
    }
  }

  addStep(featureId, scenarioId, step, isBackground = false) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      if (isBackground) {
        feature.background.push(step);
      } else {
        const scenario = feature.scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          scenario.steps.push(step);
        }
      }
      this.saveToStorage();
    }
  }

  deleteStep(featureId, scenarioId, stepId, isBackground = false) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      if (isBackground) {
        const index = feature.background.findIndex((s) => s.id === stepId);
        if (index !== -1) {
          feature.background.splice(index, 1);
        }
      } else {
        const scenario = feature.scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          const index = scenario.steps.findIndex((s) => s.id === stepId);
          if (index !== -1) {
            scenario.steps.splice(index, 1);
          }
        }
      }
      this.saveToStorage();
    }
  }

  updateStep(featureId, scenarioId, stepId, text, isBackground = false) {
    const feature = this.features.find((f) => f.id === featureId);
    if (feature) {
      if (isBackground) {
        const step = feature.background.find((s) => s.id === stepId);
        if (step) step.text = text;
      } else {
        const scenario = feature.scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          const step = scenario.steps.find((s) => s.id === stepId);
          if (step) step.text = text;
        }
      }
      this.saveToStorage();
    }
  }
}

// ===========================
// Gherkin Generator
// ===========================

const generateGherkin = (feature) => {
  if (!feature) return "";

  let gherkin = `Feature: ${feature.name}\n`;

  if (feature.description) {
    gherkin += `  ${feature.description}\n`;
  }

  if (
    feature.background &&
    feature.background.length > 0 &&
    feature.background.some((s) => s.text)
  ) {
    gherkin += `\n  Background:\n`;
    feature.background.forEach((step) => {
      if (step.text) {
        gherkin += `    ${step.type} ${step.text}\n`;
      }
    });
  }

  feature.scenarios.forEach((scenario) => {
    gherkin += `\n  Scenario: ${scenario.name}\n`;
    scenario.steps.forEach((step) => {
      if (step.text) {
        gherkin += `    ${step.type} ${step.text}\n`;
      }
    });
  });

  return gherkin;
};

// ===========================
// UI Rendering
// ===========================

class UI {
  constructor(state, dialog) {
    this.state = state;
    this.dialog = dialog;
    this.featureListEl = document.getElementById("featureList");
    this.editorContentEl = document.getElementById("editorContent");
    this.addFeatureBtnEl = document.getElementById("addFeatureBtn");
    this.manageBtnEl = document.getElementById("manageBtn");

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.addFeatureBtnEl.addEventListener("click", () =>
      this.handleAddFeature(),
    );
    this.manageBtnEl.addEventListener("click", () => this.handleManage());
  }

  render() {
    this.renderFeatureList();
    this.renderEditor();
  }

  renderFeatureList() {
    this.featureListEl.innerHTML = this.state.features
      .map((feature) => {
        const isActive = feature.id === this.state.currentFeatureId;
        const icon = feature.name
          .split(/(?=[A-Z])/)
          .map((w) => w[0])
          .join("")
          .substr(0, 2)
          .toUpperCase();

        return `
        <div class="feature-item ${isActive ? "active" : ""}" data-feature-id="${feature.id}" role="listitem">
          <div class="icon">${icon}</div>
          <div class="meta">
            <div class="meta-title">${this.escapeHtml(feature.name)}</div>
            <div class="meta-subtitle">${this.escapeHtml(feature.tags || "")}</div>
          </div>
        </div>
      `;
      })
      .join("");

    // Add click handlers
    this.featureListEl.querySelectorAll(".feature-item").forEach((item) => {
      item.addEventListener("click", () => {
        const featureId = item.getAttribute("data-feature-id");
        this.handleFeatureSelect(featureId);
      });
    });
  }

  renderEditor() {
    const feature = this.state.getCurrentFeature();

    if (!feature) {
      this.editorContentEl.innerHTML = `
        <div class="empty-state">
          <h2>Feature がありません</h2>
          <p>「＋ Add Feature」ボタンから新しい Feature を作成してください</p>
        </div>
      `;
      return;
    }

    this.editorContentEl.innerHTML = `
      <h1>Feature: <span class="feature-name">${this.escapeHtml(feature.name)}</span></h1>

      <div class="row">
        <div class="field flex-1">
          <label for="featureName">Feature 名</label>
          <input id="featureName" type="text" value="${this.escapeHtml(feature.name)}" />
        </div>
        <div class="field" style="width:280px">
          <label for="featureTags">タグ / ドメイン</label>
          <input id="featureTags" type="text" value="${this.escapeHtml(feature.tags)}" />
        </div>
      </div>

      <div class="field">
        <label for="featureDescription">Description</label>
        <textarea id="featureDescription">${this.escapeHtml(feature.description)}</textarea>
      </div>

      <div class="split">
        <div>
          ${this.renderBackground(feature)}
          ${this.renderScenarios(feature)}
        </div>
        <aside style="display:flex; flex-direction:column; gap:12px;">
          ${this.renderPreview(feature)}
          ${this.renderActions(feature)}
        </aside>
      </div>
    `;

    this.attachEditorEventListeners(feature);
  }

  renderBackground(feature) {
    const stepsHtml = feature.background
      .map(
        (step) => `
      <div class="step" data-step-id="${step.id}">
        <div class="tag">${step.type}</div>
        <input type="text" value="${this.escapeHtml(step.text)}" data-step-id="${step.id}" />
        <div class="step-delete" data-step-id="${step.id}">×</div>
      </div>
    `,
      )
      .join("");

    return `
      <section class="section">
        <h3>Background</h3>
        ${stepsHtml}
        <div class="add-step-btn" data-context="background">＋ Step を追加</div>
      </section>
    `;
  }

  renderScenarios(feature) {
    const scenariosHtml = feature.scenarios
      .map((scenario, index) => {
        const stepsHtml = scenario.steps
          .map(
            (step) => `
        <div class="step" data-step-id="${step.id}">
          <div class="tag">${step.type}</div>
          <input type="text" value="${this.escapeHtml(step.text)}" data-step-id="${step.id}" data-scenario-id="${scenario.id}" />
          <div class="step-delete" data-step-id="${step.id}" data-scenario-id="${scenario.id}">×</div>
        </div>
      `,
          )
          .join("");

        return `
        <details class="scenario" ${index === 0 ? "open" : ""} data-scenario-id="${scenario.id}">
          <summary>Scenario: ${this.escapeHtml(scenario.name)}</summary>
          <div class="scenario-body">
            ${stepsHtml}
            <div class="add-step-btn" data-context="scenario" data-scenario-id="${scenario.id}">＋ Step を追加</div>
          </div>
        </details>
      `;
      })
      .join("");

    return `
      <section class="section mt-2">
        <h3>Scenarios</h3>
        ${scenariosHtml}
        <div class="scenario-controls">
          <button class="secondary" id="addScenarioBtn">＋ Scenario 追加</button>
        </div>
      </section>
    `;
  }

  renderPreview(feature) {
    const gherkin = generateGherkin(feature);
    return `
      <section class="section gherkin-preview">
        <h3>Gherkin プレビュー</h3>
        <pre>${this.escapeHtml(gherkin)}</pre>
      </section>
    `;
  }

  renderActions(feature) {
    return `
      <section class="section">
        <h3>Actions</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="primary" id="generateGherkinBtn">📝 Gherkin を生成</button>
          <button class="secondary" id="exportJsonBtn">💾 JSON エクスポート</button>
          <button class="danger" id="deleteFeatureBtn">🗑️ Feature を削除</button>
        </div>
      </section>
    `;
  }

  attachEditorEventListeners(feature) {
    // Feature name, tags, description
    const nameInput = document.getElementById("featureName");
    const tagsInput = document.getElementById("featureTags");
    const descInput = document.getElementById("featureDescription");

    nameInput?.addEventListener("input", (e) => {
      this.state.updateFeature(feature.id, { name: e.target.value });
      this.render();
    });

    tagsInput?.addEventListener("input", (e) => {
      this.state.updateFeature(feature.id, { tags: e.target.value });
      this.renderFeatureList();
    });

    descInput?.addEventListener("input", (e) => {
      this.state.updateFeature(feature.id, { description: e.target.value });
      this.renderPreviewOnly();
    });

    // Background steps
    document.querySelectorAll(".step input[data-step-id]").forEach((input) => {
      const stepId = input.getAttribute("data-step-id");
      const scenarioId = input.getAttribute("data-scenario-id");
      const isBackground = !scenarioId;

      input.addEventListener("input", (e) => {
        this.state.updateStep(
          feature.id,
          scenarioId,
          stepId,
          e.target.value,
          isBackground,
        );
        this.renderPreviewOnly();
      });
    });

    // Delete step buttons
    document.querySelectorAll(".step-delete").forEach((btn) => {
      const stepId = btn.getAttribute("data-step-id");
      const scenarioId = btn.getAttribute("data-scenario-id");
      const isBackground = !scenarioId;

      btn.addEventListener("click", () => {
        this.state.deleteStep(feature.id, scenarioId, stepId, isBackground);
        this.render();
      });
    });

    // Add step buttons
    document.querySelectorAll(".add-step-btn").forEach((btn) => {
      const context = btn.getAttribute("data-context");
      const scenarioId = btn.getAttribute("data-scenario-id");

      btn.addEventListener("click", () => {
        const stepType = context === "background" ? "And" : "And";
        const newStep = { id: generateId(), type: stepType, text: "" };
        this.state.addStep(
          feature.id,
          scenarioId,
          newStep,
          context === "background",
        );
        this.render();
      });
    });

    // Add scenario button
    const addScenarioBtn = document.getElementById("addScenarioBtn");
    addScenarioBtn?.addEventListener("click", () => {
      const newScenario = {
        id: generateId(),
        name: `新しいシナリオ ${feature.scenarios.length + 1}`,
        steps: [
          { id: generateId(), type: "Given", text: "" },
          { id: generateId(), type: "When", text: "" },
          { id: generateId(), type: "Then", text: "" },
        ],
      };
      this.state.addScenario(feature.id, newScenario);
      this.render();
    });

    // Scenario context menus (for duplicate/delete)
    document.querySelectorAll(".scenario summary").forEach((summary) => {
      const scenarioEl = summary.closest(".scenario");
      const scenarioId = scenarioEl?.getAttribute("data-scenario-id");

      summary.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.showScenarioContextMenu(e, feature.id, scenarioId);
      });
    });

    // Action buttons
    const generateBtn = document.getElementById("generateGherkinBtn");
    generateBtn?.addEventListener("click", () =>
      this.handleGenerateGherkin(feature),
    );

    const exportJsonBtn = document.getElementById("exportJsonBtn");
    exportJsonBtn?.addEventListener("click", () => this.handleExportJson());

    const deleteFeatureBtn = document.getElementById("deleteFeatureBtn");
    deleteFeatureBtn?.addEventListener("click", () =>
      this.handleDeleteFeature(feature.id),
    );
  }

  renderPreviewOnly() {
    const feature = this.state.getCurrentFeature();
    if (!feature) return;

    const previewSection = document.querySelector(".gherkin-preview pre");
    if (previewSection) {
      previewSection.textContent = generateGherkin(feature);
    }
  }

  showScenarioContextMenu(e, featureId, scenarioId) {
    // Simple context menu implementation
    const menu = document.createElement("div");
    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px;
      left: ${e.clientX}px;
      background: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 4px;
      z-index: 1000;
    `;

    menu.innerHTML = `
      <button class="secondary" style="width:100%; margin-bottom:4px;">📋 複製</button>
      <button class="danger" style="width:100%;">🗑️ 削除</button>
    `;

    const [duplicateBtn, deleteBtn] = menu.querySelectorAll("button");

    duplicateBtn.addEventListener("click", () => {
      this.state.duplicateScenario(featureId, scenarioId);
      this.render();
      menu.remove();
    });

    deleteBtn.addEventListener("click", async () => {
      menu.remove();
      const confirmed = await this.dialog.confirm(
        "シナリオを削除",
        "このシナリオを削除しますか？",
      );
      if (confirmed) {
        this.state.deleteScenario(featureId, scenarioId);
        this.render();
      }
    });

    document.body.appendChild(menu);

    const removeMenu = () => {
      menu.remove();
      document.removeEventListener("click", removeMenu);
    };

    setTimeout(() => document.addEventListener("click", removeMenu), 100);
  }

  handleFeatureSelect(featureId) {
    this.state.setCurrentFeature(featureId);
    this.render();
  }

  async handleAddFeature() {
    const name = await this.dialog.prompt(
      "新しい Feature を追加",
      "Feature の名前を入力してください",
      "NewFeature",
    );
    if (name && name.trim()) {
      const newFeature = createDefaultFeature(name.trim());
      this.state.addFeature(newFeature);
      this.render();
      this.dialog.showToast("Feature を追加しました", "success");
    }
  }

  async handleDeleteFeature(featureId) {
    if (this.state.features.length === 1) {
      this.dialog.showToast("最後の Feature は削除できません", "error");
      return;
    }

    const confirmed = await this.dialog.confirm(
      "Feature を削除",
      "この Feature を削除しますか？",
    );
    if (confirmed) {
      this.state.deleteFeature(featureId);
      this.render();
      this.dialog.showToast("Feature を削除しました", "success");
    }
  }

  handleManage() {
    this.dialog.showToast("管理機能は今後実装予定です", "info");
  }

  handleGenerateGherkin(feature) {
    const gherkin = generateGherkin(feature);
    this.downloadFile(`${feature.name}.feature`, gherkin);
  }

  handleExportJson() {
    const json = JSON.stringify(this.state.features, null, 2);
    this.downloadFile("features.json", json);
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }
}

// ===========================
// Initialize App
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  const dialog = new DialogManager();
  const state = new AppState();
  const ui = new UI(state, dialog);
  ui.render();

  console.log("BDD Feature Editor v2 initialized");
  console.log(`Loaded ${state.features.length} features`);
});
