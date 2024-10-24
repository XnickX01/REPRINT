
import React, { useState, useEffect } from 'react';
import 'primeicons/primeicons.css'; // Ensure PrimeIcons are imported
import { TabView, TabPanel } from 'primereact/tabview';
import './NodeDetails.module.css';
import LetterTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';
import Letter from './SidecarContent/Letter'; // Adjust the import path as necessary
import Mentions from './SidecarContent/Mentions';

const NodeDetails = ({ nodeData, handleNodeClick, activeTabIndex, setActiveTabIndex}) => {

const handleRowClick = (rowData) => {
  const newTabKey = `Letter-${rowData.document.documentID}`;
  setTabs((prevTabs) => {
    const existingTab = prevTabs.find(tab => tab.key === newTabKey);

    if (!existingTab) {
      const newTab = {
        key: newTabKey,
        header: `Letter ${rowData.document.documentID}`,
        content: <Letter name={rowData.document.internalPDFname} id={rowData.document.documentID} className="tab-content-container" />
      };
      const newTabs = [...prevTabs, newTab];
      setActiveIndex(newTabs.length - 1); // Set the new tab as active
      return newTabs;
    } else {
      setActiveIndex(prevTabs.indexOf(existingTab)); // Focus on the existing tab
      return prevTabs;
    }
  });
};
  const [firstRender, setFirstRender] = useState(true);
  const [tabClosed, setTabClosed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabs, setTabs] = useState([
    { key: "Biography", header: "Biography", content: <Biography nodeData={nodeData} className="tab-content-container"/> },
    { key: "Letters", header: "Letters", content: <LetterTable nodeData={nodeData} onRowClick={handleRowClick}  className="tab-content-container"/> },
    { key: "Mentions", header: "Mentions", content: <Mentions nodeData={nodeData} onRowClick={handleRowClick}  className="tab-content-container"/> },
    { key: "Relationships", header: "Relationships", content: <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick}  className="tab-content-container" /> },
    { key: "Open Data", header: "Open Data", content: <OpenData nodeData={nodeData} className="tab-content-container" /> }
  ]);
  const handleTabChange = (e) => {
    setActiveIndex(e.index);
    if (setActiveTabIndex) setActiveTabIndex(e.index); // Update parent component's activeTabIndex
  };

  useEffect(() => {
    if (activeTabIndex) setActiveIndex(activeTabIndex);
  }, [activeIndex]);

  const handleTabClose = (key) => {
    setTabs((prevTabs) => {
        const newTabs = prevTabs.filter(tab => tab.key !== key);
        
        // Only update the active index if the closed tab was the active one
        // if (tabs[activeIndex].key === key) {
        //     // Adjust the activeIndex if the active tab was the one closed
        //     if (activeIndex >= newTabs.length) {
        //     }
        // }
            console.log(activeIndex);
            setTabClosed(true);
            return newTabs;
    });
};

useEffect(() => {
  if (firstRender){
    setFirstRender(false);
    return;
  }
  if(tabs.length === 5)
  setActiveIndex(4);
else
setActiveIndex(tabs.length - 1);
  setTabClosed(false);
}
, [tabClosed]);

  console.log(nodeData);

  return (
    <div className="sidecar">
    {nodeData?.data?.person?.fullName ? (
      <TabView activeIndex={activeIndex ? activeIndex : 0} onTabChange={handleTabChange} scrollable>
        {tabs.map((tab, index) => (
          <TabPanel
            key={tab.key}
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {tab.header}
                {index >= 5 && ( // Only show close icon for dynamically added tabs
                  <span
                    className="pi pi-times" // PrimeIcons close icon class
                    onClick={() => handleTabClose(tab.key)}
                    style={{
                      marginLeft: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: '#E03616', // Color of the close icon
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  />
                )}
              </div>
            }
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabView>
    ) : nodeData?.data?.organization ? (
      <div>
        <p>Organization Details:</p>
        <p>Dissolution Date: {nodeData.data.organization.dissolutionDate}</p>
        <p>Formation Date: {nodeData.data.organization.formationDate}</p>
        <p>Organization Description: {nodeData.data.organization.organizationDesc}</p>
        <p>Organization ID: {nodeData.data.organization.organizationID}</p>
        <p>Organization LOD: {nodeData.data.organization.organizationLOD}</p>
      </div>    
    ) : nodeData?.data?.religion ? (
      <div>
        <p>Religion Details:</p>
        <p>Religion name: {nodeData.data.religion.religionDesc}</p>
        <p>Religion ID: {nodeData.data.religion.religionID}</p>
      </div>        ) : (
      <p>No information has been created yet</p>
    )}
  </div>
  );
};

export default NodeDetails;