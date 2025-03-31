import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./LanguageModal";

import en from "../../resources/lang/en.json";
import ja from "../../resources/lang/ja.json";
import fr from "../../resources/lang/fr.json";
import bg from "../../resources/lang/bg.json";
import nl from "../../resources/lang/nl.json";
import ru from "../../resources/lang/ru.json";
import ua from "../../resources/lang/ua.json";
import de from "../../resources/lang/de.json";

@customElement("lang-selector")
export class LangSelector extends LitElement {
  @state() public translations: any = {};
  @state() private defaultTranslations: any = {};
  @state() private currentLang: string = "en";
  @state() private languageList: any[] = [];
  @state() private showModal: boolean = false;
  @state() private debugMode: boolean = false;

  private dKeyPressed: boolean = false;

  private languageMap: Record<string, any> = {
    en,
    ja,
    fr,
    bg,
    nl,
    ru,
    ua,
    de,
  };

  static styles = css`
    .modal {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 50;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal.hidden {
      display: none;
    }
    .modal-content {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
      padding: 1.5rem;
      width: 24rem;
      max-width: 100%;
    }
    .lang-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.3s;
    }
    .lang-button:hover {
      background-color: #ebf8ff;
    }
    .lang-button.active {
      background-color: #bee3f8;
    }
    .close-button {
      margin-top: 1rem;
      width: 100%;
      background-color: #3182ce;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    .close-button:hover {
      background-color: #2b6cb0;
    }
  `;

  createRenderRoot() {
    return this; // Use Light DOM if you prefer this
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupDebugKey();
    this.initializeLanguage();
  }

  private setupDebugKey() {
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "t") this.dKeyPressed = true;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() === "t") this.dKeyPressed = false;
    });
  }

  private async initializeLanguage() {
    const locale = new Intl.Locale(navigator.language);
    const defaultLang = locale.language;
    const userLang = localStorage.getItem("lang") || defaultLang;

    this.defaultTranslations = await this.loadLanguage("en");
    this.translations = await this.loadLanguage(userLang);
    this.currentLang = userLang;

    await this.loadLanguageList();
    this.applyTranslation(this.translations);
  }

  private async loadLanguage(lang: string): Promise<any> {
    return Promise.resolve(this.languageMap[lang] || {});
  }

  private async loadLanguageList() {
    try {
      const data = this.languageMap;
      let list: any[] = [];

      const browserLang = new Intl.Locale(navigator.language).language;

      for (const langCode of Object.keys(data)) {
        const langData = data[langCode].lang;
        if (!langData) continue;

        list.push({
          code: langData.lang_code ?? langCode,
          native: langData.native ?? langCode,
          en: langData.en ?? langCode,
          svg: langData.svg ?? langCode,
        });
      }

      let debugLang: any = null;
      if (this.dKeyPressed) {
        debugLang = {
          code: "debug",
          native: "Debug",
          en: "Debug",
          svg: "xx",
        };
        this.debugMode = true;
      }

      const currentLangEntry = list.find((l) => l.code === this.currentLang);
      const browserLangEntry =
        browserLang !== this.currentLang && browserLang !== "en"
          ? list.find((l) => l.code === browserLang)
          : undefined;
      const englishEntry =
        this.currentLang !== "en"
          ? list.find((l) => l.code === "en")
          : undefined;

      list = list.filter(
        (l) =>
          l.code !== this.currentLang &&
          l.code !== browserLang &&
          l.code !== "en" &&
          l.code !== "debug",
      );

      list.sort((a, b) => a.en.localeCompare(b.en));

      const finalList: any[] = [];
      if (currentLangEntry) finalList.push(currentLangEntry);
      if (englishEntry) finalList.push(englishEntry);
      if (browserLangEntry) finalList.push(browserLangEntry);
      finalList.push(...list);
      if (debugLang) finalList.push(debugLang);

      this.languageList = finalList;
    } catch (err) {
      console.error("Failed to load language list:", err);
    }
  }

  private async changeLanguage(lang: string) {
    localStorage.setItem("lang", lang);
    this.translations = await this.loadLanguage(lang);
    this.currentLang = lang;
    this.applyTranslation(this.translations);
    this.showModal = false;
  }

  private applyTranslation(translations: any) {
    const components = [
      "single-player-modal",
      "host-lobby-modal",
      "join-private-lobby-modal",
      "emoji-table",
      "leader-board",
      "build-menu",
      "win-modal",
      "game-starting-modal",
      "top-bar",
      "player-panel",
      "help-modal",
      "username-input",
      "public-lobby",
      "o-modal",
      "o-button",
    ];

    document.title = translations.main?.title || document.title;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const keys = key?.split(".") || [];
      let text = translations;

      for (const k of keys) {
        text = text?.[k];
        if (!text) break;
      }

      if (!text && this.defaultTranslations) {
        let fallback = this.defaultTranslations;
        for (const k of keys) {
          fallback = fallback?.[k];
          if (!fallback) break;
        }
        text = fallback;
      }

      if (text) {
        element.innerHTML = text;
      } else {
        console.warn(`Translation key not found: ${key}`);
      }
    });

    components.forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        if (typeof (el as any).requestUpdate === "function") {
          (el as any).requestUpdate();
        }
      });
    });
  }

  public translateText(
    key: string,
    params: Record<string, string | number> = {},
  ): string {
    const keys = key.split(".");
    let text: any = this.translations;

    for (const k of keys) {
      text = text?.[k];
      if (!text) break;
    }

    if (!text && this.defaultTranslations) {
      text = this.defaultTranslations;
      for (const k of keys) {
        text = text?.[k];
        if (!text) return key;
      }
    }

    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, String(value));
    }

    return text;
  }

  private openModal() {
    this.debugMode = this.dKeyPressed;
    this.showModal = true;
    this.loadLanguageList();
  }

  render() {
    const currentLang =
      this.languageList.find((l) => l.code === this.currentLang) ??
      (this.currentLang === "debug"
        ? {
            code: "debug",
            native: "Debug",
            en: "Debug",
            svg: "xx",
          }
        : {
            native: "English",
            en: "English",
            svg: "xx",
          });

    return html`
      <div class="container__row">
        <button
          id="lang-selector"
          @click=${this.openModal}
          class="text-center appearance-none w-full bg-blue-100 hover:bg-blue-200 text-blue-900 p-3 sm:p-4 lg:p-5 font-medium text-sm sm:text-base lg:text-lg rounded-md border-none cursor-pointer transition-colors duration-300 flex items-center gap-2 justify-center"
        >
          <img
            id="lang-flag"
            class="w-6 h-4"
            src="/flags/${currentLang.svg}.svg"
            alt="flag"
          />
          <span id="lang-name">${currentLang.native} (${currentLang.en})</span>
        </button>
      </div>

      <language-modal
        .visible=${this.showModal}
        .languageList=${this.languageList}
        .currentLang=${this.currentLang}
        @language-selected=${(e: CustomEvent) =>
          this.changeLanguage(e.detail.lang)}
        @close-modal=${() => (this.showModal = false)}
      ></language-modal>
    `;
  }
}
