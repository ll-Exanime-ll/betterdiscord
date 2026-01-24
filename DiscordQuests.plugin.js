/**
 * @name DiscordQuests
 * @author Exánime
 * @authorLink https://github.com/Exanime02
 * @description Complete missions with just a shortcut. Default: Ctrl+Q. Compatible with Discord Stable and Canary.
 * @version 3.5.1
 * @updateUrl https://raw.githubusercontent.com/Exanime02/BetterDiscord/main/DiscordQuests.plugin.js
 * @donate https://paypal.me/ExanimeTV
 * @source https://github.com/Exanime02/BetterDiscord
 * @website https://exanime.site/
 */

module.exports = class DiscordQuests {
  constructor() {
    this.defaultSettings = {
      shortcutKey: "q",
      modifier: "ctrl"
    };

    this.settings = BdApi.Data.load("DiscordQuests", "settings") || { ...this.defaultSettings };
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.PLUGIN_NAME = "DiscordQuests";
    this.UPDATE_URL = "https://raw.githubusercontent.com/Exanime02/BetterDiscord/main/DiscordQuests.plugin.js";

    const fs = require("fs");
    const path = require("path");
    try {
      const pluginPath = path.join(BdApi.Plugins.folder, "DiscordQuests.plugin.js");
      const content = fs.readFileSync(pluginPath, "utf8");
      const versionMatch = content.match(/@version\s+([0-9.]+)/);
      this.CURRENT_VERSION = versionMatch ? versionMatch[1] : "1.0.0";
    } catch (e) {
      this.CURRENT_VERSION = "1.0.0";
    }
  }

  start() {
    document.addEventListener("keydown", this.handleKeyDown);
    console.log("[DiscordQuests] Plugin started");
  }

  stop() {
    document.removeEventListener("keydown", this.handleKeyDown);
    console.log("[DiscordQuests] Plugin stopped");
  }

  handleKeyDown(event) {
    const modifier = (this.settings && this.settings.modifier) || this.defaultSettings.modifier;
    const shortcutKey = (this.settings && this.settings.shortcutKey) || this.defaultSettings.shortcutKey;

    let ctrlMatch = false, shiftMatch = false, altMatch = false;

    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;

    switch (modifier) {
      case "ctrl":
        ctrlMatch = hasCtrl;
        shiftMatch = !hasShift;
        altMatch = !hasAlt;
        break;
      case "shift":
        ctrlMatch = !hasCtrl;
        shiftMatch = hasShift;
        altMatch = !hasAlt;
        break;
      case "alt":
        ctrlMatch = !hasCtrl;
        shiftMatch = !hasShift;
        altMatch = hasAlt;
        break;
      case "ctrl+shift":
        ctrlMatch = hasCtrl;
        shiftMatch = hasShift;
        altMatch = !hasAlt;
        break;
      case "ctrl+alt":
        ctrlMatch = hasCtrl;
        shiftMatch = !hasShift;
        altMatch = hasAlt;
        break;
      case "shift+alt":
        ctrlMatch = !hasCtrl;
        shiftMatch = hasShift;
        altMatch = hasAlt;
        break;
      case "ctrl+shift+alt":
        ctrlMatch = hasCtrl;
        shiftMatch = hasShift;
        altMatch = hasAlt;
        break;
      default:
        ctrlMatch = hasCtrl;
        shiftMatch = !hasShift;
        altMatch = !hasAlt;
    }

    const keyMatch = String(event.key || "").toLowerCase() === String(shortcutKey || "").toLowerCase();

    if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
      event.preventDefault();
      this.runSnippet();
    }
  }

  async checkForUpdates(showUpToDateToast = true) {
    const toast = (message, type = "info") => {
      try { if (BdApi?.UI?.showToast) BdApi.UI.showToast(message, { type }); } catch (e) {}
      console.log(`[DiscordQuests] ${message}`);
    };

    const parseVersionFromSource = (src) => {
      const match = src.match(/@version\s+([0-9]+(?:\.[0-9]+){0,3})/i);
      return match ? match[1].trim() : null;
    };

    const compareVersions = (a, b) => {
      const pa = String(a).split(".").map(n => parseInt(n, 10) || 0);
      const pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
      const len = Math.max(pa.length, pb.length);
      for (let i = 0; i < len; i++) {
        const da = pa[i] ?? 0;
        const db = pb[i] ?? 0;
        if (da > db) return 1;
        if (da < db) return -1;
      }
      return 0;
    };

    try {
      if (!this.UPDATE_URL) {
        toast("No update URL configured.", "info");
        return;
      }

      toast("Checking for updates...", "info");
      const res = await fetch(this.UPDATE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const remoteSource = await res.text();
      const remoteVersion = parseVersionFromSource(remoteSource);

      if (!remoteVersion) {
        toast("Update check failed: could not read remote version.", "error");
        return;
      }

      const cmp = compareVersions(remoteVersion, this.CURRENT_VERSION);

      if (cmp <= 0) {
        if (showUpToDateToast) toast(`You're up to date (v${this.CURRENT_VERSION}).`, "success");
        return;
      }

      toast(`New version found: v${remoteVersion}. Downloading...`, "info");

      const fs = require("fs");
      const path = require("path");

      const pluginsFolder = BdApi.Plugins.folder;
      const filePath = path.join(pluginsFolder, `${this.PLUGIN_NAME}.plugin.js`);

      fs.writeFileSync(filePath, remoteSource, "utf8");

      toast(`Updated to v${remoteVersion}. Please reload Discord (Ctrl+R) or restart.`, "success");
    } catch (err) {
      console.error("[DiscordQuests] Update check error:", err);
      try { if (BdApi?.UI?.showToast) BdApi.UI.showToast(`Update check failed: ${String(err.message || err)}`, { type: "error" }); } catch (e) {}
    }
  }

  runSnippet() {
    try {
      console.log("[DiscordQuests] Shortcut triggered - Executing...");

      delete window.$;


      let webpackChunk;
      if (typeof webpackChunkdiscord_app !== "undefined") {
        webpackChunk = webpackChunkdiscord_app;
      } else if (typeof webpackChunkdiscord_canary !== "undefined") {
        webpackChunk = webpackChunkdiscord_canary;
      } else if (typeof webpackChunkdiscord_ptb !== "undefined") {
        webpackChunk = webpackChunkdiscord_ptb;
      } else {
        console.error("[DiscordQuests] Could not find Discord webpack chunk!");
        return;
      }

      let wpRequire = webpackChunk.push([[Symbol()], {}, r => r]);
      webpackChunk.pop();

      let ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata)?.exports?.Z;
      let RunningGameStore, QuestsStore, ChannelStore, GuildChannelStore, FluxDispatcher, api;

      if (!ApplicationStreamingStore) {
        ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getStreamerActiveStreamMetadata).exports.A;
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getRunningGames).exports.Ay;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getQuest).exports.A;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getAllThreadsForParent).exports.A;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getSFWDefaultChannel).exports.Ay;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.h?.__proto__?.flushWaitQueue).exports.h;
        api = Object.values(wpRequire.c).find(x => x?.exports?.Bo?.get).exports.Bo;
      } else {
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
        api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;
      }

      const supportedTasks = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"];
      let quests = [...QuestsStore.quests.values()].filter(x =>
        x.userStatus?.enrolledAt &&
        !x.userStatus?.completedAt &&
        new Date(x.config.expiresAt).getTime() > Date.now() &&
        supportedTasks.find(y => Object.keys((x.config.taskConfig ?? x.config.taskConfigV2).tasks).includes(y))
      );
      let isApp = typeof DiscordNative !== "undefined";

      if (quests.length === 0) {
        console.log("[DiscordQuests] You don't have any incomplete quests!");
      } else {
        let doJob = function () {
          const quest = quests.pop();
          if (!quest) return;

          const pid = Math.floor(Math.random() * 30000) + 1000;
          const applicationId = quest.config.application.id;
          const applicationName = quest.config.application.name;
          const questName = quest.config.messages.questName;
          const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
          const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
          const secondsNeeded = taskConfig.tasks[taskName].target;
          let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

          if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
            const maxFuture = 10, speed = 7, interval = 1;
            const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
            let completed = false;
            let fn = async () => {
              try {
                while (true) {
                  const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
                  const diff = maxAllowed - secondsDone;
                  const timestamp = secondsDone + speed;
                  if (diff >= speed) {
                    const res = await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) } });
                    completed = res.body.completed_at != null;
                    secondsDone = Math.min(secondsNeeded, timestamp);
                  }

                  if (timestamp >= secondsNeeded) {
                    break;
                  }
                  await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }
                if (!completed) {
                  await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
                }
                console.log("[DiscordQuests] Quest completed!");
                doJob();
              } catch (error) {
                console.error(`[DiscordQuests] Error in ${questName}:`, error);
              }
            };
            fn();
            console.log(`[DiscordQuests] Simulating video for ${questName}.`);
          } else if (taskName === "PLAY_ON_DESKTOP") {
            if (!isApp) {
              console.log(`[DiscordQuests] This no longer works in the browser for non-video quests. Use the Discord desktop app to complete the quest ${questName}!`);
            } else {
              api.get({ url: `/applications/public?application_ids=${applicationId}` }).then(res => {
                const appData = res.body[0];
                const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");

                const fakeGame = {
                  cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
                  exeName,
                  exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                  hidden: false,
                  isLauncher: false,
                  id: applicationId,
                  name: appData.name,
                  pid: pid,
                  pidPath: [pid],
                  processName: appData.name,
                  start: Date.now(),
                };
                const realGames = RunningGameStore.getRunningGames();
                const fakeGames = [fakeGame];
                const realGetRunningGames = RunningGameStore.getRunningGames;
                const realGetGameForPID = RunningGameStore.getGameForPID;
                RunningGameStore.getRunningGames = () => fakeGames;
                RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);
                FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                let fn = data => {
                  let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
                  console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                  if (progress >= secondsNeeded) {
                    console.log("[DiscordQuests] Quest completed!");

                    RunningGameStore.getRunningGames = realGetRunningGames;
                    RunningGameStore.getGameForPID = realGetGameForPID;
                    FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
                    FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                    doJob();
                  }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                console.log(`[DiscordQuests] Your game has been simulated as ${applicationName}. Wait ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
              }).catch(error => {
                console.error("[DiscordQuests] Error fetching application data:", error);
              });
            }
          } else if (taskName === "STREAM_ON_DESKTOP") {
            if (!isApp) {
              console.log(`[DiscordQuests] This no longer works in the browser for non-video quests. Use the Discord desktop app to complete the quest ${questName}!`);
            } else {
              let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
              ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                id: applicationId,
                pid,
                sourceName: null
              });

              let fn = data => {
                let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
                console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                if (progress >= secondsNeeded) {
                  console.log("[DiscordQuests] Quest completed!");

                  ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                  FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                  doJob();
                }
              };
              FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

              console.log(`[DiscordQuests] Your stream has been simulated as ${applicationName}. Stream any window in a voice channel for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
              console.log("[DiscordQuests] Remember you need at least 1 other person in the voice channel!");
            }
          } else if (taskName === "PLAY_ACTIVITY") {
            const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
            const streamKey = `call:${channelId}:1`;

            let fn = async () => {
              try {
                console.log(`[DiscordQuests] Completing quest ${questName} - ${quest.config.messages.questName}`);

                while (true) {
                  const res = await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
                  const progress = res.body.progress.PLAY_ACTIVITY.value;
                  console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                  await new Promise(resolve => setTimeout(resolve, 20 * 1000));

                  if (progress >= secondsNeeded) {
                    await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
                    break;
                  }
                }

                console.log("[DiscordQuests] Quest completed!");
                doJob();
              } catch (error) {
                console.error(`[DiscordQuests] Error in ${questName}:`, error);
              }
            };
            fn();
          }
        };
        doJob();
      }
    } catch (error) {
      console.error("[DiscordQuests] Critical error:", error);
    }
  }

  getSettingsPanel() {
    const saveSettings = () => BdApi.Data.save("DiscordQuests", "settings", this.settings);

    const container = document.createElement("div");
    container.style.padding = "20px 16px";
    container.style.color = "var(--text-normal, #FFFFFF)";
    container.style.fontFamily = "Whitney, Helvetica, Arial, sans-serif";

    const style = document.createElement("style");
    style.textContent = `
      .dq-row { display:flex; align-items:center; justify-content:space-between; gap:16px; margin: 8px 0; }
      .dq-label { width: 220px; font-weight:600; font-size:16px; color:var(--text-normal,#FFFFFF); } /* tamaño de fuente aumentado */
      .dq-input, .dq-select { width: 200px; }
      .dq-input input, .dq-select select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--background-modifier-hover,#2f3136);
        border: 1px solid rgba(0,0,0,0.2);
        color: var(--text-normal,#FFFFFF);
        box-sizing: border-box;
        font-size: 14px;
      }
      .dq-select { position:relative; }
      /* eliminada la flecha desplegable */
      .dq-divider { height:1px; background: rgba(255,255,255,0.06); margin:14px 0; border-radius:2px; }
      .dq-actions { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:8px; }
      .dq-update-title { font-weight: 600; font-size: 16px; margin-bottom: 6px; color: var(--text-normal,#FFFFFF); } /* título con mismo estilo */
      .dq-update-btn { padding:8px 14px; border-radius:8px; background: #3f8cff; color:white; border:none; cursor:pointer; }
      .dq-update-btn:hover { background:#3577e6; }
      .dq-note { color: rgba(181,186,193,1); font-size:12px; margin-top:6px; }
    `;
    container.appendChild(style);

    const rowKey = document.createElement("div");
    rowKey.className = "dq-row";
    const labelKey = document.createElement("div");
    labelKey.className = "dq-label";
    labelKey.textContent = "Shortcut Key";
    const inputWrap = document.createElement("div");
    inputWrap.className = "dq-input";

    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.value = this.settings.shortcutKey || "";
    inputEl.placeholder = "q";
    inputEl.addEventListener("input", (e) => {
      this.settings.shortcutKey = e.target.value;
      saveSettings();
    });

    inputWrap.appendChild(inputEl);
    rowKey.appendChild(labelKey);
    rowKey.appendChild(inputWrap);
    container.appendChild(rowKey);

    const noteKey = document.createElement("div");
    noteKey.className = "dq-note";
    noteKey.textContent = "Key for shortcut (in: q, x, F1).";
    container.appendChild(noteKey);

    const divider1 = document.createElement("div");
    divider1.className = "dq-divider";
    container.appendChild(divider1);

    const rowMod = document.createElement("div");
    rowMod.className = "dq-row";
    const labelMod = document.createElement("div");
    labelMod.className = "dq-label";
    labelMod.textContent = "Modifier Keys";
    const selectWrap = document.createElement("div");
    selectWrap.className = "dq-select";

    const selectEl = document.createElement("select");
    const options = [
      { label: "Ctrl/Cmd", value: "ctrl" },
      { label: "Shift", value: "shift" },
      { label: "Alt", value: "alt" },
      { label: "Ctrl+Shift", value: "ctrl+shift" },
      { label: "Ctrl+Alt", value: "ctrl+alt" },
      { label: "Shift+Alt", value: "shift+alt" },
      { label: "Ctrl+Shift+Alt", value: "ctrl+shift+alt" }
    ];

    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      if (this.settings.modifier === opt.value) o.selected = true;
      selectEl.appendChild(o);
    });

    selectEl.addEventListener("change", (e) => {
      this.settings.modifier = e.target.value;
      saveSettings();
      try { inputEl.focus(); } catch (err) {}
    });

    selectWrap.appendChild(selectEl);
    rowMod.appendChild(labelMod);
    rowMod.appendChild(selectWrap);
    container.appendChild(rowMod);

    const noteMod = document.createElement("div");
    noteMod.className = "dq-note";
    noteMod.textContent = "Special key combination.";
    container.appendChild(noteMod);

    const divider2 = document.createElement("div");
    divider2.className = "dq-divider";
    container.appendChild(divider2);

    const actionsRow = document.createElement("div");
    actionsRow.className = "dq-actions";

    const actionsLeft = document.createElement("div");
    actionsLeft.style.flex = "1";
    actionsLeft.style.display = "flex";
    actionsLeft.style.flexDirection = "column";

    const updateTitle = document.createElement("div");
    updateTitle.className = "dq-update-title";
    updateTitle.textContent = "Update Plugin";
    actionsLeft.appendChild(updateTitle);

    const updateNote = document.createElement("div");
    updateNote.className = "dq-note";
    updateNote.textContent = "Find and download the latest available version.";
    actionsLeft.appendChild(updateNote);

    const actionsRight = document.createElement("div");
    actionsRight.style.display = "flex";
    actionsRight.style.alignItems = "center";
    actionsRight.style.justifyContent = "flex-end";
    actionsRight.style.minWidth = "110px";

    const updateBtn = document.createElement("button");
    updateBtn.className = "dq-update-btn";
    updateBtn.textContent = "Check";
    updateBtn.addEventListener("click", () => {
      this.checkForUpdates(true);
    });

    actionsRight.appendChild(updateBtn);

    actionsRow.appendChild(actionsLeft);
    actionsRow.appendChild(actionsRight);
    container.appendChild(actionsRow);

    const divider3 = document.createElement("div");
    divider3.className = "dq-divider";
    container.appendChild(divider3);

    return container;
  }
};



