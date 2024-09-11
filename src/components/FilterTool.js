import React, { useState, useEffect } from "react";
import { AutoComplete } from "primereact/autocomplete";
import "./FilterTool.css";

const FilterTool = ({ graph, setGraph, originalGraph }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);

  useEffect(() => {
    // Populate suggestions based on the current graph nodes
    const allNodeLabels = originalGraph.nodes.map(
      (node) => node.data.fullName || node.label
    );
    setSuggestions(allNodeLabels);
  }, [originalGraph]);

  const searchSuggestions = (event) => {
    const query = event.query.toLowerCase();

    // Filter suggestions based on the query, but exclude selected terms
    const filtered = suggestions.filter(
      (item) =>
        item.toLowerCase().includes(query) && !selectedTerms.includes(item)
    );
    setFilteredSuggestions(filtered);
  };

  const filterGraph = (selectedNodes) => {
    if (selectedNodes.length === 0) {
      // If no chips selected, reset the graph to the original state
      setGraph(originalGraph);
      return;
    }

    // Filter nodes that match selected terms
    const filteredNodes = originalGraph.nodes.filter((node) =>
      selectedNodes.includes(node.data.fullName || node.label)
    );

    // Find all nodes directly connected to the filtered nodes
    const connectedNodeIds = new Set(filteredNodes.map((node) => node.id));
    const immediateConnections = new Set();

    originalGraph.edges.forEach((edge) => {
      if (connectedNodeIds.has(edge.source)) {
        immediateConnections.add(edge.target);
      }
      if (connectedNodeIds.has(edge.target)) {
        immediateConnections.add(edge.source);
      }
    });

    // Include only the selected nodes and their direct connections
    const allFilteredNodes = originalGraph.nodes.filter(
      (node) =>
        connectedNodeIds.has(node.id) || immediateConnections.has(node.id)
    );

    // Filter edges connected to the filtered nodes
    const filteredEdges = originalGraph.edges.filter(
      (edge) =>
        (connectedNodeIds.has(edge.source) &&
          immediateConnections.has(edge.target)) ||
        (connectedNodeIds.has(edge.target) &&
          immediateConnections.has(edge.source))
    );

    setGraph({ nodes: allFilteredNodes, edges: filteredEdges });
  };

  const handleChange = (e) => {
    const terms = e.value;
    setSelectedTerms(terms);

    // Filter graph based on selected terms (chips)
    filterGraph(terms);
  };

  return (
    <div className="container">
      <AutoComplete
        value={selectedTerms} // Bind to selectedTerms so chips remain visible
        suggestions={filteredSuggestions}
        completeMethod={searchSuggestions}
        multiple
        onChange={handleChange}
        placeholder="Search..."
      />
    </div>
  );
};

export default FilterTool;
