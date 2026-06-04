(function bootstrap(root) {
  "use strict";

  const TERRAIN = {
    ".": { name: "Deniz", cost: 1, className: "road", label: "" },
    "#": { name: "Kaya", cost: Infinity, className: "wall", label: "" },
    R: { name: "Top Mevzisi", cost: 4, className: "risk", label: "R" },
    E: { name: "Batık Gemi", cost: 6, className: "rubble", label: "E" },
    D: { name: "Düşman Gemisi", cost: 2, className: "enemy", label: "D" },
    P: { name: "Hazine", cost: 1, className: "package", label: "P" },
    S: { name: "Demir Yeri", cost: 1, className: "start", label: "S" },
    H: { name: "Kale", cost: 1, className: "goal", label: "H" }
  };

  const MAP_PRESETS = [
    {
      id: "kafatasi-adasi",
      title: "Kafatası Adası",
      subtitle: "Korsan hazine sandıklarını toplar ve kaleye en düşük maliyetle ulaşır.",
      rows: [
        "S..R..#...P.",
        ".##R..#.#...",
        "...R..D.#..#",
        ".####.###..#",
        "...P..R....#",
        ".#.#.###.R..",
        ".#.#.D.#....",
        ".#..R..#.##.",
        "...###...P..",
        "##...#..###.",
        "..DR....#...",
        ".P..###....H"
      ]
    },
    {
      id: "kayalik-gecit",
      title: "Kayalık Geçit",
      subtitle: "Kapalı yollar korsanı daha uzun ama ucuz geçitlere zorlar.",
      rows: [
        "S...#...P...",
        ".##.#.##....",
        "...#...#..#.",
        ".#.#.#.#..#.",
        ".#...P.#..D.",
        ".###.#.####.",
        "..D..#....R.",
        ".###.###.#..",
        ".P..#.D.#...",
        ".##.#.#.##..",
        "...R#.......",
        "...###.....H"
      ]
    },
    {
      id: "batik-gemi-koyu",
      title: "Batık Gemi Koyu",
      subtitle: "Top mevzileri ve batık gemi enkazları rota maliyetini belirgin biçimde değiştirir.",
      rows: [
        "S.R..#..P...",
        ".#R..#..#...",
        ".#...#...R..",
        ".#.#.D.#....",
        "...P.#.#....",
        "##.#...#.#..",
        "..D#...#....",
        ".#.#.###.##.",
        ".#...R...P..",
        ".##..#..#.#.",
        "...R..D..#..",
        "P....##....H"
      ]
    }
  ];

  const DIRECTIONS = [
    { dr: -1, dc: 0, name: "yukarı" },
    { dr: 1, dc: 0, name: "aşağı" },
    { dr: 0, dc: -1, name: "sol" },
    { dr: 0, dc: 1, name: "sağ" }
  ];

  const MAX_PACKAGES = 8;
  const VIEW_STORAGE_KEY = "korsanHazineActiveView";

  function cloneRows(rows) {
    return rows.map((row) => row.split(""));
  }

  function serializeGrid(grid) {
    return grid.map((row) => row.join(""));
  }

  function parseGrid(rows) {
    const grid = Array.isArray(rows[0]) ? rows.map((row) => row.slice()) : cloneRows(rows);
    const packages = [];
    let start = null;
    let goal = null;

    for (let r = 0; r < grid.length; r += 1) {
      for (let c = 0; c < grid[r].length; c += 1) {
        const value = grid[r][c];
        if (value === "S") start = { r, c };
        if (value === "H") goal = { r, c };
        if (value === "P") packages.push({ r, c, index: packages.length });
      }
    }

    if (!start) throw new Error("Demir yeri bulunamadı.");
    if (!goal) throw new Error("Kale bulunamadı.");
    if (packages.length > MAX_PACKAGES) throw new Error("En fazla 8 hazine desteklenir.");

    const packageByCell = new Map(packages.map((pkg) => [`${pkg.r},${pkg.c}`, pkg.index]));
    return { grid, start, goal, packages, packageByCell };
  }

  function terrainAt(grid, r, c) {
    return TERRAIN[grid[r][c]] || TERRAIN["."];
  }

  function manhattan(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  function heuristic(position, mask, packages, goal) {
    const remaining = packages.filter((pkg) => (mask & (1 << pkg.index)) === 0);
    if (remaining.length === 0) {
      return manhattan(position, goal);
    }

    let nearestPackage = Infinity;
    let nearestPackageToGoal = Infinity;
    for (const pkg of remaining) {
      nearestPackage = Math.min(nearestPackage, manhattan(position, pkg));
      nearestPackageToGoal = Math.min(nearestPackageToGoal, manhattan(pkg, goal));
    }

    return nearestPackage + nearestPackageToGoal;
  }

  function nodeKey(r, c, mask) {
    return `${r},${c},${mask}`;
  }

  function reconstructPath(cameFrom, endNode) {
    const path = [];
    let cursor = endNode;
    while (cursor) {
      path.push({
        r: cursor.r,
        c: cursor.c,
        mask: cursor.mask,
        g: cursor.g,
        h: cursor.h,
        f: cursor.f,
        tile: cursor.tile,
        collectedPackage: cursor.collectedPackage
      });
      cursor = cameFrom.get(cursor.key) || null;
    }
    return path.reverse();
  }

  function findRescuePath(rows) {
    const parsed = parseGrid(rows);
    const { grid, start, goal, packages, packageByCell } = parsed;
    const rowsCount = grid.length;
    const colsCount = grid[0].length;
    const goalMask = (1 << packages.length) - 1;
    const startMask = packageByCell.has(`${start.r},${start.c}`) ? 1 << packageByCell.get(`${start.r},${start.c}`) : 0;
    const startNode = {
      r: start.r,
      c: start.c,
      mask: startMask,
      g: 0,
      h: heuristic(start, startMask, packages, goal)
    };
    startNode.f = startNode.g + startNode.h;
    startNode.key = nodeKey(startNode.r, startNode.c, startNode.mask);
    startNode.tile = "S";

    const open = [startNode];
    const cameFrom = new Map();
    const bestCost = new Map([[startNode.key, 0]]);
    const closed = new Set();
    const decisionLog = [];
    let iterations = 0;

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f || a.h - b.h || a.g - b.g);
      const current = open.shift();
      if (closed.has(current.key)) continue;
      closed.add(current.key);
      iterations += 1;

      if (decisionLog.length < 10) {
        decisionLog.push({
          r: current.r,
          c: current.c,
          g: current.g,
          h: current.h,
          f: current.f,
          mask: current.mask
        });
      }

      if (current.r === goal.r && current.c === goal.c && current.mask === goalMask) {
        const path = reconstructPath(cameFrom, current);
        return {
          success: true,
          path,
          cost: current.g,
          steps: Math.max(0, path.length - 1),
          visited: closed.size,
          iterations,
          packages: packages.length,
          collected: packages.length,
          decisionLog,
          grid: serializeGrid(grid)
        };
      }

      for (const direction of DIRECTIONS) {
        const nr = current.r + direction.dr;
        const nc = current.c + direction.dc;

        if (nr < 0 || nc < 0 || nr >= rowsCount || nc >= colsCount) continue;
        const tile = grid[nr][nc];
        if (tile === "#") continue;

        const pkgIndex = packageByCell.get(`${nr},${nc}`);
        const nextMask = pkgIndex === undefined ? current.mask : current.mask | (1 << pkgIndex);
        const moveCost = terrainAt(grid, nr, nc).cost;
        const nextCost = current.g + moveCost;
        const key = nodeKey(nr, nc, nextMask);

        if (nextCost >= (bestCost.get(key) ?? Infinity)) continue;

        const position = { r: nr, c: nc };
        const nextNode = {
          r: nr,
          c: nc,
          mask: nextMask,
          g: nextCost,
          h: heuristic(position, nextMask, packages, goal),
          tile,
          direction: direction.name,
          collectedPackage: pkgIndex !== undefined && (current.mask & (1 << pkgIndex)) === 0
        };
        nextNode.f = nextNode.g + nextNode.h;
        nextNode.key = key;
        bestCost.set(key, nextCost);
        cameFrom.set(key, current);
        open.push(nextNode);
      }
    }

    return {
      success: false,
      path: [],
      cost: Infinity,
      steps: 0,
      visited: closed.size,
      iterations,
      packages: packages.length,
      collected: 0,
      decisionLog,
      grid: serializeGrid(grid)
    };
  }

  function initApp(documentRef) {
    const elements = {
      introScreen: documentRef.getElementById("introScreen"),
      gameView: documentRef.getElementById("gameView"),
      startMissionBtn: documentRef.getElementById("startMissionBtn"),
      quickPlanBtn: documentRef.getElementById("quickPlanBtn"),
      storyBtn: documentRef.getElementById("storyBtn"),
      grid: documentRef.getElementById("grid"),
      mapTitle: documentRef.getElementById("mapTitle"),
      mapSubtitle: documentRef.getElementById("mapSubtitle"),
      missionBadge: documentRef.getElementById("missionBadge"),
      statusLine: documentRef.getElementById("statusLine"),
      costValue: documentRef.getElementById("costValue"),
      stepValue: documentRef.getElementById("stepValue"),
      packageValue: documentRef.getElementById("packageValue"),
      visitedValue: documentRef.getElementById("visitedValue"),
      decisionLog: documentRef.getElementById("decisionLog"),
      solveBtn: documentRef.getElementById("solveBtn"),
      runBtn: documentRef.getElementById("runBtn"),
      stepBtn: documentRef.getElementById("stepBtn"),
      resetBtn: documentRef.getElementById("resetBtn"),
      mapButtons: Array.from(documentRef.querySelectorAll("[data-map]")),
      brushInputs: Array.from(documentRef.querySelectorAll("input[name='brush']")),
      gameOverOverlay: documentRef.getElementById("gameOverOverlay"),
      gameOverResetBtn: documentRef.getElementById("gameOverResetBtn")
    };

    const state = {
      preset: MAP_PRESETS[0],
      grid: cloneRows(MAP_PRESETS[0].rows),
      result: null,
      pathIndex: 0,
      timer: null,
      activeView: "intro"
    };

    function rememberView(view) {
      try {
        if (root.sessionStorage) {
          root.sessionStorage.setItem(VIEW_STORAGE_KEY, view);
        }
      } catch (error) {
        // Storage can be blocked in some browser modes; the UI still works without it.
      }
    }

    function rememberedView() {
      try {
        return root.sessionStorage ? root.sessionStorage.getItem(VIEW_STORAGE_KEY) : null;
      } catch (error) {
        return null;
      }
    }

    function showGameView() {
      if (elements.introScreen) elements.introScreen.hidden = true;
      if (elements.gameView) elements.gameView.hidden = false;
      state.activeView = "game";
      rememberView("game");
    }

    function keepGameViewVisible() {
      if (elements.introScreen) elements.introScreen.hidden = true;
      if (elements.gameView) elements.gameView.hidden = false;
    }

    function showIntroView() {
      if (elements.gameView) elements.gameView.hidden = true;
      if (elements.introScreen) elements.introScreen.hidden = false;
      state.activeView = "intro";
      rememberView("intro");
    }

    function scrollToElement(element) {
      if (!element || !element.scrollIntoView) return;
      root.requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function openGame(options = {}) {
      showGameView();
      if (options.scroll !== false) {
        scrollToElement(elements.gameView);
      }
      if (options.solveImmediately) {
        root.setTimeout(solve, 120);
      }
    }

    function isMissionInProgress() {
      return Boolean(
        state.timer ||
        (
          state.result &&
          state.result.success &&
          state.pathIndex > 0 &&
          state.pathIndex < state.result.path.length - 1
        )
      );
    }

    function openStory(event) {
      if (event) event.preventDefault();
      if (isMissionInProgress()) return;
      stopTimer();
      showIntroView();
      scrollToElement(elements.introScreen);
    }

    function selectedBrush() {
      const selected = elements.brushInputs.find((input) => input.checked);
      if (!selected) return ".";
      return selected.value;
    }

    function stopTimer() {
      if (state.timer) {
        root.clearInterval(state.timer);
        state.timer = null;
      }
    }

    function setBadge(text, mode) {
      elements.missionBadge.textContent = text;
      elements.missionBadge.className = "mission-badge";
      if (mode) elements.missionBadge.classList.add(mode);
    }

    function currentPosition() {
      if (state.result && state.result.path.length > 0) {
        return state.result.path[Math.min(state.pathIndex, state.result.path.length - 1)];
      }
      const parsed = parseGrid(state.grid);
      return parsed.start;
    }

    function packageCountAtIndex(index) {
      if (!state.result || state.result.path.length === 0) return 0;
      const node = state.result.path[Math.min(index, state.result.path.length - 1)];
      let count = 0;
      for (let bit = 0; bit < MAX_PACKAGES; bit += 1) {
        if ((node.mask & (1 << bit)) !== 0) count += 1;
      }
      return count;
    }

    function emitRenderEvent() {
      const detail = {
        grid: serializeGrid(state.grid),
        result: state.result,
        pathIndex: state.pathIndex,
        presetId: state.preset.id,
        presetTitle: state.preset.title
      };
      const stateNode = documentRef.getElementById("gameStateData");
      if (stateNode) {
        stateNode.textContent = JSON.stringify(detail);
      }
      if (!root.CustomEvent || !root.dispatchEvent) return;
      root.dispatchEvent(new root.CustomEvent("rescue:render", { detail }));
    }

    function updateEditableCell(r, c, brush = selectedBrush()) {
      if (!state.grid[r] || state.grid[r][c] === undefined) return false;
      if (state.grid[r][c] === "S" || state.grid[r][c] === "H") return false;
      if (state.grid[r][c] === brush) return false;
      if (brush === "P") {
        const packageCount = state.grid.flat().filter((cell) => cell === "P").length;
        if (state.grid[r][c] !== "P" && packageCount >= MAX_PACKAGES) {
          elements.statusLine.textContent = "En fazla 8 hazine desteklenir.";
          setBadge("Sınır", "alert");
          return false;
        }
      }
      stopTimer();
      state.grid[r][c] = brush;
      state.result = null;
      state.pathIndex = 0;
      if (elements.gameOverOverlay) elements.gameOverOverlay.hidden = true;
      setBadge("Düzenlendi");
      elements.statusLine.textContent = "Ada haritası değişti. Rota yeniden hesaplanmalı.";
      render();
      return true;
    }

    function paintGrid() {
      const parsed = parseGrid(state.grid);
      const position = currentPosition();
      const routeCells = new Set();
      if (state.result && state.result.success) {
        for (const node of state.result.path) {
          routeCells.add(`${node.r},${node.c}`);
        }
      }

      elements.grid.innerHTML = "";
      state.grid.forEach((row, r) => {
        row.forEach((tile, c) => {
          const button = documentRef.createElement("button");
          const terrain = TERRAIN[tile] || TERRAIN["."];
          button.type = "button";
          button.className = `cell ${terrain.className}`;
          button.dataset.row = String(r);
          button.dataset.col = String(c);
          button.setAttribute("aria-label", `${r + 1}. satir ${c + 1}. sutun ${terrain.name}`);

          if (routeCells.has(`${r},${c}`) && tile !== "S" && tile !== "H") {
            button.classList.add("route");
          }
          if (position.r === r && position.c === c) {
            button.classList.add("current");
          }

          button.textContent = terrain.label;
          if (tile === "." && routeCells.has(`${r},${c}`)) button.textContent = "";

          button.addEventListener("click", () => {
            updateEditableCell(r, c);
          });

          elements.grid.appendChild(button);
        });
      });

      elements.packageValue.textContent = `${packageCountAtIndex(state.pathIndex)}/${parsed.packages.length}`;
    }

    function paintDecisionLog(result) {
      elements.decisionLog.innerHTML = "";
      if (!result || result.decisionLog.length === 0) {
        const li = documentRef.createElement("li");
        li.textContent = "Rota hesaplanınca ilk kararlar burada görünür.";
        elements.decisionLog.appendChild(li);
        return;
      }

      result.decisionLog.forEach((entry, index) => {
        const li = documentRef.createElement("li");
        li.textContent = `${index + 1}. (${entry.r}, ${entry.c}) g=${entry.g}, h=${entry.h}, f=${entry.f}`;
        elements.decisionLog.appendChild(li);
      });
    }

    function updateStats() {
      if (!state.result || !state.result.success) {
        elements.costValue.textContent = "0";
        elements.stepValue.textContent = "0";
        elements.visitedValue.textContent = state.result ? String(state.result.visited) : "0";
        elements.runBtn.disabled = true;
        elements.stepBtn.disabled = true;
        return;
      }

      const node = state.result.path[Math.min(state.pathIndex, state.result.path.length - 1)];
      elements.costValue.textContent = String(node.g);
      elements.stepValue.textContent = String(state.pathIndex);
      elements.visitedValue.textContent = String(state.result.visited);
      elements.runBtn.disabled = state.pathIndex >= state.result.path.length - 1;
      elements.stepBtn.disabled = state.pathIndex >= state.result.path.length - 1;
    }

    function render() {
      if (state.activeView === "game") {
        keepGameViewVisible();
      }
      elements.mapTitle.textContent = state.preset.title;
      elements.mapSubtitle.textContent = state.preset.subtitle;
      paintGrid();
      updateStats();
      paintDecisionLog(state.result);
      emitRenderEvent();
    }

    function solve() {
      stopTimer();
      state.pathIndex = 0;
      try {
        state.result = findRescuePath(state.grid);
        if (state.result.success) {
          if (elements.gameOverOverlay) elements.gameOverOverlay.hidden = true;
          setBadge("Rota bulundu", "done");
          elements.statusLine.textContent = `A* ${state.result.steps} adımlık rotayı ${state.result.cost} maliyetle buldu.`;
        } else {
          setBadge("Rota yok", "alert");
          elements.statusLine.textContent = "Bu adada tüm hazineleri toplayıp kaleye ulaşan rota bulunamadı.";
          if (elements.gameOverOverlay) {
            elements.gameOverOverlay.hidden = false;
          }
        }
      } catch (error) {
        state.result = null;
        setBadge("Hata", "alert");
        elements.statusLine.textContent = error.message;
      }
      render();
    }

    function step() {
      if (!state.result || !state.result.success) return;
      if (state.pathIndex < state.result.path.length - 1) {
        state.pathIndex += 1;
      }
      if (state.pathIndex >= state.result.path.length - 1) {
        stopTimer();
        setBadge("Tamamlandı", "done");
        elements.statusLine.textContent = "Korsan tüm hazineleri toplayıp kaleye ulaştı!";
      }
      render();
    }

    function run() {
      if (!state.result || !state.result.success) solve();
      if (!state.result || !state.result.success) return;
      stopTimer();
      state.timer = root.setInterval(step, 230);
    }

    function resetMap(presetId) {
      stopTimer();
      const selected = MAP_PRESETS.find((preset) => preset.id === presetId) || state.preset;
      state.preset = selected;
      state.grid = cloneRows(selected.rows);
      state.result = null;
      state.pathIndex = 0;
      if (elements.gameOverOverlay) elements.gameOverOverlay.hidden = true;
      setBadge("Hazır");
      elements.statusLine.textContent = "Ada haritası hazır. A* rotası hesaplanabilir.";
      elements.mapButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.map === selected.id);
      });
      render();
    }

    elements.solveBtn.addEventListener("click", solve);
    elements.runBtn.addEventListener("click", run);
    elements.stepBtn.addEventListener("click", () => {
      if (!state.result) solve();
      step();
    });
    elements.resetBtn.addEventListener("click", () => resetMap(state.preset.id));
    elements.mapButtons.forEach((button) => {
      button.addEventListener("click", () => resetMap(button.dataset.map));
    });
    if (elements.startMissionBtn) {
      elements.startMissionBtn.addEventListener("click", () => openGame());
    }
    if (elements.quickPlanBtn) {
      elements.quickPlanBtn.addEventListener("click", () => openGame({ solveImmediately: true }));
    }
    if (elements.storyBtn) {
      elements.storyBtn.addEventListener("click", openStory);
    }
    if (elements.gameOverResetBtn) {
      elements.gameOverResetBtn.addEventListener("click", () => resetMap(state.preset.id));
    }

    root.AkilliKurtarmaApp = {
      setCell: updateEditableCell,
      solve,
      run,
      step,
      resetMap,
      getState() {
        return {
          grid: serializeGrid(state.grid),
          result: state.result,
          pathIndex: state.pathIndex,
          presetId: state.preset.id,
          presetTitle: state.preset.title
        };
      }
    };

    const searchParams = root.location ? new root.URLSearchParams(root.location.search) : null;
    const requestedMap = searchParams ? searchParams.get("map") : null;
    if (requestedMap && MAP_PRESETS.some((preset) => preset.id === requestedMap)) {
      resetMap(requestedMap);
    } else {
      render();
    }

    if (searchParams && searchParams.get("quick") === "1") {
      openGame({ solveImmediately: true });
    } else if (rememberedView() === "game") {
      openGame({ scroll: false });
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      TERRAIN,
      MAP_PRESETS,
      cloneRows,
      parseGrid,
      heuristic,
      findRescuePath
    };
  } else {
    root.AkilliKurtarma = {
      TERRAIN,
      MAP_PRESETS,
      findRescuePath
    };
    root.addEventListener("DOMContentLoaded", () => initApp(root.document));
  }
})(typeof window !== "undefined" ? window : globalThis);
