import React, { useEffect, useRef, useState } from 'react';

const arOfFunctions = ["def dextra(graph, start):", "shortest_paths = {start: (None, 0)}", "current_node = start", "visited = set()", "while current_node is not None:", "visited.add(current_node)", "destinations = graph[current_node]", "weight_to_current_node = shortest_paths[current_node][1]", "for next_node, weight in destinations.items():", "weight = weight_to_current_node + weight", "if next_node not in shortest_paths: shortest_paths[next_node] = (current_node, weight)", "else: current_shortest_weight = shortest_paths[next_node][1]", "if current_shortest_weight > weight:", "shortest_paths[next_node] = (current_node, weight)", "next_destinations = {node: shortest_paths[node] for node in shortest_paths if node not in visited}", "if not next_destinations:", "return shortest_paths", "current_node = min(next_destinations, key=lambda k: next_destinations[k][1])", "return shortest_paths",
    "func dextra(graph map[string]map[string]int, start string) map[string][2]interface{} {", "shortestPaths := map[string][2]interface{}{start: {nil, 0}}", "currentNode := start", "visited := map[string]bool{}", "for currentNode != \"\" {", "visited[currentNode] = true", "destinations := graph[currentNode]", "weightToCurrentNode := shortestPaths[currentNode][1].(int)", "for nextNode, weight := range destinations {", "weight += weightToCurrentNode", "if _, ok := shortestPaths[nextNode]; !ok {", "shortestPaths[nextNode] = [2]interface{}{currentNode, weight}", "} else {", "currentShortestWeight := shortestPaths[nextNode][1].(int)", "if currentShortestWeight > weight {", "shortestPaths[nextNode] = [2]interface{}{currentNode, weight}", "}", "}", "}", "nextDestinations := map[string][2]interface{}{}", "for node, path := range shortestPaths {", "if !visited[node] {", "nextDestinations[node] = path", "}", "}", "if len(nextDestinations) == 0 {", "return shortestPaths", "}", "minNode := \"\"", "minWeight := int(^uint(0) >> 1)", "for node, path := range nextDestinations {", "if path[1].(int) < minWeight {", "minNode = node", "minWeight = path[1].(int)", "}", "}", "currentNode = minNode", "}", "return shortestPaths", "}",
     "shortestPaths.put(start, new Object[]{null, 0});", "String currentNode = start;", "Set<String> visited = new HashSet<>();", "while (currentNode != null) {", "visited.add(currentNode);", "Map<String, Integer> destinations = graph.get(currentNode);", "int weightToCurrentNode = (int) shortestPaths.get(currentNode)[1];", "for (Map.Entry<String, Integer> nextNode : destinations.entrySet()) {", "int weight = weightToCurrentNode + nextNode.getValue();", "if (!shortestPaths.containsKey(nextNode.getKey())) {", "shortestPaths.put(nextNode.getKey(), new Object[]{currentNode, weight});", "} else {", "int currentShortestWeight = (int) shortestPaths.get(nextNode.getKey())[1];", "if (currentShortestWeight > weight) {", "shortestPaths.put(nextNode.getKey(), new Object[]{currentNode, weight});", "}", "}", "}", "String nextNode = null;", "int minWeight = Integer.MAX_VALUE;", "for (Map.Entry<String, Object[]> path : shortestPaths.entrySet()) {", "if (!visited.contains(path.getKey()) && (int) path.getValue()[1] < minWeight) {", "nextNode = path.getKey();", "minWeight = (int) path.getValue()[1];", "}", "}", "currentNode = nextNode;", "}", "return shortestPaths;", "}",
    "shortestPaths[start] = {\"\", 0};", "std::string currentNode = start;", "std::set<std::string> visited;", "while (!currentNode.empty()) {", "visited.insert(currentNode);", "const auto& destinations = graph.at(currentNode);", "int weightToCurrentNode = shortestPaths[currentNode].second;", "for (const auto& nextNode : destinations) {", "int weight = weightToCurrentNode + nextNode.second;", "if (shortestPaths.find(nextNode.first) == shortestPaths.end()) {", "shortestPaths[nextNode.first] = {currentNode, weight};", "} else if (shortestPaths[nextNode.first].second > weight) {", "shortestPaths[nextNode.first] = {currentNode, weight};", "}", "}", "std::string nextNode;", "int minWeight = std::numeric_limits<int>::max();", "for (const auto& path : shortestPaths) {", "if (visited.find(path.first) == shortestPaths.end() && path.second.second < minWeight) {", "nextNode = path.first;", "minWeight = path.second.second;", "}", "}", "currentNode = nextNode;", "}", "return shortestPaths;", "}",
    "print('Hello world')", "fmt.Println('Hello world')", "System.out.println('Hello world')", "Console.WriteLine('Hello world')", "echo 'Hello world'"];
