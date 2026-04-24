export async function POST(req) {
  try {
    const body = await req.json();
    let data = body.data || [];

    let invalid_entries = [];
    let duplicate_edges = [];
    let seen = new Set();
    let validEdges = [];

    // ---------- VALIDATION ----------
    const isValid = (str) => {
      if (!str || typeof str !== "string") return false;

      str = str.trim();

      if (!/^[A-Z]->[A-Z]$/.test(str)) return false;

      const [p, c] = str.split("->");

      if (p === c) return false;

      return true;
    };

    for (let item of data) {
      if (!item || item.trim() === "") {
        invalid_entries.push(item);
        continue;
      }

      let trimmed = item.trim();

      if (!isValid(trimmed)) {
        invalid_entries.push(item);
        continue;
      }

      if (seen.has(trimmed)) {
        if (!duplicate_edges.includes(trimmed)) {
          duplicate_edges.push(trimmed);
        }
        continue;
      }

      seen.add(trimmed);
      validEdges.push(trimmed);
    }

    // ---------- MULTI-PARENT HANDLING ----------
    let childParent = new Map();
    let filteredEdges = [];

    for (let edge of validEdges) {
      let [p, c] = edge.split("->");

      if (!childParent.has(c)) {
        childParent.set(c, p);
        filteredEdges.push(edge);
      }
    }

    // ---------- GRAPH BUILD ----------
    let graph = {};
    let parentSet = new Set();
    let childSet = new Set();

    for (let edge of filteredEdges) {
      let [p, c] = edge.split("->");

      parentSet.add(p);
      childSet.add(c);

      if (!graph[p]) graph[p] = [];
      graph[p].push(c);
    }

    let allNodes = new Set([...parentSet, ...childSet]);

    // ---------- FIND ROOTS ----------
    let roots = [];

    for (let node of allNodes) {
      if (!childSet.has(node)) {
        roots.push(node);
      }
    }

    // ---------- COMPONENTS ----------
    let visited = new Set();
    let components = [];

    const dfsCollect = (node, comp) => {
      if (visited.has(node)) return;
      visited.add(node);
      comp.add(node);

      if (graph[node]) {
        for (let child of graph[node]) {
          dfsCollect(child, comp);
        }
      }
    };

    for (let node of allNodes) {
      if (!visited.has(node)) {
        let comp = new Set();
        dfsCollect(node, comp);
        components.push(comp);
      }
    }

    // ---------- TREE + CYCLE ----------
    const buildTree = (node, recStack) => {
      if (recStack.has(node)) return { cycle: true };

      recStack.add(node);

      let subtree = {};
      let maxDepth = 0;

      if (!graph[node]) {
        recStack.delete(node);
        return { tree: {}, depth: 1 };
      }

      for (let child of graph[node]) {
        let res = buildTree(child, recStack);

        if (res.cycle) return { cycle: true };

        subtree[child] = res.tree;
        maxDepth = Math.max(maxDepth, res.depth);
      }

      recStack.delete(node);

      return {
        tree: subtree,
        depth: maxDepth + 1
      };
    };

    // ---------- PROCESS ----------
    let hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let maxDepth = 0;
    let largest_tree_root = "";

    for (let comp of components) {
      let compNodes = [...comp];

      let compRoots = compNodes.filter(n => !childSet.has(n));

      let root;

      if (compRoots.length > 0) {
        root = compRoots.sort()[0];
      } else {
        root = compNodes.sort()[0];
      }

      let res = buildTree(root, new Set());

      if (res.cycle) {
        total_cycles++;

        hierarchies.push({
          root,
          tree: {},
          has_cycle: true
        });

      } else {
        total_trees++;

        if (
          res.depth > maxDepth ||
          (res.depth === maxDepth && root < largest_tree_root)
        ) {
          maxDepth = res.depth;
          largest_tree_root = root;
        }

        // ✅ FIXED TREE STRUCTURE HERE
        hierarchies.push({
          root,
          tree: {
            [root]: res.tree
          },
          depth: res.depth
        });
      }
    }

    // 🔍 DEBUG LOG (IMPORTANT)
    console.log("HIERARCHIES OUTPUT:");
    console.log(JSON.stringify(hierarchies, null, 2));

    return Response.json({
      user_id: "raju_singh_03052005",
      email_id: "rr4844@srmist.edu",
      college_roll_number: "RA2311003011434",
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root
      }
    });

  } catch (err) {
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}