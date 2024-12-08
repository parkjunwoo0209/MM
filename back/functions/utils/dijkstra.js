class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = new Map();
  }

  // 노드를 그래프에 추가
  addNode(node) {
    if (!this.nodes.has(node)) {
      this.nodes.add(node);
      this.edges.set(node, []);
    }
  }

  // 두 노드 간의 엣지를 추가 (양방향)
  addEdge(start, end, time, distance, cost, startLine, endLine) {
    if (!this.edges.has(start)) {
      this.addNode(start);
    }
    if (!this.edges.has(end)) {
      this.addNode(end);
    }
    this.edges.get(start).push({ node: end, time, distance, cost, startLine, endLine });
    this.edges.get(end).push({ node: start, time, distance, cost, startLine: endLine, endLine: startLine });
  }

  // 다익스트라 알고리즘으로 최적 경로를 찾음
  findShortestPath(start, end, criteria) {
    const distances = new Map();
    const previous = new Map();
    const queue = new Set(this.nodes);
    const lines = new Map(); // 각 역의 노선 정보 저장

    this.nodes.forEach(node => distances.set(node, Infinity));
    distances.set(start, 0);

    while (queue.size > 0) {
      const current = [...queue].reduce((minNode, node) =>
        distances.get(node) < distances.get(minNode) ? node : minNode
      );

      if (current === end) {
        const path = [];
        let temp = end;
        while (temp) {
          path.unshift(temp);
          temp = previous.get(temp);
        }
        return { path, distance: distances.get(end) };
      }

      queue.delete(current);

      this.edges.get(current).forEach(neighbor => {
        const weight = neighbor[criteria];
        const alt = distances.get(current) + weight;
        if (alt < distances.get(neighbor.node)) {
          distances.set(neighbor.node, alt);
          previous.set(neighbor.node, current);
          lines.set(neighbor.node, neighbor.endLine);
        }
      });
    }

    return null;
  }
}

module.exports = Graph;