const arrOfColors = ['#7d7d7d', 'rgba(174, 128, 82, 0.87)'];


const generateRandomCodeLine = (context, widthLimit) => {
  let st = '';

  while (true) {
    const snippet = arOfFunctions[Math.floor(Math.random() * arOfFunctions.length)];

    // Check if adding the whole snippet would overflow
    const testLine = st + snippet;
    if (context.measureText(testLine).width > widthLimit) {
      // Try to add as much of the snippet as possible, character by character
      for (let i = 0; i < snippet.length; i++) {
        const nextTest = st + snippet[i];
        if (context.measureText(nextTest).width > widthLimit) {
          return st;
        }
        st = nextTest;
      }
      return st;
    }

    st = testLine;
  }
};


const AnimatedCodeBackground = () => {
  const [codeLines, setCodeLines] = useState([]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const context = canvas.getContext('2d');
    context.font = '5vh JetBrains Mono';  // set font once here
    contextRef.current = context;

    const generateLines = () => {
      const context = contextRef.current;
      if (!context) return;

      const newLines = [];
      for (let i = 1; i < 20; i++) {
        const forward = generateRandomCodeLine(context, window.innerWidth * 3);
        const delay = generateRandomCodeLine(context, window.innerWidth * 3);
        newLines.push({
          id: i,
          direction: i % 2 === 1 ? 'forward' : 'backwards',
          delayDirection: i % 2 === 1 ? 'forward-delay' : 'backwards-delay',
          forward,
          delay,
        });
      }
      setCodeLines(newLines);
    };

    generateLines();

    const handleResize = () => {
      generateLines();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="background">
      {codeLines.map(({ id, direction, delayDirection, forward, delay }) => (
        <div key={id} className="listingsOfCode">
          <span className={direction}>
            {forward.split(/(?<=;|\)|{|})/g).map((chunk, i) => (
              <span key={i} style={{ color: arrOfColors[Math.floor(Math.random() * arrOfColors.length)] }}>
                {chunk}
              </span>
            ))}
          </span>
          <span className={delayDirection}>
            {delay.split(/(?<=;|\)|{|})/g).map((chunk, i) => (
              <span key={i} style={{ color: arrOfColors[Math.floor(Math.random() * arrOfColors.length)] }}>
                {chunk}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AnimatedCodeBackground;
// const AnimatedCodeBackground = () => {
//   const [codeLines, setCodeLines] = useState([]);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     context.font = '5vh JetBrains Mono';

//     const newLines = [];
//     for (let i = 1; i < 20; i++) {
//       const forward = generateRandomCodeLine(context, window.innerWidth * 3);
//       const delay = generateRandomCodeLine(context, window.innerWidth * 3);
//       newLines.push({
//         id: i,
//         direction: i % 2 === 1 ? 'forward' : 'backwards',
//         delayDirection: i % 2 === 1 ? 'forward-delay' : 'backwards-delay',
//         forward,
//         delay,
//       });
//     }
//     setCodeLines(newLines);
//   }, []);

//   return (
//     <div id="background">
//       {codeLines.map(({ id, direction, delayDirection, forward, delay }) => (
//         <div key={id} className="listingsOfCode">
//           <span className={direction}>
//             {forward.split(/(?<=;|\)|{|})/g).map((chunk, i) => (
//               <span key={i} style={{ color: arrOfColors[Math.floor(Math.random() * arrOfColors.length)] }}>
//                 {chunk}
//               </span>
//             ))}
//           </span>
//           <span className={delayDirection}>
//             {delay.split(/(?<=;|\)|{|})/g).map((chunk, i) => (
//               <span key={i} style={{ color: arrOfColors[Math.floor(Math.random() * arrOfColors.length)] }}>
//                 {chunk}
//               </span>
//             ))}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AnimatedCodeBackground;
